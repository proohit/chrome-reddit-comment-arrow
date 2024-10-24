import React, { useEffect, useState } from "react";
import { debug } from "../helpers/utils";
import { createCommentWatcher } from "../services/comments";
import { createUrlWatcher, isCommentsPage } from "../services/url";
import { ArrowButton } from "./ArrowButton";

const useComments = () => {
  const [commentsPage, setCommentsPage] = useState(false);
  const [topLevelComments, setTopLevelComments] = useState([]);
  const [comments, setComments] = useState([]);

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
        debug("dom changed, reloading top level comments", newTopLevelComments);
        if (newTopLevelComments.length !== topLevelComments.length) {
          setTopLevelComments(newTopLevelComments);
          setComments(allComments);
        }
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
    setComments,
    setTopLevelComments,
    setCommentsPage,
  };
};

export function App() {
  const { commentsPage, comments, topLevelComments } = useComments();

  return (
    commentsPage && (
      <ArrowButton comments={comments} topLevelComments={topLevelComments} />
    )
  );
}
