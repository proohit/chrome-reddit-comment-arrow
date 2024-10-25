import React from "react";
import { useChromeStorageLocal } from "use-chrome-storage";
import { useComments } from "../hooks/useComments";
import { ArrowButton } from "./ArrowButton";
import { ColorManager } from "./ColorManager";

export function App() {
  const [includeArticles] = useChromeStorageLocal("includeArticles", true);
  const { articles, commentsPage, comments, topLevelComments } = useComments();

  return (
    <ColorManager>
      {(commentsPage || includeArticles) && (
        <ArrowButton
          isCommentsPage={commentsPage}
          articles={articles}
          comments={comments}
          topLevelComments={topLevelComments}
        />
      )}
    </ColorManager>
  );
}
