const commentsSubPath = "/r/.*/comments/.*";
const redditUrlPattern = new URLPattern(
  commentsSubPath,
  "https://www.reddit.com"
);

const oldRedditUrlPattern = new URLPattern(
  commentsSubPath,
  "https://old.reddit.com"
);

export const isCommentsPage = (location: string) => {
  return (
    redditUrlPattern.test(location.split("?")[0]) ||
    oldRedditUrlPattern.test(location.split("?")[0])
  );
};

export const createUrlWatcher = (
  onUrlChange: (newUrl: string) => void,
  options = { initial: false }
) => {
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
