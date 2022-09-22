import {
  findNextComment,
  getAllTopLevelComments,
  scrollToComment,
} from "./comments";
import { getButton, getButtonImage } from "./ui";
import { createUrlWatcher, isCommentsPage } from "./url";
import { debounce, debug } from "./utils";

(async () => {
  // Option variables
  let moveDelay;
  let iconSize;
  let scrolling;

  const res = await chrome.storage.local.get({
    moveDelay: 500,
    iconSize: 80,
    scrolling: { strategy: "top", behavior: "smooth" },
  });

  chrome.storage.local.onChanged.addListener((changes) => {
    debug("changes in storage", changes);
    if (changes.moveDelay) {
      moveDelay = changes.moveDelay.newValue;
    }
    if (changes.iconSize) {
      iconSize = changes.iconSize.newValue;
    }
    if (changes.scrolling) {
      scrolling = changes.scrolling.newValue;
    }
    if (isCommentsPage(window.location.href)) {
      applyStyles(getButton(), getButtonImage());
    }
  });

  moveDelay = res.moveDelay;
  iconSize = res.iconSize;
  scrolling = res.scrolling;

  // Globals

  let topLevelComments = [];

  let mouseDownIntention = "click";

  const applyStyles = (btn, img) => {
    btn.className = "draggable-btn";
    chrome.storage.local.get(
      // default values
      { arrowPosition: { x: `calc(100% - ${iconSize}px - 25px)`, y: "50vh" } },
      ({ arrowPosition }) => {
        debug("locally saved arrow position", arrowPosition);
        btn.style.top = arrowPosition.y;
        btn.style.left = arrowPosition.x;
      }
    );

    img.style.width = `${iconSize}px`;
    img.style.height = `${iconSize}px`;

    if (topLevelComments.length <= 0) {
      btn.classList.add("disabled");
      btn.title = "Loading top level comments...";
    } else {
      btn.classList.remove("disabled");
      btn.title = "";
    }
  };

  const dragElement = (el) => {
    let previousCursorX = 0,
      previousCursorY = 0,
      currentCursorX = 0,
      currentCursorY = 0;

    // this is to track how long a mousedown is being pressed to determine if move or click. Also imitates the mobile app behaviour to hold some time to move.
    let intentionTimeout;

    const elementDrag = (e) => {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      previousCursorX = currentCursorX - e.clientX;
      previousCursorY = currentCursorY - e.clientY;
      currentCursorX = e.clientX;
      currentCursorY = e.clientY;
      // set the element's new position:
      const newElementX = el.offsetLeft - previousCursorX;
      const newElementY = el.offsetTop - previousCursorY;
      el.style.top = newElementY + "px";
      el.style.left = newElementX + "px";
    };

    const closeDragElement = () => {
      if (intentionTimeout) {
        clearTimeout(intentionTimeout);
      }
      debug("closeDragElement", { mouseDownIntention });

      document.onmouseup = null;
      document.onmousemove = null;

      if (mouseDownIntention === "mouseup") {
        chrome.storage.local.set({
          arrowPosition: { x: el.style.left, y: el.style.top },
        });
      }
    };

    const dragMouseDown = (e) => {
      e.preventDefault();
      intentionTimeout = setTimeout(() => {
        mouseDownIntention = "mouseup";
        debug("dragMouseDown > intentionTimeout", { mouseDownIntention });
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
      }, moveDelay);
      e = e || window.event;
      // get the mouse cursor position at startup:
      currentCursorX = e.clientX;
      currentCursorY = e.clientY;
      document.onmouseup = closeDragElement;
    };

    el.onmousedown = dragMouseDown;
  };

  const findAndScrollToNextComment = (e) => {
    e.preventDefault();
    if (mouseDownIntention === "mouseup") {
      debug("scrollToNextComment", { mouseDownIntention });
      mouseDownIntention = "click";
      return;
    }
    const nextComment = findNextComment(scrolling, topLevelComments);
    scrollToComment(nextComment, scrolling);
    debug(nextComment);
  };

  let bodyMutationObserver = new MutationObserver(
    debounce(() => {
      const newTopLevelComments = getAllTopLevelComments();
      if (newTopLevelComments.length !== topLevelComments.length) {
        topLevelComments = newTopLevelComments;
        applyStyles(getButton(), getButtonImage());
      } else {
        topLevelComments = newTopLevelComments;
      }
      debug("dom changed, reloading top level comments", topLevelComments);
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

    applyStyles(btn, img);

    // events
    dragElement(btn);
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
