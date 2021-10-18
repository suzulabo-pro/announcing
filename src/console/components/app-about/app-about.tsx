import { Component, Fragment, h, Host, Prop } from '@stencil/core';
import { setDocumentTitle } from '../../../shared-web';
import { App } from '../../app/app';

@Component({
  tag: 'app-about',
  styleUrl: 'app-about.scss',
})
export class AppAbout {
  @Prop()
  activePage!: boolean;

  @Prop()
  app!: App;

  private renderContext() {
    return {
      msgs: this.app.msgs,
      manualSite: this.app.manualSite,
      buildInfo: this.app.buildInfo,
    };
  }

  render() {
    if (this.activePage) {
      setDocumentTitle(this.app.msgs.about.pageTitle);
    }
    return render(this.renderContext());
  }
}

type RenderContext = ReturnType<AppAbout['renderContext']>;

const render = (ctx: RenderContext) => {
  return <Host>{renderForm(ctx)}</Host>;
};

const renderForm = (ctx: RenderContext) => {
  return (
    <Fragment>
      <div class="manual">
        <a href={ctx.manualSite} target="manual" rel="noopener">
          {ctx.msgs.about.manualLink}
        </a>
      </div>
      <div class="about">
        <span class="name">Announcing♪ Console</span>
        <span class="version">Version: {ctx.buildInfo.src}</span>
        <span class="build-time">Built at: {new Date(ctx.buildInfo.time).toISOString()}</span>
        <a href={ctx.buildInfo.repo} target="_blank" rel="noopener">
          <ap-icon icon="github" />
        </a>
      </div>
    </Fragment>
  );
};
