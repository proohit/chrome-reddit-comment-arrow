import React, { useState } from "react";
import Moveable from "react-moveable";
import { useChromeStorageLocal } from "use-chrome-storage";
import { debug } from "../helpers/utils";
import { findNextComment, scrollToComment } from "../services/comments";

export const DEFAULT_ARROW_POSITION = (iconSize) => ({
  x: `calc(100% - ${iconSize}px - 25px)`,
  y: "50vh",
});

export const DEFAULT_OPTIONS = {
  moveDelay: 500,
  iconSize: 80,
  scrolling: {
    strategy: "top",
    behavior: "smooth",
    scrollTo: "topLevelComment",
  },
  arrowPosition: DEFAULT_ARROW_POSITION(80),
};

export const ArrowButton = (props) => {
  const delayTimer = React.useRef(null);
  const [moveDelay] = useChromeStorageLocal(
    "moveDelay",
    DEFAULT_OPTIONS.moveDelay
  );
  const [iconSize] = useChromeStorageLocal(
    "iconSize",
    DEFAULT_OPTIONS.iconSize
  );
  const [scrolling] = useChromeStorageLocal(
    "scrolling",
    DEFAULT_OPTIONS.scrolling
  );
  const [arrowPosition, setArrowPosition] = useChromeStorageLocal(
    "arrowPosition",
    DEFAULT_OPTIONS.arrowPosition
  );
  const [dragging, setDragging] = useState(false);
  const buttonRef = React.useRef(null);

  const findAndScrollToNextComment = (e) => {
    e.preventDefault();
    if (dragging) return;
    let nextComment = null;
    if (scrolling.scrollTo === "topLevelComment") {
      nextComment = findNextComment(scrolling, props.topLevelComments);
    } else if (scrolling.scrollTo === "nextComment") {
      nextComment = findNextComment(scrolling, props.comments);
    }

    scrollToComment(nextComment, scrolling);
    debug(nextComment);
  };

  const moveButton = (e) => {
    if (dragging) {
      const screenWidth = window.visualViewport.width;
      const screenHeight = window.visualViewport.height;
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

  const updatePositionAndEndDragging = (e) => {
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
        origin={null}
        hideDefaultLines
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
        }}
        title={
          props.topLevelComments?.length <= 0
            ? chrome.i18n.getMessage("extension_comments_loading")
            : ""
        }
        onClick={findAndScrollToNextComment}
      >
        <img
          src={chrome.runtime.getURL("./images/Reddit-Comment-Arrow.svg")}
          height="100%"
          width="100%"
        />
      </button>
    </>
  );
};