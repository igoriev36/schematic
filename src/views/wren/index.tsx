import * as React from "react";
import * as ReactDOM from "react-dom";
import SVG, { IProps } from "./svg";

// prettier-ignore
const points: IProps["points"] = [
  [100, 400],
  [500, 400],
  [500, 200],
  [300, 50],
  [100, 100],
];

ReactDOM.render(<SVG points={points} />, document.querySelector("main"));
