import * as React from "react";
import Scene from "./views/scene";
import Controls from "./views/controls";
import Config from "./config";
const MiniSignal = require("mini-signals");

interface IProps {
  width: number;
  height: number;
  devicePixelRatio: number;
}

class Editor extends React.Component<IProps> {
  private signal;
  constructor(props) {
    super(props);
    this.signal = new MiniSignal();
  }
  render() {
    return [
      <Scene signal={this.signal} colors={Config.colors} {...this.props} />,
      <Controls />
    ];
  }
}

export default Editor;
