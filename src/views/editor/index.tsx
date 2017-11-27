import * as React from "react";
import Scene from "./views/scene";
import Controls from "./views/controls";
import StatusBar from "./views/status_bar";
import Stats from "./views/stats";
import Config from "./config";
import Toggler from "./views/toggler";

interface IProps {
  width: number;
  height: number;
  devicePixelRatio: number;
}

class Editor extends React.Component<IProps> {
  state = {
    dimensions: {},
    showModel: false
  };

  updateDimensions = dimensions => {
    this.setState({ dimensions });
  };

  toggleModel = () => {
    console.log({ toggleModel: this.state.showModel });
    this.setState({ showModel: !this.state.showModel });
  };

  render() {
    const { showModel } = this.state;
    return (
      <div id="editor">
        <Scene
          colors={Config.colors}
          {...this.props}
          showModel={showModel}
          updateDimensions={this.updateDimensions}
        />,
        {/* <Controls />, */}
        <Stats dimensions={this.state.dimensions} />,
        <Toggler showModel={showModel} toggleModel={this.toggleModel} />,
        {/* <StatusBar helpText="This is help text" /> */}
      </div>
    );
  }
}

export default Editor;
