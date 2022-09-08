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
  chrome.storage.local.get(["arrow-position"], (res) => {
    if (res.x && res.y) {
      btn.style.top = res.y + "px";
      btn.style.left = res.x + "px";
    } else {
      btn.style.top = "50vh";
      btn.style.left = "calc(100vh - 25px)";
    }
  });
  img.style.width = "80px";
  img.style.height = "80px";
};

const dragElement = (el) => {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  let intentionTimeout;

  const elementDrag = (e) => {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    const newX = el.offsetLeft - pos1;
    const newY = el.offsetTop - pos2;
    el.style.top = newY + "px";
    el.style.left = newX + "px";
    chrome.storage.local.set({ x: newX, y: newY });
  };

  const closeDragElement = () => {
    if (intentionTimeout) {
      clearTimeout(intentionTimeout);
    }
    debug("closeDragElement", { mouseDownIntention });

    document.onmouseup = null;
    document.onmousemove = null;
  };

  const dragMouseDown = (e) => {
    e.preventDefault();
    intentionTimeout = setTimeout(() => {
      mouseDownIntention = "mouseup";
      debug("dragMouseDown > intentionTimeout", { mouseDownIntention });
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }, 500);
    e = e || window.event;
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
  };

  el.onmousedown = dragMouseDown;
};

const scrollToNextComment = (e) => {
  e.preventDefault();
  e.stopPropagation();
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
  let minimumDistance = 50000; // defaults to high to begin search
  let minimumDistanceCommentElement = null;
  for (let commentElement of topLevelComments) {
    const commentElementPos = commentElement.getBoundingClientRect();
    let absoluteYCommentElement = commentElementPos.y + window.scrollY;
    // negative distance means above center, positive means below center, zero means exactly at center
    let distanceBetweenElementAndViewPortCenter =
      absoluteYCommentElement - absoluteYViewportCenter;
    // we want the next element, since we saw this comment already
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
  dragElement(btn);
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
