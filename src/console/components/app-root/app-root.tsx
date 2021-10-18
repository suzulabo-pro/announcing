import { Component, h, Host } from '@stencil/core';
import { App } from '../../app/app';
import { AppFirebase } from '../../app/firebase';
import { AppMsg } from '../../app/msg';
import { AppState } from '../../app/state';
import { AppEnv, RouteMatch } from '../../shared';

const matches: RouteMatch[] = [
  {
    pattern: '',
    tag: 'app-home',
  },
  {
    pattern: 'signin',
    tag: 'app-signin',
  },
  {
    pattern: 'about',
    tag: 'app-about',
    back: '/',
  },
  {
    pattern: 'create',
    tag: 'app-announce-create',
    back: '/',
  },
  {
    pattern: /^[0-9A-Z]{12}$/,
    name: 'announceID',
    tag: 'app-announce',
    back: '/',
    nexts: [
      {
        pattern: 'edit',
        tag: 'app-announce-edit',
        back: p => `/${p['announceID']}`,
      },
      {
        pattern: 'import-posts',
        tag: 'app-import-posts',
        back: p => `/${p['announceID']}`,
      },
      {
        pattern: 'post',
        tag: 'app-post-form',
        back: p => `/${p['announceID']}`,
      },
      {
        pattern: /^[0-9a-zA-Z]{8}$/,
        name: 'postID',
        tag: 'app-post',
        back: p => `/${p['announceID']}`,
        nexts: [
          {
            pattern: 'edit',
            tag: 'app-post-form',
            back: p => `/${p['announceID']}/${p['postID']}`,
          },
        ],
      },
    ],
  },
];

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss',
})
export class AppRoot {
  private app: App;

  constructor() {
    const appMsg = new AppMsg();
    const apError = document.querySelector('ap-error');
    if (apError) {
      apError.msgs = appMsg.msgs.error;
    }

    const appEnv = new AppEnv();
    const appState = new AppState();
    const appFirebase = new AppFirebase(appEnv, appState, appMsg);
    this.app = new App(appEnv, appMsg, appFirebase, appState);
  }

  async componentWillLoad() {
    await this.app.init();
  }

  private handleRedirect = (p: string) => {
    if (this.app.isSignIn) {
      if (p == '/signin') {
        return '/';
      }
    } else {
      if (p != '/signin') {
        return '/signin';
      }
    }
    return;
  };

  render() {
    return (
      <Host>
        <ap-root
          routeMatches={matches}
          redirect={this.handleRedirect}
          componentProps={{ app: this.app }}
        />
      </Host>
    );
  }
}
