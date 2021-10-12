import { Component, h, Host, Prop } from '@stencil/core';
import { App } from '../../app/app';

@Component({
  tag: 'app-signin',
  styleUrl: 'app-signin.scss',
})
export class AppSignIn {
  @Prop()
  app!: App;

  private handleGoogleClick = () => {
    return this.app.signInGoogle();
  };

  private handleTwitterClick = () => {
    return this.app.signInTwitter();
  };

  render() {
    const msgs = this.app.msgs;

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
