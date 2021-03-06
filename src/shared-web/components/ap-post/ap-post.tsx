import { Component, Fragment, h, Host, Prop } from '@stencil/core';
import { PromiseState } from '../../';
import { PostJSON } from '../../../shared';

const tweetIDPattern = new RegExp('^https://twitter\\.com/.+/status/([0-9]+)$');
const youtubeIDPattern = (s: string) => {
  const url = new URL(s);
  if (url.hostname.endsWith('youtube.com')) {
    const v = url.searchParams.get('v');
    if (v) {
      return v;
    }
    return null;
  }
  if (url.hostname.endsWith('youtu.be')) {
    const v = url.pathname.substring(1);
    if (v) {
      return v;
    }
    return null;
  }
  return;
};

@Component({
  tag: 'ap-post',
  styleUrl: 'ap-post.scss',
})
export class ApPost {
  @Prop()
  post!: PostJSON;

  @Prop()
  imgPromise?: PromiseState<string>;

  @Prop()
  imgHref?: string;

  @Prop()
  imgs?: { srcPromise: PromiseState<string>; href?: string }[];

  @Prop()
  msgs!: {
    datetime: (v: number) => string;
  };

  @Prop()
  showTweet?: boolean;

  @Prop()
  showYoutube?: boolean;

  private renderTweet(link: string) {
    if (!this.showTweet) return;

    const m = link.match(tweetIDPattern);
    if (!m) {
      return;
    }

    const [, tweetID] = m;
    return <ap-twitter tweetID={tweetID} />;
  }

  private renderYoutube(link: string) {
    if (!this.showYoutube) return;

    const id = youtubeIDPattern(link);
    if (id) {
      return <ap-youtube youtubeID={id} />;
    }
    return;
  }

  private renderEmbed() {
    const link = this.post.link;
    if (!link) {
      return;
    }

    {
      const tweet = this.renderTweet(link);
      if (tweet) {
        return tweet;
      }
    }
    {
      const youtube = this.renderYoutube(link);
      if (youtube) {
        return youtube;
      }
    }
    return;
  }

  render() {
    const post = this.post;

    const embed = this.renderEmbed();

    return (
      <Host>
        {this.imgPromise && (
          <div class="image">
            <ap-image srcPromise={this.imgPromise} href={this.imgHref} />
          </div>
        )}
        <span class="date">{this.msgs.datetime(post.pT)}</span>
        {post.title && <span class="title">{post.title}</span>}
        {post.body && <ap-textview class="body" text={post.body} />}
        {this.imgs && (
          <div class={{ images: true, single: this.imgs.length == 1, multi: this.imgs.length > 1 }}>
            {this.imgs.map(v => {
              return <ap-image srcPromise={v.srcPromise} href={v.href} />;
            })}
          </div>
        )}
        {post.link && (
          <Fragment>
            {embed}
            <a class="link" href={post.link} target="_blank" rel="noopener">
              {post.link}
            </a>
          </Fragment>
        )}
      </Host>
    );
  }
}
