import { Component, h, Host, Prop, State } from '@stencil/core';
import { ANNOUNCE_META_DESC_MAX_LENGTH, ANNOUNCE_META_NAME_MAX_LENGTH } from '../../../shared';
import { pushRoute, setDocumentTitle } from '../../../shared-web';
import { App } from '../../app/app';

@Component({
  tag: 'app-announce-create',
  styleUrl: 'app-announce-create.scss',
})
export class AppAnnounceCreate {
  @Prop()
  activePage!: boolean;

  @Prop()
  app!: App;

  @State()
  values = { name: '', desc: '' };

  private handlers = {
    input: {
      name: (ev: Event) => {
        this.values = { ...this.values, name: (ev.target as HTMLInputElement).value };
      },
      desc: (ev: Event) => {
        this.values = { ...this.values, desc: (ev.target as HTMLTextAreaElement).value };
      },
    },
    submit: async () => {
      await this.app.processLoading(async () => {
        await this.app.createAnnounce(this.values.name, this.values.desc);
        pushRoute('/', true);
      });
    },
  };

  private renderContext() {
    return {
      msgs: this.app.msgs,
      values: this.values,
      handlers: this.handlers,
    };
  }

  render() {
    if (this.activePage) {
      setDocumentTitle(this.app.msgs.announceCreate.pageTitle);
    }
    return render(this.renderContext());
  }
}

type RenderContext = ReturnType<AppAnnounceCreate['renderContext']>;

const render = (ctx: RenderContext) => {
  return (
    <Host>
      <div class="form">
        <ap-input
          label={ctx.msgs.announceCreate.form.name}
          value={ctx.values.name}
          maxLength={ANNOUNCE_META_NAME_MAX_LENGTH}
          onInput={ctx.handlers.input.name}
        />
        <ap-input
          textarea={true}
          label={ctx.msgs.announceCreate.form.desc}
          value={ctx.values.desc}
          maxLength={ANNOUNCE_META_DESC_MAX_LENGTH}
          onInput={ctx.handlers.input.desc}
        />
        <button class="submit" disabled={!ctx.values.name} onClick={ctx.handlers.submit}>
          {ctx.msgs.announceCreate.form.btn}
        </button>
      </div>
    </Host>
  );
};
