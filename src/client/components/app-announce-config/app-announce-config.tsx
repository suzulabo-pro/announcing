import { Component, Fragment, h, Host, Listen, Prop, State, Watch } from '@stencil/core';
import { AsyncReturnType } from 'type-fest';
import { setDocumentTitle } from '../../../shared-web';
import { App } from '../../app/app';
import { assertIsDefined, FirestoreUpdatedEvent, PromiseState, redirectRoute } from '../../shared';

@Component({
  tag: 'app-announce-config',
  styleUrl: 'app-announce-config.scss',
})
export class AppAnnounceConfig {
  @Prop()
  activePage!: boolean;

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
  announceState?: PromiseState<AsyncReturnType<AppAnnounceConfig['loadAnnounce']>>;

  @State()
  permission?: AsyncReturnType<App['checkNotifyPermission']>;

  private async loadAnnounce(id: string) {
    const announce = await this.app.getAnnounceAndMeta(id);
    if (announce) {
      return {
        announce,
        iconImgPromise: announce.icon
          ? new PromiseState(this.app.fetchImage(announce.icon))
          : undefined,
      } as const;
    }
    return;
  }

  componentWillLoad() {
    this.watchAnnounceID();
  }

  private handleEnableNotifyClick = async () => {
    await this.app.processLoading(async () => {
      await this.app.setNotify(this.announceID, true);
      this.permission = await this.app.checkNotifyPermission(false);
    });
  };

  private handleDisableNotifyClick = async () => {
    await this.app.processLoading(async () => {
      await this.app.setNotify(this.announceID, false);
    });
  };

  private handleUnfollowClick = async () => {
    await this.app.processLoading(async () => {
      await this.app.deleteFollow(this.announceID);
    });
  };

  private handleFollowClick = async () => {
    await this.app.processLoading(async () => {
      const a = this.announceState?.result();
      if (a) {
        const name = a.announce.name;
        const latestPost = await this.app.getLatestPost(this.announceID, a.announce);
        const readTime = latestPost?.pT || 0;
        await this.app.setFollow(this.announceID, { name, readTime });
      } else {
        // never
      }
    });
  };

  async componentWillRender() {
    if (!this.announceState) {
      this.announceState = new PromiseState(this.loadAnnounce(this.announceID));
    }
    this.permission = await this.app.checkNotifyPermission(false);
  }

  private renderContext() {
    const announceStatus = this.announceState?.status();
    assertIsDefined(announceStatus);
    const icons = {
      follow: this.app.getFollow(this.announceID) != null,
      notification: this.app.getNotification(this.announceID) != null,
    };

    return {
      msgs: this.app.msgs,
      announceID: this.announceID,
      announceStatus,
      permission: this.permission,
      icons,
      handleUnfollowClick: this.handleUnfollowClick,
      handleFollowClick: this.handleFollowClick,
      handleEnableNotifyClick: this.handleEnableNotifyClick,
      handleDisableNotifyClick: this.handleDisableNotifyClick,
    };
  }

  render() {
    if (this.activePage) {
      const { announce } = this.announceState?.result() || {};
      const docTitle = announce
        ? this.app.msgs.announceConfig.pageTitle(announce.name)
        : this.app.msgs.common.pageTitle;
      setDocumentTitle(docTitle);
    }
    return render(this.renderContext());
  }
}

type RenderContext = ReturnType<AppAnnounceConfig['renderContext']>;

const render = (ctx: RenderContext) => {
  return <Host>{renderContent(ctx)}</Host>;
};

const renderContent = (ctx: RenderContext) => {
  switch (ctx.announceStatus.state) {
    case 'rejected':
    case 'fulfilled-empty':
      redirectRoute(`/${ctx.announceID}`);
      return;
    case 'fulfilled': {
      const { announce, iconImgPromise } = ctx.announceStatus.value;

      return (
        <Fragment>
          <ap-announce announce={announce} iconImgPromise={iconImgPromise} icons={ctx.icons} />
          <div class="follow">
            {ctx.icons.follow ? (
              <button onClick={ctx.handleUnfollowClick}>
                {ctx.msgs.announceConfig.unfollowBtn}
              </button>
            ) : (
              <button onClick={ctx.handleFollowClick}>{ctx.msgs.announceConfig.followBtn}</button>
            )}
          </div>
          <div class="notify">{renderNotification(ctx)}</div>
        </Fragment>
      );
    }
    default:
      return <ap-spinner />;
  }
};

const renderNotification = (ctx: RenderContext) => {
  switch (ctx.permission) {
    case 'unsupported':
      return (
        <div class="warn">
          <ap-icon icon="frown" />
          <div>{ctx.msgs.announceConfig.unsupported}</div>
        </div>
      );
    case 'denied':
      return (
        <div class="warn">
          <ap-icon icon="dizzy" />
          <div>{ctx.msgs.announceConfig.notPermitted}</div>
        </div>
      );
    default:
      return (
        <Fragment>
          {!ctx.icons.notification && (
            <button class="submit" onClick={ctx.handleEnableNotifyClick}>
              {ctx.msgs.announceConfig.enableNotifyBtn}
            </button>
          )}
          {ctx.icons.notification && (
            <button class="submit" onClick={ctx.handleDisableNotifyClick}>
              {ctx.msgs.announceConfig.disableNotifyBtn}
            </button>
          )}
        </Fragment>
      );
  }
};
