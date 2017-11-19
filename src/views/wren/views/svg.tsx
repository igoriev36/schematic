import * as React from "react";
import Wren from "../lib/wren";
import DragPoint from "../lib/drag_point";
import { Point, bounds } from "../lib/utils/point";

export interface IProps extends React.Props<{}> {
  action: [string, any[]];
  actions: any;
  handleMouseUp: any;
  layers: Set<string>;
  points: Point[];
  setActivePoint: any;
  setPointPosition: any;
}

class SVG extends React.Component<IProps> {
  svgPoint = (x, y) => {
    let point = (this.refs.svg as SVGSVGElement).createSVGPoint();
    point.x = x;
    point.y = y;
    point = point.matrixTransform(
      (this.refs.svg as SVGSVGElement).getCTM().inverse()
    );
    return [Math.round(point.x), Math.round(point.y)];
  };

  handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const [x, y] = this.svgPoint(event.pageX, event.pageY);
    const pos = { x, y };
    switch (this.props.action[0]) {
      case this.props.actions.DRAGGING_POINTS:
        this.props.action[1].forEach(index => {
          this.props.setPointPosition(index)(x, y);
        });
        break;
    }
  };

  render() {
    const { points, handleMouseUp, setActivePoint, layers } = this.props;
    // console.time("wren");
    const wren = new Wren(points);
    // console.timeEnd("wren");
    // console.log(wren);
    return (
      <svg
        ref="svg"
        onMouseMove={this.handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* {wren.outerPoints.map(Circle(2))} */}
        {/* {wren.innerPoints.map(Circle(2))} */}
        {/* {wren.lines.map(line => line.subPoints.map(Circle(1)))} */}
        {/* {wren.lines.map(line => line.outerSubPoints.map(Circle(1)))} */}
        {/* {wren.lines.map((line, index) =>
          line.blocks.map(block => (
            <polygon
              className={block.type}
              key={block.points.toString()}
              points={block.points.join(",")}
            />
          ))
        )} */}

        {layers.has("finPieces")
          ? wren.finPieces.map((finPiece, index) => (
              <polygon
                className="finPiece"
                key={finPiece.toString()}
                points={finPiece.join(",")}
              />
            ))
          : ""}

        {layers.has("reinforcers")
          ? wren.reinforcers.map((reinforcer, index) => (
              <polygon
                className="reinforcer"
                key={reinforcer.toString()}
                points={reinforcer.join(",")}
              />
            ))
          : ""}

        {layers.has("outerWalls")
          ? wren.outerWalls.map((wall, index) => (
              <polygon
                className="wall"
                key={wall.toString()}
                points={wall.join(",")}
              />
            ))
          : ""}

        {layers.has("innerWalls")
          ? wren.innerWalls.map((wall, index) => (
              <polygon
                className="wall"
                key={wall.toString()}
                points={wall.join(",")}
              />
            ))
          : ""}

        {wren.points.map(([x, y], i) => (
          <DragPoint
            x={x}
            y={y}
            nX={wren.normalizedPoints[i][0]}
            nY={wren.normalizedPoints[i][1]}
            i={i}
            key={i}
            setActivePoint={setActivePoint}
            auto={false}
          />
        ))}
      </svg>
    );
  }
}

export default SVG;
