import { Component, Fragment, h, Host, Listen, Prop, State, Watch } from '@stencil/core';
import { AsyncReturnType } from 'type-fest';
import { href } from '../../../shared-web';
import { App } from '../../app/app';
import { assertIsDefined, FirestoreUpdatedEvent, PageVisible, PromiseState } from '../../shared';

@Component({
  tag: 'app-announce',
  styleUrl: 'app-announce.scss',
})
export class AppAnnounce {
  @Prop()
  pageVisible!: PageVisible;

  componentShouldUpdate() {
    return this.pageVisible.shouldUpdate();
  }

  @Prop()
  app!: App;

  @Prop()
  announceID!: string;

  @Watch('announceID')
  watchAnnounceID() {
    this.announceState = undefined;
  }

  @Listen('FirestoreUpdated', { target: 'window' }) handleFirestoreUpdated(
    event: FirestoreUpdatedEvent,
  ) {
    const { collection, id } = event.detail;
    if (collection == 'announces' && id == this.announceID) {
      this.announceState = undefined;
    }
  }

  @State()
  announceState?: PromiseState<AsyncReturnType<AppAnnounce['loadAnnounce']>>;

  private async loadAnnounce() {
    const id = this.announceID;
    const announce = await this.app.getAnnounceAndMeta(id);
    if (announce) {
      const postsPromises = this.app.getPosts(id, announce);

      Object.values(postsPromises).forEach(p => {
        p.lazyThen(post => {
          if (post) {
            void this.app.setReadTime(this.announceID, post.pT);
          }
        });
      });

      return {
        announce,
        iconImgPromise: announce.icon
          ? new PromiseState(this.app.fetchImage(announce.icon))
          : undefined,
        postsPromises,
      };
    }
    return;
  }

  componentWillLoad() {
    this.watchAnnounceID();
  }

  componentWillRender() {
    if (!this.announceState) {
      this.announceState = new PromiseState(this.loadAnnounce());
    }
  }

  private renderContext() {
    const announceStatus = this.announceState?.status();
    assertIsDefined(announceStatus);
    const icons = {
      follow: this.app.getFollow(this.announceID) != null,
      notification: this.app.getNotification(this.announceID) != null,
    };
    const { announce } = this.announceState?.result() || {};
    const pageTitle = announce
      ? this.app.msgs.announce.pageTitle(announce.name)
      : this.app.msgs.common.pageTitle;
    return {
      msgs: this.app.msgs,
      announceID: this.announceID,
      announceStatus,
      icons,
      pageTitle,
    };
  }

  render() {
    return render(this.renderContext());
  }
}

type RenderContext = ReturnType<AppAnnounce['renderContext']>;

const render = (ctx: RenderContext) => {
  return (
    <Host>
      {renderContent(ctx)}
      <ap-head pageTitle={ctx.pageTitle} />
    </Host>
  );
};

const renderContent = (ctx: RenderContext) => {
  switch (ctx.announceStatus.state) {
    case 'rejected':
      return (
        <Fragment>
          <div class="data-error">{ctx.msgs.announce.dataError}</div>
        </Fragment>
      );
    case 'fulfilled-empty':
      return (
        <Fragment>
          <div class="deleted">{ctx.msgs.announce.deleted}</div>
        </Fragment>
      );

    case 'fulfilled': {
      const { announce, iconImgPromise, postsPromises } = ctx.announceStatus.value;

      return (
        <Fragment>
          <ap-announce
            announce={announce}
            iconImgPromise={iconImgPromise}
            icons={ctx.icons}
            showDetails={true}
          >
            <a slot="above-name" class="buttons" {...href(`/${ctx.announceID}/config`)}>
              <button class={`slim follow ${ctx.icons?.follow && 'following'}`}>
                {ctx.icons?.follow ? ctx.msgs.announce.following : ctx.msgs.announce.follow}
              </button>
              <button class="slim notification">
                <ap-icon icon={ctx.icons?.notification ? 'bell' : 'bellSlash'} />
              </button>
            </a>
          </ap-announce>
          <ap-posts
            posts={announce.posts}
            postsPromises={postsPromises}
            hrefFormat={`/${ctx.announceID}/:postID`}
            msgs={{
              datetime: ctx.msgs.common.datetime,
              dataError: ctx.msgs.announce.dataError,
            }}
          />
        </Fragment>
      );
    }
    default:
      return <ap-spinner />;
  }
};
