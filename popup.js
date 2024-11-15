const getMessage = (message) => {
  return chrome.i18n.getMessage(message);
};

const localizeHtmlPage = () => {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.innerHTML = getMessage(element.getAttribute("data-i18n"));
  });
};

localizeHtmlPage();

chrome.storage.local.get(
  {
    iconSize: "80",
    moveDelay: 500,
    scrolling: {
      strategy: "top",
      behavior: "smooth",
      scrollTo: "topLevelComment",
    },
    stroke: "",
    fill: "",
    fillEnabled: false,
    strokeEnabled: false,
    includeArticles: true,
    showScrollTop: true,
  },
  (res) => {
    document.getElementById("iconSize").value = res.iconSize;
    document.getElementById("moveDelay").value = res.moveDelay;
    document.getElementById("scrollingStrategy").value = res.scrolling.strategy;
    document.getElementById("scrollTo").value = res.scrolling.scrollTo;
    document.getElementById("scrollingBehavior").value = res.scrolling.behavior;
    if (res.stroke && res.strokeEnabled)
      document.getElementById("strokeColor").value = res.stroke;
    if (res.fill && res.fillEnabled)
      document.getElementById("fillColor").value = res.fill;

    document.getElementById("fillCheckbox").checked = res.fillEnabled;
    document.getElementById("strokeCheckbox").checked = res.strokeEnabled;
    document.getElementById("includeArticles").checked = res.includeArticles;
    document.getElementById("showScrollTop").checked = res.showScrollTop;
  }
);

const handleSave = () => {
  const strokeEnabled = document.getElementById("strokeCheckbox").checked;
  const fillEnabled = document.getElementById("fillCheckbox").checked;

  return chrome.storage.local.set({
    iconSize: document.getElementById("iconSize").value,
    moveDelay: document.getElementById("moveDelay").value,
    scrolling: {
      strategy: document.getElementById("scrollingStrategy").value,
      behavior: document.getElementById("scrollingBehavior").value,
      scrollTo: document.getElementById("scrollTo").value,
    },
    stroke: strokeEnabled
      ? document.getElementById("strokeColor").value
      : undefined,
    fill: fillEnabled ? document.getElementById("fillColor").value : undefined,
    fillEnabled,
    strokeEnabled,
    includeArticles: document.getElementById("includeArticles").checked,
    showScrollTop: document.getElementById("showScrollTop").checked,
  });
};

const handleResetSave = async () => {
  await chrome.storage.local.set({
    iconSize: "80",
    moveDelay: 500,
    scrolling: { strategy: "top", behavior: "smooth" },
    fill: "",
    stroke: "",
    fillEnabled: false,
    strokeEnabled: false,
    includeArticles: true,
    showScrollTop: true,
  });

  document.getElementById("iconSize").value = "80";
  document.getElementById("moveDelay").value = 500;
  document.getElementById("scrollingStrategy").value = "top";
  document.getElementById("scrollingBehavior").value = "smooth";
  document.getElementById("scrollTo").value = "topLevelComment";
  document.getElementById("strokeColor").value = "";
  document.getElementById("fillColor").value = "";
  document.getElementById("fillCheckbox").checked = false;
  document.getElementById("strokeCheckbox").checked = false;
  document.getElementById("includeArticles").checked = true;
  document.getElementById("showScrollTop").checked = true;
};

const handleResetButtonPosition = () => {
  return chrome.storage.local.set({
    arrowPosition: {
      x: `calc(100% - ${document.getElementById("iconSize").value}px - 25px)`,
      y: "50vh",
    },
  });
};

document.getElementById("saveOptions").onclick = async () => {
  await handleSave();
};

document.getElementById("resetOptions").onclick = async () => {
  await handleResetSave();
};

document.getElementById("resetPosition").onclick = async () => {
  await handleResetButtonPosition();
};
