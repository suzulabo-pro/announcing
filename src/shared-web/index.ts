import { Match } from '../shared/path-matcher';

export * from './firestore';
export * from './pagevisible';
export * from './promise-state';
export * from './route';

export interface ApNaviLink {
  label: string;
  href?: string;
  handler?: () => void;
  back?: boolean;
}

export type RouteMatch = Match & { tag?: string };
