export const headerHeight =
  document.querySelector("header")?.getBoundingClientRect().height ?? 0;

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
    const overlayPostScrollContainer =
      getOverlayPostScrollContainer() as HTMLElement;
    for (const child of overlayPostScrollContainer.children) {
      if (getComputedStyle(child).position === "sticky") {
        return child.getBoundingClientRect().height;
      }
    }
    return 0;
  }
  return 0;
};
