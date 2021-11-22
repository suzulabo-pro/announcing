export interface Follow {
  name: string; // Needed after deleted
  readTime: number;
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
