import { Announce, AnnounceMeta } from '@announcing/shared';

export interface AnnounceState extends Announce, AnnounceMeta {
  id: string;
  iconData?: string;
  iconLoader?: () => Promise<string>;
}
