import * as React from "react";
import * as ReactDOM from "react-dom";
import SVG, { IProps as ISVGProps } from "./svg";
import { Point } from "../lib/utils/point";
import Layers from "./layers";

// prettier-ignore
const points: ISVGProps["points"] = [
  [100, 400],
  [300, 400],
  [300, 200],
  [220, 50],
  [100, 100],
];

interface IState {
  action: [string, any[]];
  points: Point[];
  layers: Set<string>;
}

class App extends React.Component<{}, IState> {
  actions = {
    ADDING_GUIDE: "addingGuide",
    DRAGGING_GUIDE: "draggingGuide",
    DRAGGING_POINTS: "draggingPoints",
    DRAWING_SELECT_BOX: "drawingSelectBox",
    NOTHING: "nothing"
  };

  state: IState = {
    action: [this.actions.NOTHING, undefined],
    points: [],
    layers: new Set(["reinforcers", "finPieces"]) //, "outerWalls", "innerWalls"
  };

  componentDidMount() {
    this.setState({ points });
  }

  setPointPosition = index => (x, y) => {
    this.setState(prevState => {
      prevState.points[index][0] = x;
      prevState.points[index][1] = y;
      return prevState;
    });
  };

  setActivePoint = id => e => {
    e.stopPropagation();
    this.setState(prevState => {
      prevState.action = [this.actions.DRAGGING_POINTS, [id]];
      return prevState;
    });
  };

  handleMouseUp = e => {
    this.setState({
      action: [this.actions.NOTHING, null]
    });
  };

  toggleLayer = layerName => event => {
    this.setState(prevState => {
      prevState.layers.has(layerName)
        ? prevState.layers.delete(layerName)
        : prevState.layers.add(layerName);
      return prevState;
    });
  };

  render() {
    return (
      <div>
        <SVG
          action={this.state.action}
          actions={this.actions}
          handleMouseUp={this.handleMouseUp}
          layers={this.state.layers}
          points={this.state.points}
          setActivePoint={this.setActivePoint}
          setPointPosition={this.setPointPosition}
        />
        <Layers layers={this.state.layers} toggleLayer={this.toggleLayer} />
      </div>
    );
  }
}

export default App;
