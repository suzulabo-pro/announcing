import { Announce, PostJSON } from '@announcing/shared';
import { PromiseState } from '@announcing/shared-web';
import { Component, Element, forceUpdate, Fragment, h, Host, Prop, Watch } from '@stencil/core';
import { href } from '../../utils';

@Component({
  tag: 'ap-posts',
  styleUrl: 'ap-posts.scss',
})
export class ApPosts {
  @Element()
  el!: HTMLApPostsElement;

  @Prop()
  posts!: Announce['posts'];

  @Prop()
  postsPromises!: Record<string, PromiseState<PostJSON>>;

  @Prop()
  hrefFormat?: string;

  private postIds!: string[];

  @Watch('posts')
  watchPosts() {
    const pe = Object.entries(this.posts);

    const timeForSort = (p: Announce['posts']['string']) => {
      if (p.parent) {
        return this.posts[p.parent]?.pT.toMillis() || 0;
      } else {
        return p.pT.toMillis();
      }
    };

    pe.sort(([, p1], [, p2]) => {
      if (!p1.parent && !p2.parent) {
        return p2.pT.toMillis() - p1.pT.toMillis();
      }

      if (p1.parent == p2.parent) {
        return p1.pT.toMillis() - p2.pT.toMillis();
      } else {
        return timeForSort(p2) - timeForSort(p1);
      }
    });
    this.postIds = pe.map(([id]) => id);

    this.visibleMap = new Map();

    if (this.iob) {
      this.iob.disconnect();
    }
    this.iob = new IntersectionObserver(this.iobCallback, {
      rootMargin: '100px 0px 100px 0px',
    });
  }

  @Prop()
  msgs!: {
    datetime: (d: number) => string;
    dataError: string;
  };

  private visibleMap = new Map<string, boolean>();

  private iob!: IntersectionObserver;

  private iobCallback = (entries: IntersectionObserverEntry[]) => {
    if (entries.length == 0) {
      return;
    }

    for (const entry of entries) {
      const postID = entry.target.getAttribute('data-postid');
      if (!postID) {
        continue;
      }

      this.visibleMap.set(postID, entry.isIntersecting);
    }
    forceUpdate(this.el);
  };

  componentWillLoad() {
    this.watchPosts();
  }

  disconnectedCallback() {
    this.iob?.disconnect();
  }

  private handleRef = (elm?: HTMLElement) => {
    if (elm) {
      this.iob.observe(elm);
    }
  };

  private renderPost(postID: string): { href?: string; el: any } {
    if (!this.visibleMap.get(postID)) {
      return { el: <Fragment></Fragment> };
    }

    const state = this.postsPromises[postID];

    if (state?.error()) {
      return { el: <Fragment>{this.msgs.dataError}</Fragment> };
    }

    const post = state?.result();
    if (!post) {
      return {
        el: <ap-spinner />,
      };
    }

    return {
      href: this.hrefFormat ? this.hrefFormat.replace(':postID', postID) : undefined,
      el: (
        <Fragment>
          <span class="date">{this.msgs.datetime(post.pT)}</span>
          <div class="content">
            {post.title && <span class="title">{post.title}</span>}
            {post.title && post.body && <br />}
            {post.body && <span class="body">{post.body}</span>}
          </div>
        </Fragment>
      ),
    };
  }

  render() {
    return (
      <Host>
        {this.postIds.map(id => {
          const r = this.renderPost(id);
          const child = !!this.posts[id]?.parent;
          return (
            <a
              key={id}
              data-postid={id}
              ref={this.handleRef}
              class={{ post: true, child }}
              {...href(r.href)}
            >
              {r.el}
            </a>
          );
        })}
      </Host>
    );
  }
}
