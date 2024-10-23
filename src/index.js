import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";

const btnWrapper = document.createElement("div");
btnWrapper.id = "reddit-comment-arrow-wrapper";
document.body.appendChild(btnWrapper);
const root = createRoot(
  document.getElementById("reddit-comment-arrow-wrapper")
);

root.render(<App />);
