import { Component, h, Host, Listen, Prop, State } from '@stencil/core';
import { AsyncReturnType } from 'type-fest';
import { assertIsDefined } from '../../../shared';
import {
  FirestoreUpdatedEvent,
  href,
  PromiseState,
  setDocumentTitle,
  setHeaderButtons,
} from '../../../shared-web';
import { App } from '../../app/app';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.scss',
})
export class AppHome {
  @Prop()
  activePage!: boolean;

  @Listen('AppBackButton', { target: 'window' })
  handleAppBackButton() {
    if (this.activePage) {
      this.app.exitApp();
    }
  }

  @Listen('FirestoreUpdated', { target: 'window' })
  handleFirestoreUpdated(event: FirestoreUpdatedEvent) {
    const { collection, id } = event.detail;
    if (collection == 'announces') {
      if (this.announceStateMap.has(id)) {
        this.announceStateMap.set(id, new PromiseState(this.loadAnnounce(id)));
      }
      this.rerender = {};
    }
  }

  @State()
  rerender = {};

  @Prop()
  app!: App;

  private announceStateMap = new Map<
    string,
    PromiseState<AsyncReturnType<AppHome['loadAnnounce']>>
  >();

  private async loadAnnounce(id: string) {
    const announce = await this.app.getAnnounceAndMeta(id);
    if (announce) {
      const latestPost = await this.app.getLatestPost(id, announce);
      return {
        announce,
        iconImgPromise: announce.icon
          ? new PromiseState(this.app.fetchImage(announce.icon))
          : undefined,
        latestPost,
      };
    }
    return;
  }

  componentWillRender() {
    const follows = this.app.getFollows();
    for (const [id] of follows) {
      if (!this.announceStateMap.has(id)) {
        this.announceStateMap.set(id, new PromiseState(this.loadAnnounce(id)));
      }
    }
  }

  private handleUnfollowClick = async (event: Event) => {
    const id = (event.target as HTMLElement).getAttribute('data-announce-id');
    if (id) {
      await this.app.processLoading(async () => {
        await this.app.deleteFollow(id);
      });
    }
  };

  private renderContext() {
    const follows = this.app.getFollows();
    const announces = follows.map(([id, follow]) => {
      const state = this.announceStateMap.get(id);
      assertIsDefined(state);
      const status = state.status();
      return {
        id,
        status,
        follow,
      };
    });

    const pT = (status: typeof announces[number]['status']) => {
      if (status.state == 'fulfilled') {
        return status.value.latestPost?.pT || 0;
      }
      return 0;
    };

    announces.sort((a1, a2) => {
      return pT(a2.status) - pT(a1.status);
    });

    return {
      msgs: this.app.msgs,
      announces,
      handleUnfollowClick: this.handleUnfollowClick,
    };
  }

  private headerButtons = [
    {
      label: this.app.msgs.home.config,
      href: '/config',
    },
    {
      label: this.app.msgs.home.about,
      href: '/about',
    },
  ];

  render() {
    if (this.activePage) {
      setDocumentTitle(this.app.msgs.home.pageTitle);
      setHeaderButtons(this.headerButtons);
    }

    return render(this.renderContext());
  }
}

type RenderContext = ReturnType<AppHome['renderContext']>;

const render = (ctx: RenderContext) => {
  return <Host>{renderContent(ctx)}</Host>;
};

const renderContent = (ctx: RenderContext) => {
  if (ctx.announces.length == 0) {
    return <div class="no-follows">{ctx.msgs.home.noFollows}</div>;
  }

  return (
    <div class="announces">
      {ctx.announces.map(v => {
        return renderAnnounce(ctx, v);
      })}
    </div>
  );
};

const renderAnnounce = (ctx: RenderContext, a: RenderContext['announces'][number]) => {
  const msgs = ctx.msgs;
  const { id, status, follow } = a;

  switch (status.state) {
    case 'rejected':
    case 'fulfilled-empty':
      return (
        <a class="card">
          <div class="main">
            <span class="name">{follow.name}</span>
            <span class="data-error">
              {status.state == 'rejected' ? msgs.home.dataError : msgs.home.notFound}
            </span>
            <button class="anchor" data-announce-id={id} onClick={ctx.handleUnfollowClick}>
              {msgs.home.unfollowBtn}
            </button>
          </div>
        </a>
      );
    case 'fulfilled': {
      const { announce, iconImgPromise, latestPost } = status.value;
      const hasNew = (latestPost?.pT || 0) > follow.readTime;

      return (
        <a class="card" {...href(`/${id}`)}>
          <div class="main">
            <span class="name">{announce.name}</span>
            {latestPost && (
              <div class="latest">
                {hasNew && <span class="badge">{msgs.home.newBadge}</span>}
                <span class="pT">{msgs.common.datetime(latestPost?.pT)}</span>
                <span class="title">{latestPost.title || latestPost.body}</span>
              </div>
            )}
          </div>
          {iconImgPromise && <ap-image srcPromise={iconImgPromise} />}
        </a>
      );
    }
    default:
      return (
        <a class="card">
          <ap-spinner />
        </a>
      );
  }
};
