import { Component, h, Host, Listen } from '@stencil/core';

const handleResize = () => {
  const wh = window.innerHeight;
  document.documentElement.style.setProperty('--wh', `${wh}px`);
  console.log('wh', wh);
};

@Component({
  tag: 'ap-style',
  styleUrl: 'ap-style.scss',
})
export class ApStyle {
  @Listen('resize', { target: 'window' })
  listenResize() {
    requestAnimationFrame(handleResize);
  }

  @Listen('scroll', { target: 'window' })
  listenScroll() {
    requestAnimationFrame(handleResize);
  }

  componentWillLoad() {
    requestAnimationFrame(handleResize);
  }

  render() {
    return <Host></Host>;
  }
}
