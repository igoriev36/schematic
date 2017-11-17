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
    console.log(wren);
    return (
      <svg>
        {wren.points.map(this.circle(3))}
        {/* {wren.midpoints.map(this.circle(4))} */}
        {wren.lines.map(line => line.subPoints.map(this.circle(1)))}
        {wren.lines.map((line, index) => this.circle(5)(line.midpoint, index))}
      </svg>
    );
  }
}

export default SVG;
