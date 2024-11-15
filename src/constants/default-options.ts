import { Options } from "../interfaces/Options";
import { ScrollingOptions } from "../interfaces/scrolling-options.interface";

export const DEFAULT_ARROW_POSITION = (
  iconSize: number
): {
  x: string;
  y: string;
} => ({
  x: `calc(100% - ${iconSize}px - 25px)`,
  y: "50vh",
});

export const DEFAULT_OPTIONS: Options = {
  moveDelay: 500,
  iconSize: 80,
  scrolling: {
    strategy: "top",
    behavior: "smooth",
    scrollTo: "topLevelComment",
  } as ScrollingOptions,
  arrowPosition: DEFAULT_ARROW_POSITION(80),
  stroke: undefined,
  fill: undefined,
  strokeEnabled: false,
  fillEnabled: false,
  includeArticles: true,
  showScrollTop: true,
};
export const scrollToTopButtonHeightFactor = 0.6;
