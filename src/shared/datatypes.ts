type Timestamp = {
  toMillis: () => number;
};
type Blob = {
  toBase64: () => string;
};

const languages = ['en', 'ja'] as const;
export type Lang = typeof languages[number];

export const isLang = (s: any): s is Lang => {
  return languages.includes(s);
};

export interface Announce {
  mid: string; // meta id
  posts: { [postID: string]: { pT: Timestamp; parent?: string; edited?: string } };
  uT: Timestamp; // updated time
}

interface PostBase {
  title?: string;
  body?: string;
  link?: string;
  img?: string;
  imgs?: string[];
}

export interface Post extends PostBase {
  pT: Timestamp; // published time
}
export interface PostJSON extends PostBase {
  pT: number; // published time
}

export interface AnnounceMetaBase {
  name: string;
  desc?: string;
  link?: string;
  icon?: string;
}
export interface AnnounceMeta extends AnnounceMetaBase {
  cT: Timestamp; // created time
}
export interface AnnounceMetaJSON extends AnnounceMetaBase {
  cT: number; // created time
}

export interface User {
  announces?: string[];
  externalAnnounces?: string[];
  uT: Timestamp;
}

export interface Image {
  data: Blob;
}

export type ImportPostsLog =
  | {
      event: 'set';
      url: string;
      eT: Timestamp;
    }
  | {
      event: 'req';
      from: string;
      eT: Timestamp;
    }
  | {
      event: 'ok';
      imported: number;
      deleted: number;
      eT: Timestamp;
    }
  | {
      event: 'err';
      err: string;
      eT: Timestamp;
    };

export interface ImportPosts {
  url?: string;
  pubKey?: string;
  requested?: boolean;
  requestedURL?: string;
  logs: ImportPostsLog[];
  uT: Timestamp; // updated time
}

export type AnnounceAndMeta = Announce & AnnounceMetaBase;

export interface CreateAnnounceParams {
  method: 'CreateAnnounce';
  name: string;
  desc?: string;
}

export interface EditAnnounceParams {
  method: 'EditAnnounce';
  id: string;
  name: string;
  desc?: string;
  link?: string;
  icon?: string;
  newIcon?: string;
}

export interface EditImportPostsParams {
  method: 'EditImportPosts';
  id: string;
  url?: string;
  pubKey?: string;
}

export interface DeleteAnnounceParams {
  method: 'DeleteAnnounce';
  id: string;
}

export interface PutPostParams {
  method: 'PutPost';
  id: string;
  title?: string;
  body?: string;
  link?: string;
  imgData?: string;
  editID?: string;
}

export interface DeletePostParams {
  method: 'DeletePost';
  id: string;
  postID: string;
}

export interface RegisterNotificationParams {
  method: 'RegisterNotification';
  reqTime: string;
  token: string;
  signKey: string;
  sign: string;
  lang: Lang;
  announces: string[];
}

export interface RegisterExternalAnnouncesParams {
  method: 'RegisterExternalAnnounces';
  urlPrefix: string;
  pubKey: string;
}

export interface UpdateExternalAnnouncesKeyParams {
  method: 'UpdateExternalAnnouncesKey';
  id: string;
  pubKey: string;
}

export interface DeleteExternalAnnouncesParams {
  method: 'DeleteExternalAnnounces';
  id: string;
}
