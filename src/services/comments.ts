import { debounce } from "../helpers/utils";
import { ScrollingOptions } from "../interfaces/scrolling-options.interface";
import {
  getOverlayPostScrollContainer,
  getOverlayPostScrollContainerHeaderHeight,
  headerHeight,
  isPostOverlay,
} from "./ui";

export const getAllComments = (): HTMLElement[] => {
  const commentsOldReddit = [
    ...document.querySelectorAll(".comment"),
  ] as HTMLElement[];
  if (commentsOldReddit.length > 0) return commentsOldReddit;
  const commentsNewArch = [
    ...document.querySelectorAll("shreddit-comment"),
  ] as HTMLElement[];
  if (commentsNewArch.length > 0) return commentsNewArch;

  return [...document.querySelectorAll(".Comment")]
    .map((comment) => comment.parentNode as HTMLElement)
    .filter((comment) => !!comment);
};

export const getAllTopLevelComments = () => {
  const topLevelCommentsNewArch = [
    ...document.querySelectorAll("shreddit-comment-tree > shreddit-comment"),
  ] as HTMLElement[];
  if (topLevelCommentsNewArch.length > 0) return topLevelCommentsNewArch;
  const oldRedditCommentsArea = document.querySelector(".commentarea");
  if (oldRedditCommentsArea) {
    return [
      ...oldRedditCommentsArea
        .querySelector(":scope > .sitetable")
        .querySelectorAll(":scope > .comment"),
    ] as HTMLElement[];
  }
  const allComments = getAllComments();

  return allComments.filter((comment) => {
    const rawPadding = comment.style.paddingLeft;
    const padding = Number(rawPadding.replace("px", ""));
    return padding <= 16;
  });
};

export const getAllArticles = () => {
  if (document.querySelector("#siteTable")) {
    return [
      ...document.querySelectorAll("#siteTable > .thing"),
    ] as HTMLElement[];
  }
  const articles = [...document.querySelectorAll("article")] as HTMLElement[];

  return articles;
};

export const scrollToElement = (
  element: HTMLElement,
  scrollingOptions: ScrollingOptions
) => {
  if (!element) return;
  if (scrollingOptions.strategy === "center") {
    scrollToElementAtCenter(element, scrollingOptions);
  } else if (scrollingOptions.strategy === "top") {
    scrollToElementAtTop(element, scrollingOptions);
  }
};

export const findNextElement = (
  scrollingOptions: ScrollingOptions,
  elements: HTMLElement[]
) => {
  const strategy = scrollingOptions.strategy;
  if (strategy === "top") {
    return findNextCommentNearestToTop(elements);
  } else if (strategy === "center") {
    return findNextCommentNearestToCenter(elements);
  }

  return null;
};

export const createCommentWatcher = (
  onNewCommentsAvailable: (
    allComments: HTMLElement[],
    topLevelComments: HTMLElement[]
  ) => void,
  onNewArticlesAvailable: (articles: HTMLElement[]) => void
) =>
  new MutationObserver(
    debounce(() => {
      const newTopLevelComments = getAllTopLevelComments();
      const allComments = getAllComments();
      onNewCommentsAvailable(allComments, newTopLevelComments);
      const newArticles = getAllArticles();
      onNewArticlesAvailable(newArticles);
    }, 200)
  );

const scrollToElementAtTop = (
  comment: HTMLElement,
  scrollingOptions: ScrollingOptions
) => {
  let yScrollPosition = comment.getBoundingClientRect().y - headerHeight;
  if (isPostOverlay()) {
    const overlayPostScrollContainer = getOverlayPostScrollContainer();
    yScrollPosition =
      yScrollPosition +
      (overlayPostScrollContainer?.scrollTop ?? 0) -
      getOverlayPostScrollContainerHeaderHeight();
    overlayPostScrollContainer?.scrollTo({
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

const scrollToElementAtCenter = (
  comment: HTMLElement,
  scrollingOptions: ScrollingOptions
) => {
  comment.scrollIntoView({
    behavior: scrollingOptions.behavior,
    block: "center",
  });
};

const findNextCommentNearestToCenter = (topLevelComments: HTMLElement[]) => {
  let absoluteYViewportCenter = window.innerHeight / 2 + window.scrollY;
  return findNextCommentWith(absoluteYViewportCenter, topLevelComments, 0);
};

const findNextCommentNearestToTop = (topLevelComments: HTMLElement[]) => {
  let absoluteViewportY = window.scrollY + headerHeight;
  let offset = 5;
  if (isPostOverlay()) {
    offset += getOverlayPostScrollContainerHeaderHeight();
  }
  return findNextCommentWith(absoluteViewportY, topLevelComments, offset);
};

const findNextCommentWith = (
  viewportY: number,
  topLevelComments: HTMLElement[],
  skippingThreshold: number
) => {
  let minimumDistance = Infinity; // defaults to high to begin search
  let minimumDistanceCommentElement: HTMLElement | null = null;
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
