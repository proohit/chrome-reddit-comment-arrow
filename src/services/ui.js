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
