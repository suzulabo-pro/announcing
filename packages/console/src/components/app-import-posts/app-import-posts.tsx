import { bs62, ImportPostsRule } from '@announcing/shared';
import { Component, Fragment, h, Host, Listen, Prop, State, Watch } from '@stencil/core';
import nacl from 'tweetnacl';
import { AsyncReturnType } from 'type-fest';
import { App } from '../../app/app';
import { ApNaviLink, assertIsDefined, PromiseState, redirectRoute } from '../../shared';
import { isURL } from '../../utils/isurl';

const generateKeys = () => {
  const keys = nacl.box.keyPair();
  return { pubKey: bs62.encode(keys.publicKey), secKey: bs62.encode(keys.secretKey) };
};

@Component({
  tag: 'app-import-posts',
  styleUrl: 'app-import-posts.scss',
})
export class AppImportPosts {
  @Listen('PageActivated')
  listenPageActivated() {
    this.announceState = undefined;
  }

  @Prop()
  app!: App;

  @Prop()
  announceID!: string;

  @Watch('announceID')
  watchAnnounceID() {
    this.announceState = undefined;

    this.naviLinks = [
      {
        label: this.app.msgs.common.back,
        href: `/${this.announceID}/edit`,
        back: true,
      },
    ];
  }

  @State()
  values?: { url?: string; secKey?: string };

  @State()
  announceState?: PromiseState<AsyncReturnType<AppImportPosts['loadAnnounce']>>;

  private async loadAnnounce() {
    const id = this.announceID;

    const [announce, importPosts] = await Promise.all([
      this.app.getAnnounceAndMeta(id),
      this.app.getImportPosts(id),
    ]);

    if (announce) {
      return {
        announce,
        iconData: announce.icon ? await this.app.getImage(announce.icon) : undefined,
        importPosts,
      };
    }
    return;
  }

  private naviLinks!: ApNaviLink[];

  private handlers = {
    input: {
      importURL: (ev: Event) => {
        const url = (ev.target as HTMLInputElement).value;
        this.values = { ...this.values, url };
      },
    },
    submit: async () => {
      const values = this.values;
      if (!values) {
        return;
      }
      const keys = values.url ? generateKeys() : undefined;

      this.app.loading = true;
      try {
        await this.app.editImportPosts(this.announceID, values.url, keys?.pubKey);
        this.values = { ...values, secKey: keys?.secKey };
      } finally {
        this.app.loading = false;
      }
    },
  };

  componentWillLoad() {
    this.watchAnnounceID();
  }

  componentWillRender() {
    if (!this.announceState) {
      this.values = undefined;
      this.announceState = new PromiseState(this.loadAnnounce());
      this.announceState.then(value => {
        if (value) {
          if (value.importPosts) {
            this.values = { ...value.importPosts };
          }
        }
      });
    }
  }

  private renderContext() {
    const announceStatus = this.announceState?.status();
    assertIsDefined(announceStatus);

    const { announce, importPosts } = this.announceState?.result() || {};

    const values = this.values || {};
    const modified = values.url != importPosts?.url;

    const canSubmit = isURL(values.url) && modified && !values.secKey;

    return {
      msgs: this.app.msgs,
      announceID: this.announceID,
      values,
      announceStatus,
      handlers: this.handlers,
      canSubmit,
      naviLinks: this.naviLinks,
      pageTitle: announce
        ? this.app.msgs.announceEdit.pageTitle(announce.name)
        : this.app.msgs.common.pageTitle,
    };
  }

  render() {
    return render(this.renderContext());
  }
}

type RenderContext = ReturnType<AppImportPosts['renderContext']>;

const render = (ctx: RenderContext) => {
  return (
    <Host>
      {renderForm(ctx)}
      <ap-navi links={ctx.naviLinks} />
      <ap-head pageTitle={ctx.pageTitle} />
    </Host>
  );
};

const renderForm = (ctx: RenderContext) => {
  switch (ctx.announceStatus.state) {
    case 'pending':
      return <ap-spinner />;
    case 'rejected':
    case 'fulfilled-empty':
      redirectRoute(`/${ctx.announceID}`);
      return;
  }

  return (
    <Fragment>
      <div class="form">
        <ap-input
          label={ctx.msgs.importPosts.form.imageURL}
          value={ctx.values.url}
          onInput={ctx.handlers.input.importURL}
          maxLength={ImportPostsRule.url.length}
        />
        {ctx.values.secKey && (
          <div>
            <span class="ping-url">{`${location.origin}/import-posts/${ctx.announceID}/${ctx.values.secKey}`}</span>
          </div>
        )}
        <button class="submit" disabled={!ctx.canSubmit} onClick={ctx.handlers.submit}>
          {ctx.msgs.importPosts.form.btn}
        </button>
      </div>
    </Fragment>
  );
};
