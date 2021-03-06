import { Component, h, Host, Listen, Prop, State } from '@stencil/core';
import { AsyncReturnType } from 'type-fest';
import { assertIsDefined, User } from '../../../shared';
import {
  FirestoreUpdatedEvent,
  href,
  PromiseState,
  pushRoute,
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

  @State()
  rerender = {};

  @Prop()
  app!: App;

  @Listen('FirestoreUpdated', { target: 'window' })
  handleFirestoreUpdated(event: FirestoreUpdatedEvent) {
    const { collection, id } = event.detail;
    if (collection == 'users') {
      this.userState = undefined;
      return;
    }
    if (collection == 'announces') {
      if (this.announceStateMap.has(id)) {
        this.announceStateMap.set(id, new PromiseState(this.loadAnnounce(id)));
      }
      this.rerender = {};
    }
  }

  @State()
  userState?: PromiseState<User>;

  @State()
  private announceStateMap = new Map<
    string,
    PromiseState<AsyncReturnType<AppHome['loadAnnounce']>>
  >();

  private async loadAnnounce(id: string) {
    const announce = await this.app.getAnnounceAndMeta(id);
    if (announce) {
      const info = {
        postCount: Object.keys(announce.posts).length,
      };
      return {
        announce,
        iconImgPromise: announce.icon
          ? new PromiseState(this.app.getImage(announce.icon))
          : undefined,
        info,
      };
    }
    return;
  }

  componentWillRender() {
    if (!this.userState) {
      const p = this.app.getUser();
      if (p) {
        this.userState = new PromiseState(p);
        this.userState.then(v => {
          if (v?.announces) {
            for (const id of v.announces) {
              this.announceStateMap.set(id, new PromiseState(this.loadAnnounce(id)));
            }
          }
        });
      }
    }
  }

  private handleSignOutClick = async () => {
    await this.app.signOut();
    pushRoute('/signin');
  };

  private renderContext() {
    const userStatus = this.userState?.status();
    assertIsDefined(userStatus);

    const user = this.userState?.result();
    const announces =
      user?.announces?.map(id => {
        const state = this.announceStateMap.get(id);
        assertIsDefined(state);
        const status = state.status();
        return {
          id,
          status,
        };
      }) || [];

    return {
      msgs: this.app.msgs,
      userStatus,
      announces,
      handleSignOutClick: this.handleSignOutClick,
    };
  }

  private headerButtons = [
    {
      label: this.app.msgs.common.about,
      href: '/about',
    },
    {
      label: this.app.msgs.home.signOut,
      handler: async () => {
        await this.app.signOut();
        pushRoute('/signin');
      },
    },
  ];

  render() {
    if (this.activePage) {
      setHeaderButtons(this.headerButtons);
      setDocumentTitle(this.app.msgs.home.pageTitle);
    }
    return render(this.renderContext());
  }
}

type RenderContext = ReturnType<AppHome['renderContext']>;

const render = (ctx: RenderContext) => {
  return (
    <Host>
      <div class="announces-grid">{renderAnnounces(ctx)}</div>
      <a class="create button" {...href('/create')}>
        {ctx.msgs.home.createAnnounceBtn}
      </a>
    </Host>
  );
};

const renderAnnounces = (ctx: RenderContext) => {
  switch (ctx.userStatus.state) {
    case 'pending':
      return <ap-spinner />;
    case 'rejected':
      return <span class="data-error">{ctx.msgs.home.dataError}</span>;
  }

  return ctx.announces.map(({ id, status }) => {
    switch (status.state) {
      case 'rejected':
        return (
          <a class="card">
            <div class="head">
              <span class="name">ID:{id}</span>
            </div>
            <span class="data-error">{ctx.msgs.home.dataError}</span>
          </a>
        );
      case 'fulfilled-empty':
        console.warn('missing own announce', id);
        return;
      case 'fulfilled': {
        const { announce, iconImgPromise, info } = status.value;
        return (
          <a class="card" {...href(`/${id}`)}>
            <div class="head">
              <span class="name">{announce.name}</span>
              {iconImgPromise && <ap-image srcPromise={iconImgPromise} />}
            </div>
            <span>?????????: {info.postCount}</span>
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
  });
};
