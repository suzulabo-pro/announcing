import { Component, Element, forceUpdate, Fragment, h, Host, Prop, Watch } from '@stencil/core';
import { href, PromiseState } from '../../';
import { Announce, PostJSON } from '../../../shared';

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

    const postTimes = new Map<string, number>();
    for (const [id, post] of pe) {
      const pT = post.pT.toMillis();
      if (pT > (postTimes.get(id) || 0)) {
        postTimes.set(id, pT);
      }
      if (post.parent) {
        if (pT > (postTimes.get(post.parent) || 0)) {
          postTimes.set(post.parent, pT);
        }
      }
    }

    pe.sort(([id1, p1], [id2, p2]) => {
      if (p1.parent) {
        if (p1.parent == p2.parent) {
          return p1.pT.toMillis() - p2.pT.toMillis();
        }
        if (p1.parent == id2) {
          return 1;
        }
      }
      if (p2.parent) {
        if (p2.parent == id1) {
          return -1;
        }
      }

      return (postTimes.get(id2) || 0) - (postTimes.get(id1) || 0);
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
