import { Match } from '../shared/path-matcher';

export interface ApNaviLink {
  label: string;
  href?: string;
  handler?: () => void;
  back?: boolean;
}

export type RouteMatch = Match & {
  tag?: string;
  back?: string | ((p: Record<string, string>) => string);
};
