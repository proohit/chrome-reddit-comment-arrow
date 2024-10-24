import React, { FC, MouseEvent, useState } from "react";
import Moveable, { OnDrag } from "react-moveable";
import { useChromeStorageLocal } from "use-chrome-storage";
import CommentArrow from "../../images/Reddit-Comment-Arrow.svg";
import { debug } from "../helpers/utils";
import { ScrollingOptions } from "../interfaces/scrolling-options.interface";
import { findNextComment, scrollToComment } from "../services/comments";
type Options = {
  moveDelay: number;
  iconSize: number;
  scrolling: ScrollingOptions;
  arrowPosition: { x: string; y: string };
  stroke?: string;
  fill?: string;
};
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
};

export const ArrowButton: FC<{
  topLevelComments: HTMLElement[];
  comments: HTMLElement[];
}> = (props) => {
  const delayTimer = React.useRef(null);
  const [moveDelay] = useChromeStorageLocal(
    "moveDelay",
    DEFAULT_OPTIONS.moveDelay
  );
  const [iconSize] = useChromeStorageLocal(
    "iconSize",
    DEFAULT_OPTIONS.iconSize
  );
  const [scrolling] = useChromeStorageLocal<ScrollingOptions>(
    "scrolling",
    DEFAULT_OPTIONS.scrolling
  );
  const [arrowPosition, setArrowPosition] = useChromeStorageLocal(
    "arrowPosition",
    DEFAULT_OPTIONS.arrowPosition
  );
  const [userSelectedStroke] = useChromeStorageLocal(
    "stroke",
    DEFAULT_OPTIONS.stroke
  );
  const [userSelectedFill] = useChromeStorageLocal(
    "fill",
    DEFAULT_OPTIONS.fill
  );

  const [dragging, setDragging] = useState(false);
  const buttonRef = React.useRef(null);

  const findAndScrollToNextComment = (e: MouseEvent<HTMLButtonElement>) => {
    if (dragging) return;
    let nextComment: HTMLElement | null = null;
    if (scrolling.scrollTo === "topLevelComment") {
      nextComment = findNextComment(scrolling, props.topLevelComments);
    } else if (scrolling.scrollTo === "nextComment") {
      nextComment = findNextComment(scrolling, props.comments);
    }
    if (nextComment) {
      scrollToComment(nextComment, scrolling);
    }
    debug(nextComment);
  };

  const moveButton = (e: OnDrag) => {
    if (dragging) {
      const screenWidth = window.visualViewport?.width ?? window.innerWidth;
      const screenHeight = window.visualViewport?.height ?? window.innerHeight;
      const iconSizeNumber = Number(iconSize);

      let newPosition = {
        x: e.left,
        y: e.top,
      };

      const exceedsRightScreenBound =
        newPosition.x + iconSizeNumber >= screenWidth;
      const exceedsTopScreenBound = newPosition.y <= 0;
      const exceedsBottomScreenBound =
        newPosition.y + iconSizeNumber >= screenHeight;
      const exceedsLeftScreenBound = newPosition.x <= 0;

      if (exceedsRightScreenBound) {
        newPosition.x = screenWidth - iconSizeNumber;
      }
      if (exceedsLeftScreenBound) {
        newPosition.x = 0;
      }
      if (exceedsBottomScreenBound) {
        newPosition.y = screenHeight - iconSizeNumber;
      }
      if (exceedsTopScreenBound) {
        newPosition.y = 0;
      }

      e.target.style.left = `${newPosition.x}px`;
      e.target.style.top = `${newPosition.y}px`;
    }
  };

  const startDragTimer = () => {
    delayTimer.current = setTimeout(() => {
      setDragging(true);
    }, moveDelay);
  };

  const updatePositionAndEndDragging = () => {
    clearTimeout(delayTimer.current);
    if (dragging) {
      setArrowPosition({
        x: buttonRef.current?.offsetLeft,
        y: buttonRef.current?.offsetTop,
      });
    }
    setDragging(false);
  };

  return (
    <>
      <Moveable
        target={buttonRef}
        draggable
        onDrag={moveButton}
        onDragStart={startDragTimer}
        onDragEnd={updatePositionAndEndDragging}
        hideDefaultLines
        origin={null}
      />
      <button
        ref={buttonRef}
        className={`draggable-btn ${
          props.topLevelComments?.length <= 0 ? "disabled" : ""
        }`}
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          left: arrowPosition?.x,
          top: arrowPosition?.y,
          cursor: dragging ? "move" : "pointer",
          fill: userSelectedFill,
          stroke: userSelectedStroke,
        }}
        title={
          props.topLevelComments?.length <= 0
            ? chrome.i18n.getMessage("extension_comments_loading")
            : ""
        }
        onClick={findAndScrollToNextComment}
      >
        <CommentArrow />
      </button>
    </>
  );
};
