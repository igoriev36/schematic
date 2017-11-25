import * as React from "react";
import Scene from "./views/scene";
import Controls from "./views/controls";
import StatusBar from "./views/status_bar";
import Stats from "./views/stats";
import Config from "./config";

interface IProps {
  width: number;
  height: number;
  devicePixelRatio: number;
}

class Editor extends React.Component<IProps> {
  render() {
    return (
      <div id="editor">
        <Scene colors={Config.colors} {...this.props} />,
        {/* <Controls />, */}
        <Stats />,
        {/* <StatusBar helpText="This is help text" /> */}
      </div>
    );
  }
}

export default Editor;
