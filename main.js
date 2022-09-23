import {
  findNextComment,
  getAllTopLevelComments,
  scrollToComment,
} from "./comments";
import state from "./state";
import { applyStyles, dragElement, getButton, getButtonImage } from "./ui";
import { createUrlWatcher, isCommentsPage } from "./url";
import { debounce, debug } from "./utils";

(async () => {
  await state.storage.loadFromChromeStorage();
  state.storage.registerChangeListener(() => {
    if (isCommentsPage(window.location.href)) {
      applyStyles(getButton(), getButtonImage(), state);
    }
  });

  const findAndScrollToNextComment = (e) => {
    e.preventDefault();
    if (state.mouseDownIntention === "mouseup") {
      debug("scrollToNextComment", state.mouseDownIntention);
      state.mouseDownIntention = "click";
      return;
    }
    const nextComment = findNextComment(
      state.storage.scrolling,
      state.topLevelComments
    );
    scrollToComment(nextComment, state.storage.scrolling);
    debug(nextComment);
  };

  let bodyMutationObserver = new MutationObserver(
    debounce(() => {
      const newTopLevelComments = getAllTopLevelComments();
      if (newTopLevelComments.length !== state.topLevelComments.length) {
        state.topLevelComments = newTopLevelComments;
        applyStyles(getButton(), getButtonImage(), state);
      } else {
        state.topLevelComments = newTopLevelComments;
      }
      debug(
        "dom changed, reloading top level comments",
        state.topLevelComments
      );
    }, 200)
  );

  const constructUi = async () => {
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
  };

  const deconstructUi = () => {
    debug("deconstructing ui");
    const btn = document.querySelector(".draggable-btn");
    if (btn) {
      document.body.removeChild(btn);
    }
    bodyMutationObserver.disconnect();
  };

  const onUrlChange = (newUrl) => {
    if (isCommentsPage(newUrl)) {
      debug("Url changed and is comments page");
      constructUi();
    } else {
      debug("Url changed and is no comments page");
      deconstructUi();
    }
  };

  createUrlWatcher(onUrlChange);
  onUrlChange(window.location.href);

  function visualDebug(yPos, color = "red") {
    const vis = document.createElement("hr");
    vis.style.top = yPos + "px";
    vis.style.position = "absolute";
    vis.style.width = "100%";
    vis.style.borderTop = `10px solid ${color}`;
    document.body.appendChild(vis);
  }
})();
