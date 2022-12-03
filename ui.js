import { debug } from "./utils";

export const headerHeight = document
  .querySelector("header")
  .getBoundingClientRect().height;

export const getButton = () => document.querySelector(".draggable-btn");

export const getButtonImage = () => {
  const button = getButton();
  if (!button) return null;
  return button.querySelector("img");
};

export const getOverlayPostScrollContainer = () => {
  return document.querySelector("#overlayScrollContainer");
};

export const isPostOverlay = () => {
  return getOverlayPostScrollContainer() !== null;
};

export const getOverlayPostScrollContainerHeaderHeight = () => {
  if (isPostOverlay()) {
    const overlayPostScrollContainer = getOverlayPostScrollContainer();
    for (const child of overlayPostScrollContainer.children) {
      if (getComputedStyle(child).position === "sticky") {
        return child.getBoundingClientRect().height;
      }
    }
    return 0;
  }
  return 0;
};

export const dragElement = (el, state) => {
  let previousCursorX = 0,
    previousCursorY = 0,
    currentCursorX = 0,
    currentCursorY = 0;

  // this is to track how long a mousedown is being pressed to determine if move or click. Also imitates the mobile app behaviour to hold some time to move.
  let intentionTimeout;

  const elementDrag = (e) => {
    e = e || window.event;
    e.preventDefault();
    previousCursorX = currentCursorX - e.clientX;
    previousCursorY = currentCursorY - e.clientY;
    currentCursorX = e.clientX;
    currentCursorY = e.clientY;

    let newElementX = el.offsetLeft - previousCursorX;
    let newElementY = el.offsetTop - previousCursorY;

    const screenWidth = window.visualViewport.width;
    const screenHeight = window.visualViewport.height;
    const iconSizeNumber = Number(state.storage.iconSize);
    if (newElementX + iconSizeNumber >= screenWidth) {
      newElementX = screenWidth - iconSizeNumber;
    }
    if (newElementX <= 0) {
      newElementX = 0;
    }
    if (newElementY + iconSizeNumber >= screenHeight) {
      newElementY = screenHeight - iconSizeNumber;
    }
    if (newElementY <= 0) {
      newElementY = 0;
    }

    el.style.top = newElementY + "px";
    el.style.left = newElementX + "px";
  };

  const closeDragElement = () => {
    if (intentionTimeout) {
      clearTimeout(intentionTimeout);
    }
    debug("closeDragElement", state.mouseDownIntention);

    document.onmouseup = null;
    document.onmousemove = null;

    if (state.mouseDownIntention === "mouseup") {
      el.style.cursor = "pointer";
      state.storage.saveToChromeStorage({
        arrowPosition: {
          x: el.style.left,
          y: el.style.top,
        },
      });
    }
  };

  const dragMouseDown = (e) => {
    e.preventDefault();
    intentionTimeout = setTimeout(() => {
      el.style.cursor = "move";
      state.mouseDownIntention = "mouseup";
      debug("dragMouseDown > intentionTimeout", state.mouseDownIntention);
      document.onmousemove = elementDrag;
    }, state.storage.moveDelay);
    e = e || window.event;
    currentCursorX = e.clientX;
    currentCursorY = e.clientY;
    document.onmouseup = closeDragElement;
  };

  el.onmousedown = dragMouseDown;
};

export const applyStyles = (btn, img, state) => {
  if (!btn || !img) return;
  debug("locally saved arrow position", state.storage.arrowPosition);
  btn.className = "draggable-btn";
  btn.style.top = state.storage.arrowPosition.y;
  btn.style.left = state.storage.arrowPosition.x;

  img.style.width = `${state.storage.iconSize}px`;
  img.style.height = `${state.storage.iconSize}px`;

  if (state.topLevelComments.length <= 0) {
    btn.classList.add("disabled");
    btn.title = chrome.i18n.getMessage("extension_comments_loading");
  } else {
    btn.classList.remove("disabled");
    btn.title = "";
  }
};
