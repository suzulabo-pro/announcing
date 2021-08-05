import { Match } from '@announcing/shared';

export type RouteMatch = Match & { tag?: string };

export interface ApNaviLink {
  label: string;
  href?: string;
  handler?: () => void;
  back?: boolean;
}

export * from './firestore';
export * from './pagevisible';
export * from './promisestate';
export * from './route';
