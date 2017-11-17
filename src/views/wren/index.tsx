import * as React from "react";
import * as ReactDOM from "react-dom";
import SVG, { IProps } from "./svg";

const points: IProps["points"] = [[400, 0], [400, 400], [200, 0]];

ReactDOM.render(<SVG points={points} />, document.querySelector("main"));
