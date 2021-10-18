import { Component, Fragment, h, Host, Prop } from '@stencil/core';
import { href, PromiseState } from '../../';
import { AnnounceAndMeta } from '../../../shared';

@Component({
  tag: 'ap-announce',
  styleUrl: 'ap-announce.scss',
})
export class ApAnnounce {
  @Prop()
  announce!: AnnounceAndMeta;

  @Prop()
  iconImgPromise?: PromiseState<string>;

  @Prop()
  showDetails?: boolean;

  @Prop()
  icons?: {
    follow: boolean;
    notification: boolean;
  };

  @Prop()
  href?: string;

  render() {
    const announce = this.announce;
    if (!announce) {
      return;
    }

    const Tag = this.href ? 'a' : 'div';

    return (
      <Host>
        <Tag class="head" {...(this.href && href(this.href))}>
          <div class="name-box">
            <slot name="above-name" />
            <span class="name">{announce.name}</span>
          </div>
          {this.iconImgPromise && <ap-image srcPromise={this.iconImgPromise} />}
        </Tag>
        {this.showDetails && (
          <Fragment>
            {announce.desc && <div class="desc">{announce.desc}</div>}
            {announce.link && (
              <a class="link" href={announce.link} target="_blank" rel="noopener">
                {announce.link}
              </a>
            )}
          </Fragment>
        )}
      </Host>
    );
  }
}
