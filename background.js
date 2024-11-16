chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "reddit-comment-arrow-settings") {
    await chrome.runtime.openOptionsPage();
  }
});
chrome.contextMenus.removeAll();
chrome.contextMenus.create({
  id: "reddit-comment-arrow-settings",
  title: "Reddit Comment Arrow",
  documentUrlPatterns: [
    "https://www.reddit.com/*",
    "https://reddit.com/*",
    "https://old.reddit.com/*",
  ],
});
