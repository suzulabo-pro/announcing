import { Component, h, Host, Listen, Prop, State, Watch } from '@stencil/core';
import { AsyncReturnType } from 'type-fest';
import { setHeaderButtons } from '../../../shared-web';
import { App } from '../../app/app';
import {
  assertIsDefined,
  bs62,
  FirestoreUpdatedEvent,
  PageVisible,
  PromiseState,
  redirectRoute,
} from '../../shared';

@Component({
  tag: 'app-post',
  styleUrl: 'app-post.scss',
})
export class AppPost {
  @Prop()
  pageVisible!: PageVisible;

  componentShouldUpdate() {
    return this.pageVisible.shouldUpdate();
  }

  @Listen('PageActivated')
  PageDeactivated() {
    this.rerender = {};
    if (this.app.checkShareSupport()) {
      setHeaderButtons([{ label: this.app.msgs.post.share, handler: this.shareClick }]);
    }
  }

  @Listen('PageDeactivated')
  listenPageActivated() {
    this.rerender = {};
  }

  @State()
  rerender = {};

  @Prop()
  app!: App;

  @Prop()
  announceID!: string;

  @Watch('announceID')
  watchAnnounceID() {
    this.announceState = undefined;
  }

  @Prop()
  postID!: string;

  @Watch('postID')
  watchPostID() {
    this.postState = undefined;
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
  announceState?: PromiseState<AsyncReturnType<AppPost['loadAnnounce']>>;

  @State()
  postState?: PromiseState<AsyncReturnType<AppPost['loadPost']>>;

  private async loadAnnounce() {
    const id = this.announceID;
    const announce = await this.app.getAnnounceAndMeta(id);
    if (announce) {
      return {
        announce,
        iconImgPromise: announce.icon
          ? new PromiseState(this.app.fetchImage(announce.icon))
          : undefined,
      };
    }
    return;
  }

  private async loadPost() {
    const id = this.announceID;
    const postID = this.postID;
    const post = await this.app.fetchPost(id, postID);
    if (post) {
      await this.app.setReadTime(this.announceID, post.pT);

      return {
        post,
        imgPromise: post.img ? new PromiseState(this.app.fetchImage(post.img)) : undefined,
        imgHref: post.img ? `/${this.announceID}/${this.postID}/image/${post.img}` : undefined,
        imgs: post.imgs
          ? post.imgs.map(v => {
              const v62 = bs62.encode(new TextEncoder().encode(v));
              return {
                srcPromise: new PromiseState(this.app.fetchImage(v)),
                href: `/${this.announceID}/${this.postID}/image_uri/${v62}`,
              };
            })
          : undefined,
      };
    }
    return;
  }

  private shareClick = async () => {
    try {
      await this.app.share(`${this.app.clientSite}/${this.announceID}/${this.postID}`);
    } catch {
      //
    }
  };

  componentWillLoad() {
    this.watchAnnounceID();
  }

  componentWillRender() {
    if (!this.announceState) {
      this.announceState = new PromiseState(this.loadAnnounce());
    }
    if (!this.postState) {
      this.postState = new PromiseState(this.loadPost());
    }
  }

  private renderContext() {
    const announceStatus = this.announceState?.status();
    assertIsDefined(announceStatus);
    const postStatus = this.postState?.status();
    assertIsDefined(postStatus);
    const icons = {
      follow: this.app.getFollow(this.announceID) != null,
      notification: this.app.getNotification(this.announceID) != null,
    };
    const { announce } = this.announceState?.result() || {};
    const { post } = this.postState?.result() || {};
    const pageTitle =
      announce && post
        ? this.app.msgs.post.pageTitle(
            announce.name,
            post?.title || post?.body?.substr(0, 20) || '',
          )
        : this.app.msgs.common.pageTitle;
    return {
      msgs: this.app.msgs,
      announceID: this.announceID,
      announceStatus,
      postStatus,
      icons,
      config: this.app.getConfig() || {},
      pageTitle,
      pageVisible: this.pageVisible,
    };
  }

  render() {
    return render(this.renderContext());
  }
}

type RenderContext = ReturnType<AppPost['renderContext']>;

const render = (ctx: RenderContext) => {
  return (
    <Host>
      {renderAnnounce(ctx)}
      {renderPost(ctx)}
      <ap-head pageTitle={ctx.pageTitle} />
    </Host>
  );
};

const renderAnnounce = (ctx: RenderContext) => {
  const status = ctx.announceStatus;

  switch (status.state) {
    case 'rejected':
    case 'fulfilled-empty':
      redirectRoute(`/${ctx.announceID}`);
      return;
    case 'fulfilled': {
      const { announce, iconImgPromise } = status.value;
      return <ap-announce announce={announce} iconImgPromise={iconImgPromise} icons={ctx.icons} />;
    }
    default:
      return <ap-spinner />;
  }
};

const renderPost = (ctx: RenderContext) => {
  if (ctx.announceStatus.state != 'fulfilled') return;

  const status = ctx.postStatus;

  switch (status.state) {
    case 'rejected':
    case 'fulfilled-empty':
      redirectRoute(`/${ctx.announceID}`);
      return;
    case 'fulfilled': {
      const { post, imgPromise, imgHref, imgs } = status.value;

      return (
        <ap-post
          post={post}
          imgPromise={imgPromise}
          imgHref={imgHref}
          imgs={imgs}
          msgs={{ datetime: ctx.msgs.common.datetime }}
          showTweet={ctx.pageVisible.isVisible() && ctx.config.embedTwitter}
          showYoutube={ctx.pageVisible.isVisible() && ctx.config.embedYoutube}
        />
      );
    }
    default:
      return <ap-spinner />;
  }
};
