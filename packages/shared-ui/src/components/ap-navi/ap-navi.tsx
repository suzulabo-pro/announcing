import { Component, h, Host, Prop } from '@stencil/core';
import { href } from '../../utils';

export interface ApNaviLink {
  label: string;
  href?: string;
  handler?: () => void;
  back?: boolean;
}

@Component({
  tag: 'ap-navi',
  styleUrl: 'ap-navi.scss',
})
export class ApNavi {
  @Prop()
  links!: ApNaviLink[];

  render() {
    return (
      <Host>
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
