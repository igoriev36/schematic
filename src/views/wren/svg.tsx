import * as React from "react";
import Wren from "./lib/wren";

export interface IProps {
  points: [number, number][];
}

class SVG extends React.Component<IProps> {
  circle = radius => ([x, y], index) => (
    <circle key={index} cx={x} cy={y} r={radius} />
  );

  render() {
    const wren = new Wren(this.props.points);
    return (
      <svg>
        {wren.points.map(this.circle(3))}
        {/* {wren.midpoints.map(this.circle(4))} */}
        {wren.subPoints.map(line => line.map(this.circle(1)))}
      </svg>
    );
  }
}

export default SVG;
