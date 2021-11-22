import { Component, Fragment, h, Host, Prop, State, Watch } from '@stencil/core';
import { AsyncReturnType } from 'type-fest';
import {
  assertIsDefined,
  POST_BODY_MAX_LENGTH,
  POST_LINK_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
} from '../../../shared';
import { PromiseState, pushRoute, redirectRoute, setDocumentTitle } from '../../../shared-web';
import { App } from '../../app/app';
import { isURL } from '../../utils/isurl';

@Component({
  tag: 'app-post-form',
  styleUrl: 'app-post-form.scss',
})
export class AppPostForm {
  @Prop()
  activePage!: boolean;

  @Prop()
  app!: App;

  @Prop()
  announceID!: string;

  @Watch('announceID')
  watchAnnounceID() {
    this.announceState = undefined;
    this.values = undefined;
  }

  @Prop()
  postID?: string;

  @Watch('postID')
  watchPostID() {
    this.values = undefined;
  }

  @State()
  values?: { title?: string; body?: string; link?: string; img?: string; imgData?: string };

  @State()
  announceState?: PromiseState<AsyncReturnType<AppPostForm['laodAnnounce']>>;

  @State()
  postState?: PromiseState<AsyncReturnType<AppPostForm['loadPost']>>;

  private async laodAnnounce() {
    const id = this.announceID;
    const announce = await this.app.getAnnounceAndMeta(id);
    if (announce) {
      return {
        announce,
        iconImgPromise: announce.icon
          ? new PromiseState(this.app.getImage(announce.icon))
          : undefined,
      };
    }
    return;
  }

  private async loadPost() {
    const id = this.announceID;
    const postID = this.postID;
    if (!postID) return;

    const post = await this.app.getPost(id, postID);
    if (post) {
      return {
        post,
        imgData: post.img ? await this.app.getImage(post.img) : undefined,
      };
    }
    return;
  }

  private handlers = {
    input: {
      title: (ev: Event) => {
        this.values = { ...this.values, title: (ev.target as HTMLInputElement).value };
      },
      body: (ev: Event) => {
        this.values = { ...this.values, body: (ev.target as HTMLTextAreaElement).value };
      },
      link: (ev: Event) => {
        this.values = { ...this.values, link: (ev.target as HTMLInputElement).value };
      },
      img: (ev: CustomEvent<string>) => {
        this.values = { ...this.values, imgData: ev.detail };
      },
    },
    submit: async () => {
      await this.app.processLoading(async () => {
        if (!this.values) {
          return;
        }
        await this.app.putPost(
          this.announceID,
          this.values.title,
          this.values.body,
          this.values.link,
          this.values.imgData?.split(',')[1],
          this.postID,
        );
        this.values = undefined;
        pushRoute(`/${this.announceID}`);
      });
    },
  };

  componentWillLoad() {
    this.watchPostID();
  }

  componentWillRender() {
    if (!this.announceState) {
      this.announceState = new PromiseState(this.laodAnnounce());
    }

    if (!this.values) {
      if (!this.postID) {
        this.values = {};
      } else {
        this.postState = new PromiseState(this.loadPost());
        this.postState.then(value => {
          if (value) {
            this.values = { ...value.post, imgData: value.imgData };
          }
        });
      }
    }
  }

  private renderContext() {
    const announceStatus = this.announceState?.status();
    assertIsDefined(announceStatus);
    const postStatus = this.postState?.status();

    const values = this.values || {};

    let canSubmit = (values.title || values.body) && isURL(values.link);
    if (canSubmit && this.postID) {
      const { post, imgData } = this.postState?.result() || {};
      if (!post) {
        canSubmit = false;
      } else {
        canSubmit =
          values.title != post.title ||
          values.body != post.body ||
          values.link != post.link ||
          values.imgData != imgData;
      }
    }

    const backPath = `/${this.announceID}` + (this.postID ? `/${this.postID}` : '');
    return {
      msgs: this.app.msgs,
      announceID: this.announceID,
      announceStatus,
      postStatus,
      values,
      canSubmit,
      handlers: this.handlers,
      backPath,
    };
  }

  render() {
    if (this.activePage) {
      const { announce } = this.announceState?.result() || {};
      const docTitle = announce
        ? this.app.msgs.postForm.pageTitle(announce.name)
        : this.app.msgs.common.pageTitle;
      setDocumentTitle(docTitle);
    }
    return render(this.renderContext());
  }
}

type RenderContext = ReturnType<AppPostForm['renderContext']>;

const render = (ctx: RenderContext) => {
  return (
    <Host>
      {renderAnnounce(ctx)}
      {renderForm(ctx)}
    </Host>
  );
};

const renderAnnounce = (ctx: RenderContext) => {
  const status = ctx.announceStatus;

  switch (status.state) {
    case 'rejected':
    case 'fulfilled-empty':
      redirectRoute(ctx.backPath);
      return;
    case 'fulfilled': {
      const { announce, iconImgPromise } = status.value;
      return <ap-announce announce={announce} iconImgPromise={iconImgPromise} />;
    }
    default:
      return <ap-spinner />;
  }
};

const renderForm = (ctx: RenderContext) => {
  return (
    <Fragment>
      <div class="form">
        <ap-image-input
          label={ctx.msgs.postForm.img}
          resizeRect={{ width: 800, height: 800 }}
          data={ctx.values.imgData}
          onImageChange={ctx.handlers.input.img}
        />
        <ap-input
          label={ctx.msgs.postForm.title}
          value={ctx.values.title}
          maxLength={POST_TITLE_MAX_LENGTH}
          onInput={ctx.handlers.input.title}
        />
        <ap-input
          textarea={true}
          label={ctx.msgs.postForm.body}
          value={ctx.values.body}
          maxLength={POST_BODY_MAX_LENGTH}
          onInput={ctx.handlers.input.body}
        />
        <ap-input
          label={ctx.msgs.postForm.lnik}
          value={ctx.values.link}
          maxLength={POST_LINK_MAX_LENGTH}
          onInput={ctx.handlers.input.link}
        />
        <button class="submit" disabled={!ctx.canSubmit} onClick={ctx.handlers.submit}>
          {ctx.msgs.postForm.btn}
        </button>
      </div>
    </Fragment>
  );
};
