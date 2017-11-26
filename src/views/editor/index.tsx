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
  state = {
    dimensions: {}
  };

  updateDimensions = dimensions => {
    this.setState({ dimensions });
  };

  render() {
    return (
      <div id="editor">
        <Scene
          colors={Config.colors}
          {...this.props}
          updateDimensions={this.updateDimensions}
        />,
        {/* <Controls />, */}
        <Stats dimensions={this.state.dimensions} />,
        {/* <StatusBar helpText="This is help text" /> */}
      </div>
    );
  }
}

export default Editor;
