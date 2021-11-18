import { Lang } from '../../shared';
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

export interface ExternalAnnounces {
  urlPrefixes: string[];
  pubKeys: string[];
  announces: string[];
  uT: Timestamp;
}
