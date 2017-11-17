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
        {wren.outerPoints.map(this.circle(2))}
        {wren.points.map(this.circle(3))}
        {wren.innerPoints.map(this.circle(2))}

        {wren.lines.map(line => line.subPoints.map(this.circle(1)))}
        {wren.lines.map(line => line.offsetPoints.map(this.circle(1)))}
      </svg>
    );
  }
}

export default SVG;
