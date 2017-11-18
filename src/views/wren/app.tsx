import * as React from "react";
import * as ReactDOM from "react-dom";
import SVG, { IProps as ISVGProps } from "./svg";
import { Point } from "./lib/point";

// prettier-ignore
const points: ISVGProps["points"] = [
  [100, 400],
  [500, 400],
  [500, 200],
  [300, 50],
  [100, 100],
];

interface IState {
  action: [string, any[]];
  points: Point[];
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
    points: []
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

  render() {
    return (
      <SVG
        action={this.state.action}
        actions={this.actions}
        handleMouseUp={this.handleMouseUp}
        points={this.state.points}
        setActivePoint={this.setActivePoint}
        setPointPosition={this.setPointPosition}
      />
    );
  }
}

export default App;
