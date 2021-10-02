import { Match, pathMatcher } from '@announcing/shared';
import { Component, Element, h, Host, Listen, Prop, State } from '@stencil/core';
import { href, PageVisible, redirectRoute, restoreScroll } from '../../utils';

export type RouteMatch = Match & { tag?: string };

@Component({
  tag: 'ap-root',
  styleUrl: 'ap-root.scss',
})
export class ApRoot {
  @Element()
  el!: HTMLApRootElement;

  @Prop()
  routeMatches!: RouteMatch[];

  @Prop()
  componentProps?: { [k: string]: any };

  @Prop()
  defaultPath = '/';

  @Prop()
  redirect?: (p: string) => string | undefined;

  @Prop()
  headerTitle = 'Announcing♪';

  @State()
  path?: string;

  @Listen('popstate', { target: 'window' })
  handlePopState() {
    const p = location.pathname;
    const m = pathMatcher(this.routeMatches, p);
    if (!m) {
      redirectRoute(this.defaultPath);
      return;
    }

    if (this.redirect) {
      const r = this.redirect(p);
      if (r) {
        redirectRoute(r);
        return;
      }
    }

    this.path = p;
  }

  componentWillLoad() {
    //history.scrollRestoration = 'manual';
    this.handlePopState();
    this.defaultApHead = document.querySelector<HTMLApHeadElement>('ap-head.default');
  }

  private defaultApHead?: HTMLApHeadElement | null;

  private tags = new Map<string, { params: Record<string, any>; pageVisible: PageVisible }>();

  render() {
    const p = this.path;
    if (!p) {
      return;
    }
    const m = pathMatcher(this.routeMatches, p);
    if (!m || !m.match.tag) {
      console.warn('missing page', m);
      return;
    }

    const curTag = m.match.tag;
    const tagInfo = this.tags.get(curTag);
    if (tagInfo) {
      tagInfo.params = { ...m.params, ...this.componentProps };
      if (tagInfo.pageVisible.isSkiped()) {
        tagInfo.pageVisible = new PageVisible();
      }
    } else {
      this.tags.set(curTag, {
        params: { ...m.params, ...this.componentProps },
        pageVisible: new PageVisible(),
      });
    }

    return (
      <Host>
        <div class="header">
          <a {...href('/')}>{this.headerTitle}</a>
        </div>
        {[...this.tags.entries()].map(([Tag, tagInfo]) => {
          const visible = Tag == curTag;
          if (!visible && tagInfo.pageVisible.isVisible()) {
            const hideEl = this.el.getElementsByTagName(Tag)[0];
            if (hideEl) {
              hideEl.dispatchEvent(new CustomEvent('PageDeactivated'));
            }
          }
          tagInfo.pageVisible.setVisible(visible);
          return (
            <Tag
              key={Tag}
              class={{ page: true, hide: !visible }}
              PageActivate={visible}
              pageVisible={tagInfo.pageVisible}
              {...tagInfo.params}
            />
          );
        })}
      </Host>
    );
  }

  componentDidRender() {
    this.el.children;

    const page = searchElement(this.el.children, el => {
      return el.classList.contains('page') && !el.classList.contains('hide');
    });

    if (page) {
      const apHead = searchElement(page.children, el => {
        return el.tagName == 'AP-HEAD';
      }) as HTMLApHeadElement;
      if (apHead) {
        void apHead.writeHead();
      } else if (this.defaultApHead) {
        void this.defaultApHead.writeHead();
      }

      page.dispatchEvent(new CustomEvent('PageActivated'));
    }

    restoreScroll();
  }
}

const searchElement = (c: HTMLCollection, cb: (el: HTMLElement) => boolean) => {
  for (let i = 0; i < c.length; i++) {
    const el = c.item(i) as HTMLElement;
    if (cb(el)) {
      return el;
    }
  }
  return;
};
