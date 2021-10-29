import { Component, h, Host, Prop } from '@stencil/core';
import { setDocumentTitle, setHeaderButtons } from '../../../shared-web';
import { App } from '../../app/app';

@Component({
  tag: 'app-signin',
  styleUrl: 'app-signin.scss',
})
export class AppSignIn {
  @Prop()
  activePage!: boolean;

  @Prop()
  app!: App;

  private handleGoogleClick = () => {
    return this.app.signInGoogle();
  };

  private handleTwitterClick = () => {
    return this.app.signInTwitter();
  };

  private headerButtons = [
    {
      label: this.app.msgs.common.about,
      href: '/about',
    },
  ];

  render() {
    const msgs = this.app.msgs;

    if (this.activePage) {
      setHeaderButtons(this.headerButtons);
      setDocumentTitle(this.app.msgs.signIn.pageTitle);
    }

    return (
      <Host>
        <button onClick={this.handleGoogleClick}>
          <ap-icon icon="google"></ap-icon>
          {msgs.signIn.googleBtn}
        </button>
        <button onClick={this.handleTwitterClick}>
          <ap-icon icon="twitter"></ap-icon>
          {msgs.signIn.twitterBtn}
        </button>
      </Host>
    );
  }
}
