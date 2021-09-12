import { Component, Fragment, h, Host, Prop, State, Watch } from '@stencil/core';
import { App } from '../../app/app';
import { bs62 } from '../../app/utils';
import { ApNaviLink, assertIsDefined, PromiseState, redirectRoute } from '../../shared';

@Component({
  tag: 'app-image',
  styleUrl: 'app-image.scss',
})
export class AppImage {
  @Prop()
  app!: App;

  @Prop()
  announceID!: string;

  @Prop()
  postID!: string;

  @Watch('postID')
  watchPostID() {
    this.naviLinks = [
      {
        label: this.app.msgs.common.back,
        href: `/${this.announceID}/${this.postID}`,
        back: true,
      },
    ];
  }

  @Prop()
  imageID?: string;

  @Prop()
  image62?: string;

  @Watch('imageID')
  @Watch('image62')
  watchImageID() {
    this.imageState = undefined;
  }

  @State()
  imageState?: PromiseState<string>;

  private naviLinks!: ApNaviLink[];

  componentWillLoad() {
    this.watchPostID();
  }

  componentWillRender() {
    if (!this.imageState) {
      if (this.imageID) {
        this.imageState = new PromiseState(this.app.fetchImage(this.imageID));
      }
      if (this.image62) {
        const uri = new TextDecoder().decode(bs62.decode(this.image62));
        this.imageState = new PromiseState(Promise.resolve(uri));
      }
    }
  }

  private renderContext() {
    const imgStatus = this.imageState?.status();
    assertIsDefined(imgStatus);

    return {
      announceID: this.announceID,
      postID: this.postID,
      imgStatus,
      naviLinks: this.naviLinks,
    };
  }

  render() {
    return render(this.renderContext());
  }
}

type RenderContext = ReturnType<AppImage['renderContext']>;

const render = (ctx: RenderContext) => {
  return (
    <Host class="full">
      {renderContent(ctx)}
      <ap-navi links={ctx.naviLinks} />
    </Host>
  );
};

const renderContent = (ctx: RenderContext) => {
  switch (ctx.imgStatus.state) {
    case 'rejected':
    case 'fulfilled-empty':
      redirectRoute(`/${ctx.announceID}/${ctx.postID}`);
      return;
    case 'fulfilled':
      return (
        <Fragment>
          <pinch-zoom>
            <img src={ctx.imgStatus.value} />
          </pinch-zoom>
        </Fragment>
      );
    default:
      return <ap-spinner />;
  }
};
