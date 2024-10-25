import { useEffect, useState } from "react";
import { useChromeStorageLocal } from "use-chrome-storage";
import { debug } from "../helpers/utils";
import { createCommentWatcher } from "../services/comments";
import { createUrlWatcher, isCommentsPage } from "../services/url";

export const useComments = () => {
  const [commentsPage, setCommentsPage] = useState(false);
  const [topLevelComments, setTopLevelComments] = useState([]);
  const [comments, setComments] = useState([]);

  const [includeArticles] = useChromeStorageLocal("includeArticles", true);
  const [articles, setArticles] = useState([]);

  function onUrlChange(newUrl: string) {
    if (isCommentsPage(newUrl)) {
      debug("Url changed and is comments page");
      setCommentsPage(true);
    } else {
      debug("Url changed and is no comments page");
      setCommentsPage(false);
      setTopLevelComments([]);
      setComments([]);
    }
  }

  useEffect(() => {
    const bodyMutationObserver = createCommentWatcher(
      (allComments, newTopLevelComments) => {
        if (newTopLevelComments.length !== topLevelComments.length) {
          setTopLevelComments(newTopLevelComments);
          setComments(allComments);
        }
      },
      (newArticles) => {
        setArticles(newArticles);
      }
    );

    bodyMutationObserver.observe(document.body, {
      subtree: true,
      childList: true,
    });

    return () => {
      bodyMutationObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const urlWatcherObserver = createUrlWatcher(onUrlChange, { initial: true });

    return () => {
      urlWatcherObserver.disconnect();
    };
  }, []);

  return {
    commentsPage,
    topLevelComments,
    comments,
    articles,
    setComments,
    setTopLevelComments,
    setCommentsPage,
    setArticles,
  };
};
