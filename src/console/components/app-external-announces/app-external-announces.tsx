import { Component, h, Host, Listen, Prop, State } from '@stencil/core';
import { AsyncReturnType } from 'type-fest';
import { ExternalAnnounce } from '../../../shared';
import { FirestoreUpdatedEvent, setDocumentTitle } from '../../../shared-web';
import { App } from '../../app/app';
import { assertIsDefined, href, PromiseState } from '../../shared';

@Component({
  tag: 'app-external-announces',
  styleUrl: 'app-external-announces.scss',
})
export class AppExternalAnnounces {
  @Prop()
  activePage!: boolean;

  @State()
  rerender = {};

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

  private renderContext() {
    const dataStatus = this.dataState?.status();
    assertIsDefined(dataStatus);

    return {
      msgs: this.app.msgs,
      dataStatus,
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
      <a class="create button" {...href('/create')}>
        {ctx.msgs.home.createAnnounceBtn}
      </a>
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
            {id}
            {v?.urlPrefixes}
            {v?.desc}
          </div>
        );
      });
    }
    default:
      return <ap-spinner />;
  }
};
