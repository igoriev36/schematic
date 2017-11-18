import * as React from "react";

function DragPoint({ x, y, i, setActivePoint, auto }) {
  return (
    <circle
      id={`point-${i}`}
      className={auto ? "autoPoint" : "point"}
      cx={x}
      cy={y}
      r={12.5}
      onMouseDown={setActivePoint(i)}
    />
  );
}

export default DragPoint;
