const getAllComments = () =>
  [...document.querySelectorAll(".Comment")].map(
    (comment) => comment.parentNode
  );

const getAllTopLevelComments = () => {
  const allComments = getAllComments();
  return allComments.filter((comment) => {
    const rawPadding = comment.style.paddingLeft;
    const padding = Number(rawPadding.replace("px", ""));
    return padding <= 16;
  });
};

const debug = (...data) => {
  console.debug("[REDDIT-COMMENT-ARROW]", data);
};

const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

(async () => {
  // Option variables
  let moveDelay;
  let iconSize;

  const res = await chrome.storage.local.get({
    moveDelay: 500,
    iconSize: 80,
  });

  chrome.storage.local.onChanged.addListener((changes) => {
    if (changes.moveDelay) {
      moveDelay = changes.moveDelay.newValue;
    }
    if (changes.iconSize) {
      iconSize = changes.iconSize.newValue;
    }
    if (isCommentsPage(window.location.href)) {
      applyStyles();
    }
  });

  moveDelay = res.moveDelay;
  iconSize = res.iconSize;

  // Globals

  let topLevelComments = [];

  let mouseDownIntention = "click";

  const applyStyles = (btn, img) => {
    btn.className = "draggable-btn";
    chrome.storage.local.get(
      // default values
      { arrowPosition: { x: "50vh", y: "calc(100vh - 25px)" } },
      ({ arrowPosition }) => {
        debug("locally saved arrow position", arrowPosition);
        btn.style.top = arrowPosition.y;
        btn.style.left = arrowPosition.x;
      }
    );
    // TODO: make this customizable
    img.style.width = `${iconSize}px`;
    img.style.height = `${iconSize}px`;
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

  const scrollToNextComment = (e) => {
    e.preventDefault();
    if (mouseDownIntention === "mouseup") {
      debug("scrollToNextComment", { mouseDownIntention });
      mouseDownIntention = "click";
      return;
    }
    const nextComment = findNextCommentNearestToCenter();
    if (nextComment) {
      nextComment.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    debug(nextComment);
  };

  const findNextCommentNearestToCenter = () => {
    let absoluteYViewportCenter = window.innerHeight / 2 + window.scrollY;
    let minimumDistance = Infinity; // defaults to high to begin search
    let minimumDistanceCommentElement = null;
    for (let commentElement of topLevelComments) {
      const commentElementPos = commentElement.getBoundingClientRect();
      let absoluteYCommentElement = commentElementPos.y + window.scrollY;
      // negative distance means above center, positive means below center, zero means exactly at center
      let distanceBetweenElementAndViewPortCenter =
        absoluteYCommentElement - absoluteYViewportCenter;
      // we want the next element. If the element is exactly at or above center, we skip this current element
      if (distanceBetweenElementAndViewPortCenter <= 0) continue;
      if (distanceBetweenElementAndViewPortCenter < minimumDistance) {
        minimumDistance = distanceBetweenElementAndViewPortCenter;
        minimumDistanceCommentElement = commentElement;
      }
    }
    return minimumDistanceCommentElement;
  };

  let bodyMutationObserver = new MutationObserver(
    debounce(() => {
      topLevelComments = getAllTopLevelComments();
      debug("dom changed, reloading top level comments", topLevelComments);
    }, 200)
  );

  const constructUi = async () => {
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
    btn.addEventListener("click", scrollToNextComment);

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

  // url helper

  const redditUrlPattern = new URLPattern(
    "/r/.*/comments/.*",
    "https://www.reddit.com"
  );

  const isCommentsPage = (location) => {
    return redditUrlPattern.test(location);
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

  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      onUrlChange(url);
    }
  }).observe(document, { subtree: true, childList: true });

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
