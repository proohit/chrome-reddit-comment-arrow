import { debug } from "./utils";

const DEFAULT_ARROW_POSITION = (iconSize) => ({
  x: `calc(100% - ${iconSize}px - 25px)`,
  y: "50vh",
});

const DEFAULT_OPTIONS = {
  moveDelay: 500,
  iconSize: 80,
  scrolling: { strategy: "top", behavior: "smooth" },
  arrowPosition: DEFAULT_ARROW_POSITION(80),
};

export class Storage {
  constructor() {
    this.moveDelay = null;
    this.iconSize = null;
    this.scrolling = null;
    this.arrowPosition = null;
  }

  async loadFromChromeStorage() {
    const res = await chrome.storage.local.get(DEFAULT_OPTIONS);

    this.moveDelay = res.moveDelay;
    this.iconSize = res.iconSize;
    this.scrolling = res.scrolling;

    if (
      res.arrowPosition.x === DEFAULT_OPTIONS.arrowPosition.x &&
      res.arrowPosition.y === DEFAULT_OPTIONS.arrowPosition.y
    ) {
      this.arrowPosition = DEFAULT_ARROW_POSITION(this.iconSize);
    } else {
      this.arrowPosition = res.arrowPosition;
    }
  }

  async saveToChromeStorage(changes) {
    await chrome.storage.local.set(changes);
  }

  registerChangeListener(onChange) {
    chrome.storage.local.onChanged.addListener((changes) => {
      debug("changes in storage", changes);
      if (changes.moveDelay) {
        this.moveDelay = changes.moveDelay.newValue;
      }
      if (changes.iconSize) {
        this.iconSize = changes.iconSize.newValue;
      }
      if (changes.scrolling) {
        this.scrolling = changes.scrolling.newValue;
      }
      if (changes.arrowPosition) {
        this.arrowPosition = { ...changes.arrowPosition.newValue };
      }
      onChange(this);
    });
  }
}
