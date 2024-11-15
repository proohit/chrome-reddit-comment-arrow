export function exceedsRightBoundary(x: number, iconSizeNumber: number) {
  return x + iconSizeNumber >= window.innerWidth;
}

export function exceedsLeftBoundary(x: number) {
  return x <= 0;
}

export function exceedsBottomBoundary(y: number, iconSizeNumber: number) {
  return y + iconSizeNumber >= window.innerHeight;
}

export function exceedsTopBoundary(y: number) {
  return y <= 0;
}

export function isElementInViewport(
  x: number,
  y: number,
  iconSizeNumber: number
) {
  return (
    !exceedsRightBoundary(x, iconSizeNumber) &&
    !exceedsTopBoundary(y) &&
    !exceedsBottomBoundary(y, iconSizeNumber) &&
    !exceedsLeftBoundary(x)
  );
}

export function getRelativePositionInBounds(
  x: number,
  y: number,
  iconSizeNumber: number
) {
  const screenWidth = window.visualViewport?.width ?? window.innerWidth;
  const screenHeight = window.visualViewport?.height ?? window.innerHeight;

  const newPosition = {
    x: (x / screenWidth) * 100 + "%",
    y: (y / screenHeight) * 100 + "%",
  };

  if (exceedsRightBoundary(x, iconSizeNumber)) {
    newPosition.x = `calc(100% - ${iconSizeNumber}px)`;
  }
  if (exceedsLeftBoundary(x)) {
    newPosition.x = "0%";
  }
  if (exceedsBottomBoundary(y, iconSizeNumber)) {
    newPosition.y = `calc(100% - ${iconSizeNumber}px)`;
  }
  if (exceedsTopBoundary(y)) {
    newPosition.y = "0%";
  }

  return newPosition;
}
