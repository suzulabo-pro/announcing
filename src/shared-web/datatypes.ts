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

export interface PageRenderData {
  path: string;
  tag: string;
  headerButtons: { label: string; href: string }[];
}

export type BeforePageRenderEvent = CustomEvent<PageRenderData>;
