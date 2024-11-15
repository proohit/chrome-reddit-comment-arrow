import React, { FC, useEffect, useRef, useState } from "react";
import Moveable, { OnDrag } from "react-moveable";
import { useChromeStorageLocal } from "use-chrome-storage";
import CommentArrow from "../../images/Reddit-Comment-Arrow.svg";
import { DEFAULT_OPTIONS } from "../constants/default-options";
import { debug } from "../helpers/utils";
import { ScrollingOptions } from "../interfaces/scrolling-options.interface";
import { findNextElement, scrollToElement } from "../services/comments";
import {
  getPositionInBounds,
  isElementInViewport,
} from "../services/positioning";

type ArrowButtonProps = {
  articles: HTMLElement[];
  isCommentsPage?: boolean;
  topLevelComments: HTMLElement[];
  comments: HTMLElement[];
};

export const ArrowButton: FC<ArrowButtonProps> = (props) => {
  const buttonRef = useRef(null);

  const dragDelayTimer = useRef(null);
  const [dragging, setDragging] = useState(false);

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
  const [includeArticles] = useChromeStorageLocal("includeArticles", true);

  useEffect(() => {
    const handleResize = () => {
      const isElementInView = isElementInViewport(
        buttonRef.current?.offsetLeft,
        buttonRef.current?.offsetTop,
        Number(iconSize)
      );

      if (buttonRef.current && !isElementInView) {
        const newPosition = getPositionInBounds(
          buttonRef.current.offsetLeft,
          buttonRef.current.offsetTop,
          Number(iconSize)
        );
        setArrowPosition({
          x: newPosition.x.toString(),
          y: newPosition.y.toString(),
        });

        buttonRef.current.style.left = `${newPosition.x}px`;
        buttonRef.current.style.top = `${newPosition.y}px`;
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const findAndScrollToNextElement = () => {
    if (dragging) return;
    let nextComment: HTMLElement | null = null;

    if (includeArticles && !props.isCommentsPage) {
      nextComment = findNextElement(scrolling, props.articles);
    } else if (
      props.isCommentsPage &&
      scrolling.scrollTo === "topLevelComment"
    ) {
      nextComment = findNextElement(scrolling, props.topLevelComments);
    } else if (props.isCommentsPage && scrolling.scrollTo === "nextComment") {
      nextComment = findNextElement(scrolling, props.comments);
    }

    if (nextComment) {
      scrollToElement(nextComment, scrolling);
    }
    debug(nextComment);
  };

  const moveButton = (e: OnDrag) => {
    if (dragging) {
      const newPosition = getPositionInBounds(e.left, e.top, Number(iconSize));

      e.target.style.left = `${newPosition.x}px`;
      e.target.style.top = `${newPosition.y}px`;
    }
  };

  const startDragTimer = () => {
    dragDelayTimer.current = setTimeout(() => {
      setDragging(true);
    }, moveDelay);
  };

  const updatePositionAndEndDragging = () => {
    clearTimeout(dragDelayTimer.current);
    if (dragging) {
      setArrowPosition({
        x: buttonRef.current?.offsetLeft,
        y: buttonRef.current?.offsetTop,
      });
    }
    setDragging(false);
  };

  const buttonDisabled =
    (props.isCommentsPage && props.topLevelComments?.length <= 0) ||
    (!props.isCommentsPage && props.articles?.length <= 0);

  const title =
    props.isCommentsPage && props.topLevelComments?.length <= 0
      ? chrome.i18n.getMessage("extension_comments_loading")
      : !props.isCommentsPage && props.articles?.length <= 0
      ? chrome.i18n.getMessage("extension_articles_loading")
      : "";

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
        className={`draggable-btn ${buttonDisabled ? "disabled" : ""}`}
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          left: arrowPosition?.x,
          top: arrowPosition?.y,
          cursor: dragging ? "move" : "pointer",
        }}
        title={title}
        onClick={findAndScrollToNextElement}
      >
        <CommentArrow />
      </button>
    </>
  );
};
