import { Component, h, Host, Prop } from '@stencil/core';
import { ApNaviLink, href } from '../../';

@Component({
  tag: 'ap-navi',
  styleUrl: 'ap-navi.scss',
})
export class ApNavi {
  @Prop()
  links!: ApNaviLink[];

  @Prop()
  position: 'fixed' | 'sticky' = 'fixed';

  render() {
    return (
      <Host class={{ sticky: this.position == 'sticky' }}>
        {this.links.map(v => {
          if (v.href) {
            return (
              <a class="navi" {...href(v.href, v.back)}>
                {v.label}
              </a>
            );
          }
          if (v.handler) {
            return (
              <button class="navi anchor" onClick={v.handler}>
                {v.label}
              </button>
            );
          }
          return <span class="navi blank"></span>;
        })}
      </Host>
    );
  }
}
