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

export interface ExternalAnnounce {
  urlPrefixes: string[];
  pubKeys: string[];
  desc?: string;
  announces: string[];
  uT: Timestamp;
}

export interface ExternalAnnouncePing {
  url: string;
  uT: Timestamp;
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

export interface PutExternalAnnouncesParams {
  method: 'PutExternalAnnounces';
  urlPrefixes: string[];
  pubKeys: string[];
  desc?: string;
  id?: string;
}

export interface DeleteExternalAnnouncesParams {
  method: 'DeleteExternalAnnounces';
  id: string;
}
