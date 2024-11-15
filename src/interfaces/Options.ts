import { ScrollingOptions } from "./scrolling-options.interface";

export type Options = {
  moveDelay: number;
  iconSize: number;
  scrolling: ScrollingOptions;
  arrowPosition: { x: string; y: string };
  stroke?: string;
  fill?: string;
  strokeEnabled?: boolean;
  fillEnabled?: boolean;
  includeArticles?: boolean;
  showScrollTop?: boolean;
};
