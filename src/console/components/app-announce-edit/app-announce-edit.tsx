import { Component, Fragment, h, Host, Prop, State, Watch } from '@stencil/core';
import { AsyncReturnType } from 'type-fest';
import { setDocumentTitle } from '../../../shared-web';
import { App } from '../../app/app';
import {
  ANNOUNCE_META_DESC_MAX_LENGTH,
  ANNOUNCE_META_LINK_MAX_LENGTH,
  ANNOUNCE_META_NAME_MAX_LENGTH,
  assertIsDefined,
  PromiseState,
  pushRoute,
  redirectRoute,
} from '../../shared';
import { isURL } from '../../utils/isurl';

@Component({
  tag: 'app-announce-edit',
  styleUrl: 'app-announce-edit.scss',
})
export class AppAnnounceEdit {
  @Prop()
  activePage!: boolean;

  @Prop()
  app!: App;

  @Prop()
  announceID!: string;

  @Watch('activePage')
  @Watch('announceID')
  watchAnnounceID() {
    this.announceState = undefined;
    this.showDeletion = false;
    this.showDeleteConfirm = false;
  }

  @State()
  values?: { name?: string; desc?: string; link?: string; icon?: string; iconData?: string };

  @State()
  showDeletion = false;

  @State()
  showDeleteConfirm = false;

  @State()
  announceState?: PromiseState<AsyncReturnType<AppAnnounceEdit['loadAnnounce']>>;

  private async loadAnnounce() {
    const id = this.announceID;
    const announce = await this.app.getAnnounceAndMeta(id);
    if (announce) {
      return {
        announce,
        iconData: announce.icon ? await this.app.getImage(announce.icon) : undefined,
      };
    }
    return;
  }

  private handlers = {
    input: {
      name: (ev: Event) => {
        this.values = { ...this.values, name: (ev.target as HTMLInputElement).value };
      },
      desc: (ev: Event) => {
        this.values = { ...this.values, desc: (ev.target as HTMLTextAreaElement).value };
      },
      link: (ev: Event) => {
        this.values = { ...this.values, link: (ev.target as HTMLInputElement).value };
      },
    },
    image: {
      change: (ev: CustomEvent<string>) => {
        this.values = { ...this.values, icon: undefined, iconData: ev.detail };
      },
    },
    deletion: {
      toggle: () => {
        this.showDeletion = !this.showDeletion;
      },

      show: () => {
        this.showDeleteConfirm = true;
      },

      close: () => {
        this.showDeleteConfirm = false;
      },
      deleteClick: async () => {
        this.showDeleteConfirm = false;
        await this.app.processLoading(async () => {
          await this.app.deleteAnnounce(this.announceID);
          pushRoute('/');
        });
      },
    },
    submit: async () => {
      await this.app.processLoading(async () => {
        if (!this.values?.name) {
          return;
        }
        await this.app.editAnnounce(
          this.announceID,
          this.values.name,
          this.values.desc,
          this.values.link,
          this.values.icon,
          this.values.icon ? undefined : this.values.iconData?.split(',')[1],
        );
        pushRoute(`/${this.announceID}`);
      });
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
          const { announce, iconData } = value;
          this.values = {
            ...announce,
            iconData,
          };
        }
      });
    }
  }

  private renderContext() {
    const announceStatus = this.announceState?.status();
    assertIsDefined(announceStatus);

    const { announce, iconData } = this.announceState?.result() || {};

    const values = this.values || {};
    const modified =
      values.name != announce?.name ||
      values.desc != announce?.desc ||
      values.link != announce?.link ||
      values.icon != announce?.icon ||
      values.iconData != iconData;

    const canSubmit = !!values.name && isURL(values.link) && modified;

    return {
      msgs: this.app.msgs,
      announceID: this.announceID,
      values,
      announceStatus,
      canSubmit,
      showDeletion: this.showDeletion,
      showDeleteConfirm: this.showDeleteConfirm,
      handlers: this.handlers,
    };
  }

  render() {
    if (this.activePage) {
      const { announce } = this.announceState?.result() || {};
      const docTitle = announce
        ? this.app.msgs.announceEdit.pageTitle(announce.name)
        : this.app.msgs.common.pageTitle;
      setDocumentTitle(docTitle);
    }

    return render(this.renderContext());
  }
}

type RenderContext = ReturnType<AppAnnounceEdit['renderContext']>;

const render = (ctx: RenderContext) => {
  return <Host>{renderForm(ctx)}</Host>;
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

  const { announce } = ctx.announceStatus.value;

  return (
    <Fragment>
      <div class="form">
        <ap-image-input
          label={ctx.msgs.announceEdit.form.icon}
          data={ctx.values.iconData}
          resizeRect={{ width: 200, height: 200 }}
          border={true}
          onImageChange={ctx.handlers.image.change}
        />
        <ap-input
          label={ctx.msgs.announceEdit.form.name}
          value={ctx.values.name}
          onInput={ctx.handlers.input.name}
          maxLength={ANNOUNCE_META_NAME_MAX_LENGTH}
        />
        <ap-input
          textarea={true}
          label={ctx.msgs.announceEdit.form.desc}
          value={ctx.values.desc}
          onInput={ctx.handlers.input.desc}
          maxLength={ANNOUNCE_META_DESC_MAX_LENGTH}
        />
        <ap-input
          label={ctx.msgs.announceEdit.form.link}
          value={ctx.values.link}
          onInput={ctx.handlers.input.link}
          maxLength={ANNOUNCE_META_LINK_MAX_LENGTH}
        />
        <button class="submit" disabled={!ctx.canSubmit} onClick={ctx.handlers.submit}>
          {ctx.msgs.announceEdit.form.btn}
        </button>
      </div>
      <button class="clear deletion-toggle" onClick={ctx.handlers.deletion.toggle}>
        {ctx.msgs.announceEdit.deletion.guide}
      </button>
      {ctx.showDeletion && (
        <Fragment>
          <div class="deletion">
            <div>{ctx.msgs.announceEdit.deletion.desc}</div>
            <button onClick={ctx.handlers.deletion.show}>
              {ctx.msgs.announceEdit.deletion.btn(announce.name)}
            </button>
          </div>
        </Fragment>
      )}
      {ctx.showDeleteConfirm && (
        <ap-modal onClose={ctx.handlers.deletion.close}>
          <div class="delete-modal">
            <div>{ctx.msgs.announceEdit.deletion.confirm}</div>
            <div class="buttons">
              <button onClick={ctx.handlers.deletion.close}>{ctx.msgs.common.cancel}</button>
              <button onClick={ctx.handlers.deletion.deleteClick}>{ctx.msgs.common.ok}</button>
            </div>
          </div>
        </ap-modal>
      )}
    </Fragment>
  );
};
