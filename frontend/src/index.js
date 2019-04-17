import React from "react";
import ReactDOM from "react-dom";
import url from "url-parameters";
import { unregister } from "./registerServiceWorker";
import App from "./components/App";
// Import CSS styles
import "./assets/css/normalize.css";
import "./assets/css/skeleton.css";
import "./assets/css/go.css";

// Disable the Push State by setting the second parameter to false
url.enable(() => {}, false);

ReactDOM.render(<App />, document.getElementById("root"));
unregister(); // Do not use Service Workers and unregister those in use
