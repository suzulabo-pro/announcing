import { Lang } from '@announcing/shared';
import { Timestamp } from '../firebase';

export interface NotificationDevice {
  signKey: string;
  lang: Lang;
  announces: string[];
  uT: Timestamp;
}

export interface ImmediateNotification {
  announceID: string;
  devices?: { [token: string]: [lang: Lang] };
  cancels?: string[];
  archives?: string[];
  uT: Timestamp;
}

export interface ImmediateNotificationArchive {
  devices: { [token: string]: [lang: Lang] };
}

export const IMPORT_POSTS_EXPIRED_MSEC = 1000 * 60 * 60; // 1 hour
