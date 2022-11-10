const redditUrlPattern = new URLPattern(
  "/r/.*/comments/.*",
  "https://www.reddit.com"
);

export const isCommentsPage = (location) => {
  return redditUrlPattern.test(location.split("?")[0]);
};

export const createUrlWatcher = (onUrlChange, options = { initial: false }) => {
  let lastUrl = location.href;
  const urlWatcher = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      onUrlChange(url);
    }
  });
  urlWatcher.observe(document, { subtree: true, childList: true });

  if (options.initial) {
    onUrlChange(window.location.href);
  }
  return urlWatcher;
};
