import {
  getOverlayPostScrollContainer,
  getOverlayPostScrollContainerHeaderHeight,
  headerHeight,
  isPostOverlay,
} from "./ui";

export const getAllComments = () =>
  [...document.querySelectorAll(".Comment")].map(
    (comment) => comment.parentNode
  );

export const getAllTopLevelComments = () => {
  const allComments = getAllComments();
  return allComments.filter((comment) => {
    const rawPadding = comment.style.paddingLeft;
    const padding = Number(rawPadding.replace("px", ""));
    return padding <= 16;
  });
};

export const scrollToComment = (comment, scrollingOptions) => {
  if (!comment) return;
  if (scrollingOptions.strategy === "center") {
    scrollToCommentAtCenter(comment, scrollingOptions);
  } else if (scrollingOptions.strategy === "top") {
    scrollToCommentAtTop(comment, scrollingOptions);
  }
};

export const findNextComment = (scrollingOptions, topLevelComments) => {
  const strategy = scrollingOptions.strategy;
  if (strategy === "top") {
    return findNextCommentNearestToTop(topLevelComments);
  } else if (strategy === "center") {
    return findNextCommentNearestToCenter(topLevelComments);
  }
};

const scrollToCommentAtTop = (comment, scrollingOptions) => {
  let yScrollPosition = comment.getBoundingClientRect().y - headerHeight;
  if (isPostOverlay()) {
    const overlayPostScrollContainer = getOverlayPostScrollContainer();
    yScrollPosition =
      yScrollPosition +
      overlayPostScrollContainer.scrollTop -
      getOverlayPostScrollContainerHeaderHeight();
    overlayPostScrollContainer.scrollTo({
      left: 0,
      top: yScrollPosition,
      behavior: scrollingOptions.behavior,
    });
  } else {
    yScrollPosition += window.scrollY;
    window.scrollTo({
      left: 0,
      top: yScrollPosition,
      behavior: scrollingOptions.behavior,
    });
  }
};

const scrollToCommentAtCenter = (comment, scrollingOptions) => {
  comment.scrollIntoView({
    behavior: scrollingOptions.behavior,
    block: "center",
  });
};

const findNextCommentNearestToCenter = (topLevelComments) => {
  let absoluteYViewportCenter = window.innerHeight / 2 + window.scrollY;
  return findNextCommentWith(absoluteYViewportCenter, topLevelComments, 0);
};

const findNextCommentNearestToTop = (topLevelComments) => {
  let absoluteViewportY = window.scrollY + headerHeight;
  let offset = 5;
  if (isPostOverlay()) {
    offset += getOverlayPostScrollContainerHeaderHeight();
  }
  return findNextCommentWith(absoluteViewportY, topLevelComments, offset);
};

const findNextCommentWith = (
  viewportY,
  topLevelComments,
  skippingThreshold
) => {
  let minimumDistance = Infinity; // defaults to high to begin search
  let minimumDistanceCommentElement = null;
  for (let commentElement of topLevelComments) {
    const commentElementPos = commentElement.getBoundingClientRect();
    let absoluteYCommentElement = commentElementPos.y + window.scrollY;
    // negative distance means above center, positive means below center, zero means exactly at center
    let distanceBetweenElementAndViewPortCenter =
      absoluteYCommentElement - viewportY;
    // we want the next element. If the element is exactly at or above center, we skip this current element
    if (distanceBetweenElementAndViewPortCenter <= skippingThreshold) continue;
    if (distanceBetweenElementAndViewPortCenter < minimumDistance) {
      minimumDistance = distanceBetweenElementAndViewPortCenter;
      minimumDistanceCommentElement = commentElement;
    }
  }
  return minimumDistanceCommentElement;
};
