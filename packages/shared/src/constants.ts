export const ANNOUNCE_ID_LENGTH = 12;
export const ANNOUNCE_META_ID_LENGTH = 8;
export const POST_ID_LENGTH = 8;
export const NOTIFICATION_TOKEN_MAX_LENGTH = 300;
export const LANG_LENGTH = 2;

export const NACL_KEY_MIN_LENGTH = 30; // actually 32
export const NACL_KEY_MAX_LENGTH = 45; // actually 43
export const NACL_SIGN_MIN_LENGTH = 60; // actually 64
export const NACL_SIGN_MAX_LENGTH = 90; // actually 86

const MD5_MIN_LENGTH = 15; // actually 16
const MD5_MAX_LENGTH = 25; // actually 22

export const ANNOUNCE_META_NAME_MAX_LENGTH = 50;
export const ANNOUNCE_META_DESC_MAX_LENGTH = 500;
export const ANNOUNCE_META_LINK_MAX_LENGTH = 1000;

export const POST_TITLE_MAX_LENGTH = 100;
export const POST_BODY_MAX_LENGTH = 500;
export const POST_LINK_MAX_LENGTH = 1000;

export const IMAGE_ID_MIN_LENGTH = MD5_MIN_LENGTH;
export const IMAGE_ID_MAX_LENGTH = MD5_MAX_LENGTH;
export const IMAGE_DATA_MAX_LENGTH = 1000 * 1000;

export const IMPORT_POSTS_URL_MAX_LENGTH = 1000;
