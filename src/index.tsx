import "./scss/_index.scss";
import React from "react";
import ReactDOM from "react-dom";
import BoardPage from "./board-page/board-page";
import reportWebVitals from "./utils/reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <BoardPage />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
