import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import { EXTENSION_WRAPPER } from "./constants/extension-wrapper";

const btnWrapper = document.createElement("div");
btnWrapper.id = EXTENSION_WRAPPER;
document.body.appendChild(btnWrapper);
const root = createRoot(document.getElementById(EXTENSION_WRAPPER));

root.render(<App />);
