import React from "react";
import ReactDOM from "react-dom/client";

import "./reset.css";
import "./index.css";
import App from "./App";

// this index.js is the first thing that runs in a react app

// ReactDOM.render(<App />, document.getElementById("root")); // old way
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />); // render <App> in #root element
