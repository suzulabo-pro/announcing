import { Build } from '@stencil/core';
import {
  Announce,
  AnnounceMetaBase,
  AppEnv,
  AppError,
  LazyPromiseState,
  PostJSON,
  PromiseState,
} from '../shared';
import { AppFirebase } from './firebase';
import { AppMsg } from './msg';
import { AppState } from './state';

const BUILD_INFO = {
  src: '__BUILD_SRC__',
  repo: '__BUILD_REPO__',
  time: parseInt('__BUILT_TIME__'),
} as const;

export class App {
  readonly buildInfo = BUILD_INFO;

  readonly clientSite: string;
  readonly manualSite: string;

  constructor(
    appEnv: AppEnv,
    private appMsg: AppMsg,
    private appFirebase: AppFirebase,
    private appState: AppState,
  ) {
    if (Build.isDev) {
      this.clientSite = `http://${location.hostname}:${parseInt(location.port) + 1}`;
    } else {
      this.clientSite = appEnv.env.sites.client;
    }
    this.manualSite = `${appEnv.env.sites.docs}/manual/#/${this.appMsg.lang}/`;
  }

  async init() {
    await this.appFirebase.init();
  }

  setTitle(v: string) {
    document.title = v;
  }

  async processLoading(f: () => Promise<void>) {
    const loading = document.querySelector('ap-loading');
    if (!loading) {
      alert('missing ap-loading');
      return;
    }
    loading.classList.add('show');
    try {
      await f();
    } catch (err) {
      if (err instanceof Error) {
        await this.showError(err);
      } else {
        await this.showError(new AppError(undefined, { err }));
      }
      throw err;
    } finally {
      loading.classList.remove('show');
    }
  }

  showError(error: Error) {
    const apError = document.querySelector('ap-error');
    if (!apError) {
      alert('missing ap-error');
      return;
    }

    apError.repo = this.buildInfo.repo;
    apError.msgs = this.appMsg.msgs.error;
    return apError.showError(error);
  }

  get msgs() {
    return this.appMsg.msgs;
  }

  get isSignIn() {
    return this.appState.signIn.get();
  }

  async signOut() {
    await this.appFirebase.signOut();
  }

  signInGoogle() {
    return this.appFirebase.signIn('google');
  }

  signInTwitter() {
    return this.appFirebase.signIn('twitter');
  }

  createAnnounce(name: string, desc: string) {
    return this.appFirebase.callCreateAnnounce({
      method: 'CreateAnnounce',
      name,
      desc,
    });
  }

  editAnnounce(
    id: string,
    name: string,
    desc?: string,
    link?: string,
    icon?: string,
    newIcon?: string,
  ) {
    return this.appFirebase.callEditAnnounce({
      method: 'EditAnnounce',
      id,
      name,
      desc,
      link,
      icon,
      newIcon,
    });
  }

  putPost(
    id: string,
    title?: string,
    body?: string,
    link?: string,
    imgData?: string,
    editID?: string,
  ) {
    return this.appFirebase.callPutPost({
      method: 'PutPost',
      id,
      title,
      body,
      link,
      imgData,
      editID,
    });
  }

  deleteAnnounce(id: string) {
    return this.appFirebase.callDeleteAnnounce({
      method: 'DeleteAnnounce',
      id,
    });
  }

  deletePost(id: string, postID: string) {
    return this.appFirebase.callDeletePost({
      method: 'DeletePost',
      id,
      postID,
    });
  }

  getUser() {
    return this.appFirebase.getUser();
  }

  async getAnnounceAndMeta(id: string): Promise<(Announce & AnnounceMetaBase) | undefined> {
    const user = await this.getUser();
    if (!user) {
      return;
    }
    if (!user.announces?.includes(id)) {
      return;
    }

    const a = await this.appFirebase.getAnnounce(id);
    if (!a) {
      return;
    }
    const meta = await this.appFirebase.getAnnounceMeta(id, a.mid);
    if (!meta) {
      throw new AppError(`fetchAnnounceMeta: ${id}/${a.mid}`);
    }

    return { ...a, ...meta };
  }

  getPosts(id: string, a: Announce) {
    const postsPromises: Record<string, PromiseState<PostJSON>> = {};
    for (const postID of Object.keys(a.posts)) {
      postsPromises[postID] = new LazyPromiseState(async () => {
        const post = await this.getPost(id, postID);
        return { ...post, pT: post?.pT.toMillis() || 0 };
      });
    }
    return postsPromises;
  }

  getPost(id: string, postID: string) {
    return this.appFirebase.getPost(id, postID);
  }

  async getPostJSON(id: string, postID: string): Promise<PostJSON | undefined> {
    const post = await this.appFirebase.getPost(id, postID);
    if (post) {
      return { ...post, pT: post.pT.toMillis() };
    }
    return;
  }

  async getImage(id: string) {
    const d = await this.appFirebase.getImage(id);
    if (d) {
      return `data:image/jpeg;base64,${d.data.toBase64()}`;
    }
    return;
  }

  async getExternalAnnounce(id: string) {
    return this.appFirebase.getExternalAnnounce(id);
  }

  async putExternalAnnounce(urlPrefixes: string[], pubKeys: string[], desc?: string, id?: string) {
    return this.appFirebase.callPutExternalAnnounces({
      method: 'PutExternalAnnounces',
      urlPrefixes,
      pubKeys,
      desc,
      id,
    });
  }

  async deleteExternalAnnounce(id: string) {
    return this.appFirebase.callDeleteExternalAnnounces({ method: 'DeleteExternalAnnounces', id });
  }
}
