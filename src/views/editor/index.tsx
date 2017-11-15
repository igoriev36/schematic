import * as React from "react";
import Scene from "./views/scene";
import Controls from "./views/controls";

interface IProps {
  width: number;
  height: number;
  devicePixelRatio: number;
}

class Editor extends React.Component<IProps> {
  render() {
    return [<Scene bgColor={0x222222} {...this.props} />, <Controls />];
  }
}

export default Editor;
