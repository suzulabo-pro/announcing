import { AnnounceOptionRule } from '@announcing/shared';
import { Component, Fragment, h, Host, Listen, Prop, State, Watch } from '@stencil/core';
import { AsyncReturnType } from 'type-fest';
import { App } from '../../app/app';
import { ApNaviLink, assertIsDefined, PromiseState, pushRoute, redirectRoute } from '../../shared';
import { isURL } from '../../utils/isurl';
import { generateImportToken } from '../../utils/token';

@Component({
  tag: 'app-announce-option',
  styleUrl: 'app-announce-option.scss',
})
export class AppAnnounceOption {
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
        href: `/${this.announceID}`,
        back: true,
      },
    ];
  }

  @State()
  values?: { importURL?: string; importToken?: string };

  @State()
  announceState?: PromiseState<AsyncReturnType<AppAnnounceOption['loadAnnounce']>>;

  private async loadAnnounce() {
    const id = this.announceID;

    const [announce, announceOption] = await Promise.all([
      this.app.getAnnounceAndMeta(id),
      this.app.getAnnounceOption(id),
    ]);

    if (announce) {
      return {
        announce,
        iconData: announce.icon ? await this.app.getImage(announce.icon) : undefined,
        announceOption,
      };
    }
    return;
  }

  private naviLinks!: ApNaviLink[];

  private handlers = {
    input: {
      importURL: (ev: Event) => {
        const importURL = (ev.target as HTMLInputElement).value;
        this.values = { ...this.values, importURL };
        if (isURL(importURL) && !this.values.importToken) {
          this.values.importToken = generateImportToken();
        }
      },
    },
    submit: async () => {
      this.app.loading = true;
      try {
        await this.app.editAnnounceOption(
          this.announceID,
          this.values?.importURL,
          this.values?.importToken,
        );
        pushRoute(`/${this.announceID}`);
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
        console.log(value);
        if (value) {
          if (value.announceOption) {
            this.values = { ...value.announceOption };
          }
        }
      });
    }
  }

  private renderContext() {
    const announceStatus = this.announceState?.status();
    assertIsDefined(announceStatus);

    const { announce } = this.announceState?.result() || {};

    const values = this.values || {};

    const canSubmit = true;

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

type RenderContext = ReturnType<AppAnnounceOption['renderContext']>;

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
          label={ctx.msgs.announceOption.form.imageURL}
          value={ctx.values.importURL}
          onInput={ctx.handlers.input.importURL}
          maxLength={AnnounceOptionRule.importURL.length}
        />
        {ctx.values.importToken && (
          <div>
            <span class="ping-url">{ctx.values.importToken}</span>
            <button class="submit" disabled={!ctx.canSubmit} onClick={ctx.handlers.submit}>
              {ctx.msgs.announceOption.form.tokenBtn}
            </button>
          </div>
        )}
        <button class="submit" disabled={!ctx.canSubmit} onClick={ctx.handlers.submit}>
          {ctx.msgs.announceOption.form.btn}
        </button>
      </div>
    </Fragment>
  );
};
