import { Component, h, Host, Listen } from '@stencil/core';
import { App } from '../../app/app';
import { PostNotificationRecievedEvent } from '../../app/datatypes';
import { AppFirebase } from '../../app/firebase';
import { AppIdbCache } from '../../app/idbcache';
import { AppMsg } from '../../app/msg';
import { AppStorage } from '../../app/storage';
import { AppEnv, pushRoute, RouteMatch } from '../../shared';

const matches: RouteMatch[] = [
  {
    pattern: '',
    tag: 'app-home',
  },
  {
    pattern: 'config',
    tag: 'app-config',
    back: '/',
  },
  {
    pattern: 'about',
    tag: 'app-about',
    back: '/',
  },
  {
    pattern: /^[0-9A-Z]{12}$/,
    name: 'announceID',
    tag: 'app-announce',
    back: '/',
    nexts: [
      {
        pattern: 'config',
        tag: 'app-announce-config',
        back: p => `/${p['announceID']}`,
      },
      {
        pattern: /^[0-9a-zA-Z]{8}$/,
        name: 'postID',
        tag: 'app-post',
        back: p => `/${p['announceID']}`,
        nexts: [
          {
            pattern: 'image',
            nexts: [
              {
                pattern: /^[0-9a-zA-Z]{15,25}$/,
                name: 'imageID',
                tag: 'app-image',
                back: p => `/${p['announceID']}/${p['postID']}`,
              },
            ],
          },
          {
            pattern: 'image_uri',
            nexts: [
              {
                pattern: /^[0-9a-zA-Z]{1,1500}$/,
                name: 'image62',
                tag: 'app-image',
                back: p => `/${p['announceID']}/${p['postID']}`,
              },
            ],
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
  private app!: App;

  constructor() {
    const appMsg = new AppMsg();
    const apError = document.querySelector('ap-error');
    if (apError) {
      //apError.msgs = appMsg.msgs.error;
    }
    const appEnv = new AppEnv();
    const appFirebase = new AppFirebase(appEnv);
    const appStorage = new AppStorage();
    const appIdbCache = new AppIdbCache();
    this.app = new App(appEnv, appMsg, appFirebase, appStorage, appIdbCache);
  }

  @Listen('PostNotificationRecieved', { target: 'window' })
  handlePostNotificationRecieved(event: PostNotificationRecievedEvent) {
    const p = `/${event.detail.announceID}/${event.detail.postID}`;
    if (this.app) {
      pushRoute(p);
    } else {
      location.href = p;
    }
  }

  async componentWillLoad() {
    await this.app.init();
  }

  render() {
    return (
      <Host>
        <ap-root routeMatches={matches} componentProps={{ app: this.app }} />
      </Host>
    );
  }
}
