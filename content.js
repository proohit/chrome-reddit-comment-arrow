const debug = (...data) => {
  console.debug("[REDDIT-COMMENT-ARROW]", data);
};

const getAllComments = () =>
  [...document.querySelectorAll(".Comment")].map(
    (comment) => comment.parentNode
  );

const getAllTopLevelComments = () => {
  const allComments = getAllComments();
  return allComments.filter((comment) => {
    const rawPad = comment.style.paddingLeft;
    let pad = Number(rawPad.replace("px", ""));
    return pad <= 16;
  });
};

let topLevelComments = getAllTopLevelComments();
debug("initial topLevelComments", topLevelComments);
const resizeObserver = new ResizeObserver(() => {
  topLevelComments = getAllTopLevelComments();
  debug(
    "Document body size changed, reloading all topLevelComments",
    topLevelComments
  );
});

resizeObserver.observe(document.body);

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
  img.style.width = "80px";
  img.style.height = "80px";
};

const dragElement = (el, timeout) => {
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
    }, timeout);
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

const prepareUi = () => {
  const btn = document.createElement("button");
  const img = document.createElement("img");

  img.src = chrome.runtime.getURL("./images/Reddit-Comment-Arrow.svg");

  applyStyles(btn, img);

  // events
  // TODO: make timeout customizable
  dragElement(btn, 500);
  btn.addEventListener("click", scrollToNextComment);

  btn.appendChild(img);
  document.body.appendChild(btn);
};

prepareUi();

function visualDebug(yPos, color = "red") {
  const vis = document.createElement("hr");
  vis.style.top = yPos + "px";
  vis.style.position = "absolute";
  vis.style.width = "100%";
  vis.style.borderTop = `10px solid ${color}`;
  document.body.appendChild(vis);
}
