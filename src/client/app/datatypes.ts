import { Announce, AnnounceMetaBase, PostJSON } from '../shared';

export interface Follow {
  name: string; // Needed after deleted
  readTime: number;
}

export interface AnnounceState extends Announce, AnnounceMetaBase {
  latestPost?: PostJSON;
}

export class PostNotificationRecievedEvent extends CustomEvent<{
  announceID: string;
}> {
  constructor(detail: { announceID: string }) {
    super('PostNotificationRecieved', { detail });
  }
}

export interface ClientConfig {
  embedTwitter?: boolean;
  embedYoutube?: boolean;
}
