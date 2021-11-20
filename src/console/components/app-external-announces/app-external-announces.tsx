import { Component, h, Host, Listen, Prop, State } from '@stencil/core';
import md5 from 'js-md5';
import nacl from 'tweetnacl';
import { AsyncReturnType } from 'type-fest';
import { bs62, ExternalAnnounce } from '../../../shared';
import { FirestoreUpdatedEvent, setDocumentTitle } from '../../../shared-web';
import { App } from '../../app/app';
import { assertIsDefined, PromiseState } from '../../shared';

@Component({
  tag: 'app-external-announces',
  styleUrl: 'app-external-announces.scss',
})
export class AppExternalAnnounces {
  @Prop()
  activePage!: boolean;

  @Prop()
  app!: App;

  @Listen('FirestoreUpdated', { target: 'window' })
  handleFirestoreUpdated(event: FirestoreUpdatedEvent) {
    const { collection } = event.detail;
    if (collection == 'users') {
      this.dataState = undefined;
      return;
    }
  }

  @State()
  dataState?: PromiseState<AsyncReturnType<AppExternalAnnounces['loadData']>>;

  @State()
  formValues?: { urlPrefixes: string; keys: { pubKey: string; secKey: string }[]; desc?: string };

  @State()
  deleteConfirmID?: string;

  private async loadData() {
    const user = await this.app.getUser();
    const ids = user?.externalAnnounces;
    if (!user || !ids) {
      return;
    }

    const externalAnnounces = await Promise.all(
      ids.map(async id => {
        return [id, await this.app.getExternalAnnounce(id)] as [
          string,
          ExternalAnnounce | undefined,
        ];
      }),
    );

    return { externalAnnounces };
  }

  componentWillRender() {
    if (!this.dataState) {
      this.dataState = new PromiseState(this.loadData());
    }
  }

  private handlers = {
    addBtnClick: () => {
      this.formValues = {
        urlPrefixes: '',
        keys: [],
      };
    },
    formClose: () => {
      this.formValues = undefined;
    },
    addKeyBtnClick: () => {
      if (!this.formValues) {
        return;
      }
      const keyPair = nacl.box.keyPair();
      const pubKey = bs62.encode(keyPair.publicKey);
      const secKey = bs62.encode(keyPair.secretKey);

      this.formValues.keys.push({ pubKey, secKey });
      this.formValues = { ...this.formValues };
    },
    urlPrefixesInput: (ev: Event) => {
      if (!this.formValues) {
        return;
      }
      this.formValues.urlPrefixes = (ev.target as HTMLApInputElement).value || '';
      this.formValues = { ...this.formValues };
    },
    descInput: (ev: Event) => {
      if (!this.formValues) {
        return;
      }
      this.formValues.desc = (ev.target as HTMLApInputElement).value || '';
      this.formValues = { ...this.formValues };
    },
    submit: () => {
      return this.app.processLoading(async () => {
        if (!this.formValues) {
          return;
        }
        await this.app.putExternalAnnounce(
          this.formValues.urlPrefixes.split('¥r¥n'),
          this.formValues.keys.map(v => v.pubKey),
          this.formValues.desc,
        );
        this.formValues = undefined;
      });
    },
    delBtnClick: (ev: Event) => {
      const id = (ev.currentTarget as HTMLElement).getAttribute('data-id');
      console.log(id, ev.target);
      if (!id) {
        return;
      }
      this.deleteConfirmID = id;
    },
    deleteConfirmClick: async () => {
      const id = this.deleteConfirmID;
      if (!id) {
        return;
      }
      await this.app.processLoading(async () => {
        await this.app.deleteExternalAnnounce(id);
      });
      this.deleteConfirmID = undefined;
    },
    deleteConfirmClose: () => {
      this.deleteConfirmID = undefined;
    },
  };

  private renderContext() {
    const dataStatus = this.dataState?.status();
    assertIsDefined(dataStatus);

    return {
      msgs: this.app.msgs,
      dataStatus,
      formValues: this.formValues,
      deleteConfirmID: this.deleteConfirmID,
      handlers: this.handlers,
    };
  }

  render() {
    if (this.activePage) {
      setDocumentTitle(this.app.msgs.externalAnnounces.pageTitle);
    }
    return render(this.renderContext());
  }
}

type RenderContext = ReturnType<AppExternalAnnounces['renderContext']>;

const render = (ctx: RenderContext) => {
  return (
    <Host>
      <div class="announces-grid">{renderAnnounces(ctx)}</div>
      <button class="create" onClick={ctx.handlers.addBtnClick}>
        <ap-icon icon="plus" />
      </button>
      {renderForm(ctx)}
      {renderDeleteConfirm(ctx)}
    </Host>
  );
};

const renderAnnounces = (ctx: RenderContext) => {
  switch (ctx.dataStatus.state) {
    case 'rejected':
      return <span class="data-error">{ctx.msgs.externalAnnounces.dataError}</span>;
    case 'fulfilled-empty':
      return <span class="no-data">{ctx.msgs.externalAnnounces.noData}</span>;
    case 'fulfilled': {
      const value = ctx.dataStatus.value;
      return value.externalAnnounces.map(([id, v]) => {
        return (
          <div>
            {id} -{getHash(id)} -{v?.urlPrefixes} -{v?.desc}
            <button class="icon" data-id={id} onClick={ctx.handlers.delBtnClick}>
              <ap-icon icon="trash" />
            </button>
          </div>
        );
      });
    }
    default:
      return <ap-spinner />;
  }
};

const renderForm = (ctx: RenderContext) => {
  const formValues = ctx.formValues;
  if (!formValues) {
    return;
  }

  return (
    <ap-modal onClose={ctx.handlers.formClose}>
      <div class="form-modal">
        <ap-input
          label={ctx.msgs.externalAnnounces.form.urlPrefixes}
          textarea={true}
          value={formValues.urlPrefixes}
          onInput={ctx.handlers.urlPrefixesInput}
        />
        <div class="keys">
          <div>{ctx.msgs.externalAnnounces.form.requestKeys}</div>
          <div>
            {ctx.formValues?.keys.map(v => {
              return (
                <div class="key">
                  {v.pubKey}/{v.secKey}
                </div>
              );
            })}
          </div>
          <div>
            <button class="icon" onClick={ctx.handlers.addKeyBtnClick}>
              <ap-icon icon="plus" />
            </button>
          </div>
        </div>
        <ap-input
          label={ctx.msgs.externalAnnounces.form.desc}
          textarea={true}
          value={formValues.desc}
          onInput={ctx.handlers.descInput}
        />
        <div>
          <button onClick={ctx.handlers.submit}>{ctx.msgs.externalAnnounces.form.submit}</button>
        </div>
      </div>
    </ap-modal>
  );
};

const renderDeleteConfirm = (ctx: RenderContext) => {
  if (!ctx.deleteConfirmID) {
    return;
  }

  return (
    <ap-modal onClose={ctx.handlers.deleteConfirmClose}>
      <div class="delete-modal">
        <div>{ctx.msgs.externalAnnounces.deleteConfirm}</div>
        <div class="buttons">
          <button onClick={ctx.handlers.deleteConfirmClose}>{ctx.msgs.common.cancel}</button>
          <button onClick={ctx.handlers.deleteConfirmClick}>{ctx.msgs.common.ok}</button>
        </div>
      </div>
    </ap-modal>
  );
};

const getHash = (id: string) => {
  return bs62.encode(md5.array(id));
};
