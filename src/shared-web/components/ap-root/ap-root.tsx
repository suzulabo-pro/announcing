import { Component, h, Host, Listen, Prop, State } from '@stencil/core';
import { href, redirectRoute, restoreScroll, RouteMatch } from '../../';
import { pathMatcher } from '../../../shared';
import { setDocumentTitle } from '../../document-title';
import { getHeaderButtons, setHeaderButtons } from '../../';

@Component({
  tag: 'ap-root',
  styleUrl: 'ap-root.scss',
})
export class ApRoot {
  @Prop()
  routeMatches!: RouteMatch[];

  @Prop()
  componentProps?: { [k: string]: any };

  @Prop()
  defaultPath = '/';

  @Prop()
  redirect?: (p: string) => string | undefined;

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

    if (this.path != p) {
      this.path = p;
      this.shouldRestoreScroll = true;
      setHeaderButtons([]);
      setDocumentTitle('');
    }
  }

  componentWillLoad() {
    this.handlePopState();
  }

  private shouldRestoreScroll = false;
  private tags = new Map<string, { params: Record<string, any> }>();

  private handleReloadClick = () => {
    location.reload();
  };

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
    } else {
      this.tags.set(curTag, {
        params: { ...m.params, ...this.componentProps },
      });
    }

    const back = (() => {
      const bk = m.match.back;
      if (!bk) {
        return;
      }
      if (typeof bk == 'string') {
        return bk;
      }
      return bk(m.params);
    })();

    return (
      <Host class={{ 'fit-page': !!m.match.fitPage }}>
        <div class="header">
          {back && (
            <a class="back" {...href(back, true)}>
              <ap-icon icon="arrowReturnLeft" />
            </a>
          )}
          {m.match.reload && (
            <button class="reload clear" onClick={this.handleReloadClick}>
              <ap-icon icon="reload" />
            </button>
          )}
          <span class="spacer" />
          {getHeaderButtons().map(v => {
            if (v.href) {
              return (
                <a class="button slim" {...href(v.href)}>
                  {v.label}
                </a>
              );
            }
            if (v.handler) {
              return (
                <button class="slim" onClick={v.handler}>
                  {v.label}
                </button>
              );
            }
          })}
        </div>
        {[...this.tags.entries()].map(([Tag, tagInfo]) => {
          const active = Tag == curTag;
          return (
            <Tag
              key={Tag}
              class={{ page: true, hide: !active }}
              activePage={active}
              {...tagInfo.params}
            />
          );
        })}
      </Host>
    );
  }

  componentDidRender() {
    if (this.shouldRestoreScroll) {
      restoreScroll();
      this.shouldRestoreScroll = false;
    }
  }
}
