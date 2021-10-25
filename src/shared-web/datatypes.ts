import { Match } from '../shared/path-matcher';

export type RouteMatch = Match & {
  tag?: string;
  back?: string | ((p: Record<string, string>) => string);
};
