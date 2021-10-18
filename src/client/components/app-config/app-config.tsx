import { Component, Fragment, h, Host, Prop } from '@stencil/core';
import { App } from '../../app/app';
import { ClientConfig } from '../../app/datatypes';

@Component({
  tag: 'app-config',
  styleUrl: 'app-config.scss',
})
export class AppConfig {
  @Prop()
  app!: App;

  private async toggleConfig(key: keyof ClientConfig) {
    const config = this.app.getConfig() || {};
    config[key] = !config[key];
    await this.app.setConfig(config);
  }

  private handlers = {
    embedTwitter: async () => {
      await this.toggleConfig('embedTwitter');
    },
    embedYoutube: async () => {
      await this.toggleConfig('embedYoutube');
    },
  };

  private renderContext() {
    return {
      msgs: this.app.msgs,
      config: this.app.getConfig() || {},
      handlers: this.handlers,
      pageTitle: this.app.msgs.config.pageTitle,
    };
  }

  render() {
    return render(this.renderContext());
  }
}

type RenderContext = ReturnType<AppConfig['renderContext']>;

const render = (ctx: RenderContext) => {
  return (
    <Host>
      {renderForm(ctx)}
      <ap-head pageTitle={ctx.pageTitle} />
    </Host>
  );
};

const renderForm = (ctx: RenderContext) => {
  return (
    <Fragment>
      <div class="form">
        <ap-checkbox
          label={ctx.msgs.config.embedTwitter}
          checked={ctx.config.embedTwitter}
          onClick={ctx.handlers.embedTwitter}
        />
        <ap-textview class="desc" text={ctx.msgs.config.embedTwitterDesc} />
        <hr />
        <ap-checkbox
          label={ctx.msgs.config.embedYoutube}
          checked={ctx.config.embedYoutube}
          onClick={ctx.handlers.embedYoutube}
        />
        <ap-textview class="desc" text={ctx.msgs.config.embedYoutubeDesc} />
      </div>
    </Fragment>
  );
};
