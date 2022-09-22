const redditUrlPattern = new URLPattern(
  "/r/.*/comments/.*",
  "https://www.reddit.com"
);

export const isCommentsPage = (location) => {
  return redditUrlPattern.test(location);
};

export const createUrlWatcher = (onUrlChange) => {
  let lastUrl = location.href;
  const urlWatcher = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      onUrlChange(url);
    }
  });
  urlWatcher.observe(document, { subtree: true, childList: true });
  return urlWatcher;
};
