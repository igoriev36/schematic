import * as React from "react";

function DragPoint({ x, y, nX, nY, i, setActivePoint, auto }) {
  return (
    <g>
      <text x={x + 20} y={y + 10} className="position">
        {[x, y].join(",")}
      </text>
      <text x={x + 20} y={y + 30} className="position">
        {[nX, nY].join(",")}
      </text>
      <circle
        id={`point-${i}`}
        className={auto ? "autoPoint" : "point"}
        cx={x}
        cy={y}
        r={12.5}
        onMouseDown={setActivePoint(i)}
      />
    </g>
  );
}

export default DragPoint;
