import {
  Point,
  distance,
  pointOnLine,
  percentageOnLine,
  angle,
  rotateAroundPoint,
  bounds,
  clockwiseSort
} from "../utils/point";

import Block from "./block";
import Corner from "./corner";
import Wall from "./wall";
// import Side from "./side";
import VanillaWall from "./vanilla_wall";
import { flatMap, flatten } from "lodash";

import {
  loopifyInPairs,
  loopifyInGroups,
  safeIndex,
  sortNumeric
} from "../utils/list";
import { offset, area } from "../clipper";
import { take } from "rxjs/operator/take";
import { intersect } from "mathjs";

const pointDistance = 15;
const finWidth = 14.3;

interface Line {
  subPoints: Point[];
  outerSubPoints: Point[];
  innerSubPoints: Point[];
  angle: number;
  length: number;
  blocks: Block[];
  corner?: Corner;
}

interface IDimensions {
  width?: number;
  height?: number;
  length?: number;
  footprint?: string;
  numSheets?: number;
  chassisCost?: string;
  cncCost?: string;
  cncTime?: string;
  chassisTotal?: string;
  insulationVolume?: string;
}

const maxSpan = 360;

class Wren {
  innerPoints: Point[];
  outerPoints: Point[];
  points: Point[];
  originalPoints: Point[];
  normalizedPoints: Point[];
  lines: Line[];
  reinforcers: Point[][] = [];
  finPieces: Point[][] = [];
  outerWalls: Point[][] = [];
  innerWalls: Point[][] = [];
  columns: number[] = [];
  rows: number[] = [];
  // sides: Side[] = [];
  vanillaOuterWalls: VanillaWall[] = [];
  vanillaInnerWalls: VanillaWall[] = [];
  dimensions: IDimensions = {};
  xIntersects: [Point, Point][];
  polygons: Point[][];

  constructor(points, length = 1) {
    // offset with 0 to normalize direction of points (clockwise or counter-clockwise)
    this.points = offset(points, { DELTA: 0 });
    this.originalPoints = this.points.slice(0);
    const pointBounds = bounds(points);

    this.dimensions.width = pointBounds.maxX - pointBounds.minX;
    this.dimensions.height = pointBounds.maxY - pointBounds.minY;
    this.dimensions.length = length;

    const numColumns = Math.floor(this.dimensions.width / maxSpan);
    for (let i = 0; i < numColumns; i++) {
      this.columns.push(
        pointBounds.minX + this.dimensions.width / (numColumns + 1) * (i + 1)
      );
    }

    const numRows = Math.floor(this.dimensions.height / 500);
    for (let i = 0; i < numRows; i++) {
      this.rows.push(
        pointBounds.maxY - this.dimensions.height / (numRows + 1) * (i + 1)
      );
    }

    const sheetCost = 22.3;
    const cncCost = 25.0;

    // console.log({width, height})
    this.calculateIntersections(this.originalPoints);

    this.normalizedPoints = this.points.map(([x, y]): Point => [
      // x - pointBounds.offsetX, // centered point
      x - pointBounds.minX,
      pointBounds.maxY - y
    ]);
    this.outerPoints = offset(points, { DELTA: finWidth });
    this.innerPoints = offset(points, { DELTA: -finWidth });
    this.lines = this.calculateLines(this.points);
    // this.calculateCorners();
    // this.calculateReinforcers();
    this.calculateFinPieces();
    // this.calculateSides(this.outerPoints);
    this.calculateVanillaWalls(
      "vanillaInnerWalls",
      offset(points, { DELTA: -finWidth - 1.8 })
    );
    this.calculateVanillaWalls("vanillaOuterWalls", this.outerPoints);

    const allGuideLines = {
      x: [-Infinity, ...this.columns.sort(sortNumeric), Infinity],
      y: [-Infinity, ...this.rows.sort(sortNumeric), Infinity]
    };
    this.polygons = this.innerPolygons(allGuideLines, this.originalPoints);

    this.dimensions.footprint = `${(this.dimensions.width *
      length /
      100
    ).toFixed(2)}m²`;

    // const frameArea = (area(this.outerPoints) - area(this.innerPoints)) / 10000;
    // this.dimensions.insulationVolume = `${(frameArea * length).toFixed(2)}m³`;

    const outlines =
      this.lines.map(l => l.length).reduce((sum, x) => sum + x, 0) / 10 * 2;
    let sheets = outlines * length / 14;
    sheets += this.rows.length * this.dimensions.width / 10;
    sheets += this.columns.length * this.dimensions.height / 33;
    this.dimensions.numSheets = Math.ceil(sheets);

    const _chassisCost = this.dimensions.numSheets * sheetCost;
    const _cncCost = this.dimensions.numSheets * cncCost;
    this.dimensions.chassisCost = `£${_chassisCost.toFixed(2)}`;
    this.dimensions.cncCost = `£${_cncCost.toFixed(2)}`;
    this.dimensions.chassisTotal = `£${(_chassisCost + _cncCost).toFixed(2)}`;
    this.dimensions.cncTime = `${Math.ceil(
      this.dimensions.numSheets / 20
    )} days`;
  }

  private innerPolygons = (allGuideLines, points) => {
    allGuideLines.x.slice(1, -1).map(x => {
      allGuideLines.y.slice(1, -1).map(y => {
        points.push([x, y]);
      });
    });
    let p = [];
    const polygons = [];
    for (let y = 1; y < allGuideLines.y.length; y++) {
      for (let x = 1; x < allGuideLines.x.length; x++) {
        p = points.filter(p => {
          return (
            Math.ceil(p[0]) >= allGuideLines.x[x - 1] &&
            Math.floor(p[0]) <= allGuideLines.x[x] &&
            Math.ceil(p[1]) >= allGuideLines.y[y - 1] &&
            Math.floor(p[1]) <= allGuideLines.y[y]
          );
        });
        polygons.push(offset(clockwiseSort(p), { DELTA: -finWidth }));
      }
    }
    return polygons.filter(arr => arr.length > 0);
  };

  private calculateLines = (_points): Line[] => {
    return loopifyInPairs(_points).map(([start, end], index) => {
      const lineAngle = angle(start, end);
      const length = distance(start, end);
      const halfLength = length / 2;

      // 1. Calculate the main sub-points -----------------------------------

      const subPoints: Point[] = [];
      // get all points going outwards from start, to the center
      let i = 0;
      for (i = pointDistance; i < halfLength; i += pointDistance * 2) {
        subPoints.push(pointOnLine(start, end)(i));
      }
      // get all points going inwards from end, to the center
      const lastPoints: Point[] = [];
      for (i = pointDistance; i < halfLength; i += pointDistance * 2) {
        lastPoints.push(pointOnLine(end, start)(i));
      }
      // reverse the inward points and join with outward points, to get a
      // contiguous list of points, going outwards from start to end
      subPoints.push(...lastPoints.reverse());

      // 2. Calculate the inner & outer sub-points --------------------------

      let outerSubPoints = [];
      let innerSubPoints = [];
      subPoints.forEach(point => {
        // loop through each subpoint, add or subtract an X value, then
        // rotate by the line's angle, to get an offset point on the line
        const rotate = rotateAroundPoint(point, lineAngle);
        innerSubPoints.push(rotate([point[0], point[1] + finWidth]));
        outerSubPoints.push(rotate([point[0], point[1] - finWidth]));
      });

      // 3. Use inner & outer sub-points to generate blocks -----------------

      let blocks = [];
      for (i = 0; i < subPoints.length - 1; i++) {
        blocks.push(
          new Block(
            lineAngle,
            subPoints[i],
            innerSubPoints[i],
            innerSubPoints[i + 1],
            outerSubPoints[i + 1],
            outerSubPoints[i],
            this.columns
          )
        );
      }

      return {
        angle: lineAngle,
        length,
        subPoints,
        outerSubPoints,
        innerSubPoints,
        blocks
      };
    });
  };

  private calculateCorners = () => {
    const index = safeIndex(this.lines.length);
    // for (let i = 0; i < linePairs.length; i++) {
    for (let i = 0; i < this.lines.length; i++) {
      const nextI = index(i + 1);
      const prevLine = this.lines[i];
      const nextLine = this.lines[nextI];

      const corner = new Corner(
        prevLine.outerSubPoints[prevLine.outerSubPoints.length - 1],
        this.outerPoints[nextI],
        nextLine.outerSubPoints[0],
        nextLine.innerSubPoints[0],
        this.innerPoints[nextI],
        prevLine.innerSubPoints[prevLine.outerSubPoints.length - 1]
      );
      prevLine.corner = corner;
    }
  };

  private calculateReinforcers = () => {
    const index = safeIndex(this.lines.length);
    for (let i = 0; i < this.lines.length; i++) {
      const nextI = index(i + 1);
      const prevLine = this.lines[i];
      const nextLine = this.lines[nextI];
      const blocks = [
        ...prevLine.blocks.slice(-2),
        prevLine.corner,
        ...nextLine.blocks.slice(0, 2)
      ];

      // for (let j = 0; j < this.columns.length; j++) {
      //   if (
      //     this.columns[j] > prevLine.outerSubPoints[prevLine.outerSubPoints.length-1][0] &&
      //     this.columns[j] < nextLine.outerSubPoints[0][0]
      //   ) {
      //   }
      // }

      this.reinforcers.push(
        flatMap(blocks, geometry => geometry.outerPoints).concat(
          flatMap(blocks.reverse(), geometry => geometry.innerPoints)
        )
      );
    }
  };

  private calculateFinPieces = () => {
    const index = safeIndex(this.lines.length);
    for (let i = 0; i < this.lines.length; i++) {
      const blocks = this.lines[i].blocks;
      this.finPieces.push(
        flatMap(blocks, geometry => geometry.outerPoints).concat(
          flatMap(blocks.reverse(), geometry => geometry.innerPoints)
        )
      );
    }
    // console.log(this.finPieces);
  };

  private calculateVanillaWalls = (name, points) => {
    const index = safeIndex(points.length);
    for (let i = 0; i < points.length; i++) {
      // const sortedPoints = [
      //   points[i],
      //   points[index(i + 1)]
      // ].sort((a,b) => a[1] - b[1]);
      // this[name].push(new VanillaWall(120, sortedPoints[0], sortedPoints[1]));
      this[name].push(new VanillaWall(120, points[i], points[index(i + 1)]));
    }
  };

  private calculateIntersections = points => {
    const pointPairs = loopifyInPairs(points);
    const xIntersects = flatten(
      this.columns.map(column => {
        let intersects = [];
        pointPairs.forEach(([start, end], index) => {
          if (
            (start[0] >= column && end[0] <= column) ||
            (start[0] <= column && end[0] >= column)
          ) {
            intersects.push([
              index + 1,
              // intersect(start, end, [0, guideLine], [1000, guideLine])
              intersect(start, end, [column, 0], [column, 1000])
            ]);
          }
        });
        return intersects;
      })
    ).sort(function(a, b) {
      return b[0] - a[0];
    });
    xIntersects.forEach((intersect, index) => {
      if (intersect[1]) {
        points.splice(intersect[0], 0, [...intersect[1]]);
      }
    });

    const yIntersects = flatten(
      this.rows.map(row => {
        let intersects = [];
        pointPairs.forEach(([start, end], index) => {
          if (
            (start[1] >= row && end[1] <= row) ||
            (start[1] <= row && end[1] >= row)
          ) {
            intersects.push([
              index + 1,
              intersect(start, end, [0, row], [1000, row])
            ]);
          }
        });
        return intersects;
      })
    ).sort(function(a, b) {
      return b[0] - a[0];
    });
    yIntersects.forEach((intersect, index) => {
      if (intersect[1]) {
        points.splice(intersect[0], 0, [...intersect[1]]);
      }
    });
  };
}

export default Wren;
