import {
  createCommentWatcher,
  findNextComment,
  scrollToComment,
} from "./comments";
import state from "./state";
import { applyStyles, dragElement, getButton, getButtonImage } from "./ui";
import { createUrlWatcher, isCommentsPage } from "./url";
import { debug } from "./utils";

(async () => {
  // Globals
  await state.storage.loadFromChromeStorage();
  state.storage.registerChangeListener(() => {
    if (isCommentsPage(window.location.href)) {
      applyStyles(getButton(), getButtonImage(), state);
    }
  });

  const bodyMutationObserver = createCommentWatcher(
    (allComments, newTopLevelComments) => {
      if (newTopLevelComments.length !== state.topLevelComments.length) {
        state.topLevelComments = newTopLevelComments;
        state.comments = allComments;
        applyStyles(getButton(), getButtonImage(), state);
      } else {
        state.topLevelComments = newTopLevelComments;
        state.comments = allComments;
      }
    }
  );

  createUrlWatcher(onUrlChange, { initial: true });

  // Click handler
  function findAndScrollToNextComment(e) {
    e.preventDefault();
    if (state.mouseDownIntention === "mouseup") {
      debug("scrollToNextComment", state.mouseDownIntention);
      state.mouseDownIntention = "click";
      return;
    }
    let nextComment = null;
    if (state.storage.scrolling.scrollTo === "topLevelComment") {
      nextComment = findNextComment(
        state.storage.scrolling,
        state.topLevelComments
      );
    } else if (state.storage.scrolling.scrollTo === "nextComment") {
      nextComment = findNextComment(state.storage.scrolling, state.comments);
    }

    scrollToComment(nextComment, state.storage.scrolling);
    debug(nextComment);
  }

  // Ui handling
  function constructUi() {
    if (!isCommentsPage(window.location.href)) {
      return;
    }
    debug("constructing ui");
    bodyMutationObserver.observe(document.body, {
      subtree: true,
      childList: true,
    });

    const btn = document.createElement("button");
    const img = document.createElement("img");

    img.src = chrome.runtime.getURL("./images/Reddit-Comment-Arrow.svg");

    applyStyles(btn, img, state);

    // events
    dragElement(btn, state);
    btn.addEventListener("click", findAndScrollToNextComment);

    btn.appendChild(img);
    document.body.appendChild(btn);
  }

  function deconstructUi() {
    debug("deconstructing ui");
    const btn = document.querySelector(".draggable-btn");
    if (btn) {
      document.body.removeChild(btn);
    }
    bodyMutationObserver.disconnect();
  }

  function onUrlChange(newUrl) {
    if (isCommentsPage(newUrl)) {
      debug("Url changed and is comments page");
      constructUi();
    } else {
      debug("Url changed and is no comments page");
      deconstructUi();
    }
  }

  function visualDebug(yPos, color = "red") {
    const vis = document.createElement("hr");
    vis.style.top = yPos + "px";
    vis.style.position = "absolute";
    vis.style.width = "100%";
    vis.style.borderTop = `10px solid ${color}`;
    document.body.appendChild(vis);
  }
})();
