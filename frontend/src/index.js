import React from "react";
import ReactDOM from "react-dom";
import registerServiceWorker from "./registerServiceWorker";
import App from "./components/App";
// Import CSS styles
import "./assets/css/normalize.css";
import "./assets/css/skeleton.css";
import "./assets/css/go.css";

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
