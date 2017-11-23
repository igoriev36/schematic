import * as React from "react";
import * as Rx from "rxjs/Rx";
import * as THREE from "three";
import DebugPlane from "./components/debug_plane";
import LineHelper from "./components/line_helper";
import Measurement from "./components/measurement";
import Model from "./components/model";
import SceneControls from "./components/scene_controls";
import Wren from "../../../wren/lib/wren";
import WrenModel from "./components/wren_model";
import Plane from "./components/plane";
// import WrenWorker from "worker-loader!./components/wren_worker";
import { Event } from "three";
import { getPosition } from "./libs/utils";
import { lineMaterial, pointsMaterial, cutLineMaterial } from "./materials";
import { nearlyEqual } from "./libs/vector";

import rendererStats from "./components/renderer_stats";

// prettier-ignore
const points = [
  [100, 400],
  [300, 500],
  [300, 200],
  [220, 50],
  [100, 100],
];
const wren = new Wren(points);

// const worker = new WrenWorker();

interface IProps {
  width: number;
  height: number;
  devicePixelRatio: number;
  colors: any;
}

interface IState {}

interface IActive {
  intersection: THREE.Intersection;
  model: Model;
  clickPoint: THREE.Vector3;
  vertices: Set<THREE.Vector3>;
  originalVertices: THREE.Vector3[];
  plane: THREE.Plane;
  planeIntersection: THREE.Vector3;
  normal: THREE.Vector3;
}

// const Box = (v: THREE.Vector3): THREE.Mesh => {
//   const b = new THREE.BoxGeometry(0.3, 0.3, 0.3);
//   const m = new THREE.Mesh(b, planeMat);
//   m.position.copy(v);
//   return m;
// };

const planeX = new Plane(1, "x");
const planeY = new Plane(1, "y");
const planeZ = new Plane(2, "z");
const cutLines = new THREE.Object3D();

const drawIntersectionPoints = (plane, model) => {
  // console.log(model)
  let pointsOfIntersection = new THREE.Geometry();
  let a = new THREE.Vector3();
  let b = new THREE.Vector3();
  let c = new THREE.Vector3();
  let planePointA = new THREE.Vector3();
  let planePointB = new THREE.Vector3();
  let planePointC = new THREE.Vector3();
  let lineAB = new THREE.Line3();
  let lineBC = new THREE.Line3();
  let lineCA = new THREE.Line3();
  let pointOfIntersection = new THREE.Vector3();

  const setPointOfIntersection = (line, plane) => {
    pointOfIntersection = plane.intersectLine(line);
    if (pointOfIntersection) {
      pointsOfIntersection.vertices.push(pointOfIntersection.clone());
    }
  };

  let mathPlane = new THREE.Plane();
  plane.mesh.localToWorld(
    planePointA.copy(plane.geometry.vertices[plane.geometry.faces[0].a])
  );
  plane.mesh.localToWorld(
    planePointB.copy(plane.geometry.vertices[plane.geometry.faces[0].b])
  );
  plane.mesh.localToWorld(
    planePointC.copy(plane.geometry.vertices[plane.geometry.faces[0].c])
  );
  mathPlane.setFromCoplanarPoints(planePointA, planePointB, planePointC);
  model.geometry.faces.forEach(face => {
    model.mesh.localToWorld(a.copy(model.geometry.vertices[face.a]));
    model.mesh.localToWorld(b.copy(model.geometry.vertices[face.b]));
    model.mesh.localToWorld(c.copy(model.geometry.vertices[face.c]));
    lineAB = new THREE.Line3(a, b);
    lineBC = new THREE.Line3(b, c);
    lineCA = new THREE.Line3(c, a);
    setPointOfIntersection(lineAB, mathPlane);
    setPointOfIntersection(lineBC, mathPlane);
    setPointOfIntersection(lineCA, mathPlane);
  });

  var points = new THREE.Points(pointsOfIntersection, pointsMaterial);
  cutLines.add(points);
  var lines = new THREE.LineSegments(pointsOfIntersection, cutLineMaterial);
  cutLines.add(lines);
};

class Scene extends React.Component<IProps, IState> {
  private active: IActive = {
    intersection: undefined,
    model: undefined,
    clickPoint: undefined,
    vertices: new Set(),
    originalVertices: undefined,
    normal: undefined,
    plane: new THREE.Plane(),
    planeIntersection: new THREE.Vector3()
  };
  // private active.model: Model;
  // private activeNormal: THREE.Vector3;
  // private activeVertices

  private camera: THREE.PerspectiveCamera;
  private faceColor$: Rx.Subject<any> = new Rx.Subject();
  private mouseDown: Boolean = false;
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene = new THREE.Scene();
  private vertices$: Rx.Subject<any> = new Rx.Subject();
  private debugPlane = DebugPlane(false);
  private line: THREE.Line3 = new THREE.Line3();
  private lineHelper: LineHelper = new LineHelper();
  private bbox: THREE.Box3 = new THREE.Box3();
  private controls;
  private wrenModel: WrenModel;

  constructor(props) {
    super(props);

    this.setupScene();
    this.setupStreams();
  }

  shouldComponentUpdate() {
    return false;
  }

  setupScene = () => {
    const { width, height, colors } = this.props;
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(colors.bg);
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(devicePixelRatio);
    this.controls = SceneControls(this.camera, this.renderer.domElement);
  };

  setupStreams = () => {
    this.vertices$
      .map(([vector, cloned, toAdd]) => vector.copy(cloned.add(toAdd)))
      // .debounceTime(100)
      .subscribe(vertex => {
        this.active.model.updateGeometry();
        while (cutLines.children.length > 0) {
          (cutLines.children[0] as THREE.Mesh).geometry.dispose();
          cutLines.remove(cutLines.children[0]);
        }
        drawIntersectionPoints(planeX, this.active.model);
        drawIntersectionPoints(planeY, this.active.model);
        drawIntersectionPoints(planeZ, this.active.model);
        requestAnimationFrame(this.render3);
      });

    this.faceColor$
      .map(([face, color]) => face.color.setHex(color))
      .debounceTime(20)
      .subscribe(result => {
        this.active.model.updateMaterials();
        requestAnimationFrame(this.render3);
      });
  };

  componentDidMount() {
    (this.refs.container as HTMLElement).appendChild(this.renderer.domElement);

    this.scene.add(this.debugPlane);
    this.scene.add(this.lineHelper);
    // this.scene.add(new THREE.AxisHelper(10))
    // this.scene.add(plane);

    const model = new Model(
      [[0, 0], [2, 0], [2, 2], [0, 2]],
      this.props.colors.face,
      this.props.colors.faceHighlight,
      this.props.colors.faceActive
    );
    this.active.model = model;
    this.scene.add(model.mesh);

    this.scene.add(cutLines);
    this.scene.add(planeZ.mesh);
    this.scene.add(planeY.mesh);
    this.scene.add(planeX.mesh);

    // drawIntersectionPoints(planeX, this.active.model);
    // drawIntersectionPoints(planeY, this.active.model);
    // drawIntersectionPoints(planeZ, this.active.model);

    // ---

    // this.wrenModel = new WrenModel(
    //   wren,
    //   this.props.colors.face,
    //   this.props.colors.faceHighlight
    // );
    // this.scene.add(this.wrenModel.container);

    this.camera.position.x = 10;
    this.camera.position.y = 10;
    this.camera.position.z = 10;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    requestAnimationFrame(this.render3);

    this.controls.addEventListener("change", this.render3);

    document.body.appendChild(rendererStats.domElement);
  }

  componentWillUnmount() {
    this.faceColor$.unsubscribe();
    this.vertices$.unsubscribe();
  }

  handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const [x, y] = getPosition(
      event.clientX,
      event.clientY,
      this.props.width,
      this.props.height
    );
    this.raycaster.setFromCamera({ x, y }, this.camera);
    const intersects = this.raycaster.intersectObject(
      this.active.model.mesh,
      false
    );

    if (intersects.length > 0) {
      this.active.intersection = intersects[0];
    } else {
      this.active.intersection = undefined;
    }

    if (this.active.vertices.size > 0) {
      if (
        this.raycaster.ray.intersectPlane(
          this.active.plane,
          this.active.planeIntersection
        )
      ) {
        const toAdd = new THREE.Vector3().multiplyVectors(
          this.active.normal,
          this.active.planeIntersection.clone().sub(this.active.clickPoint)
        );

        let count = 0;
        this.active.vertices.forEach(v => {
          this.vertices$.next([
            v,
            this.active.originalVertices[count].clone(),
            toAdd
          ]);
          count++;
        });
      }
    } else {
      // highlight active face
      this.active.model.geometry.faces.forEach(face => {
        if (this.active.intersection) {
          if (nearlyEqual(face.normal, this.active.intersection.face.normal)) {
            if (!face.color.equals(this.active.model.faceHighlightColor)) {
              this.faceColor$.next([face, this.props.colors.faceHighlight]);
            }
          } else {
            if (!face.color.equals(this.active.model.faceColor)) {
              this.faceColor$.next([face, this.props.colors.face]);
            }
          }
        } else {
          if (!face.color.equals(this.active.model.faceColor)) {
            this.faceColor$.next([face, this.props.colors.face]);
          }
        }
      });
    }

    // // TODO: send a done/commit signal, so it doesn't need to debounce
  };

  handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    this.mouseDown = true;
    if (this.active.intersection) {
      this.active.clickPoint = this.active.intersection.point;

      //   this.activeNormal =
      //     normal.x + normal.y + normal.z < 0
      //       ? normal.clone().negate()
      //       : normal.clone();

      this.active.normal = this.active.intersection.face.normal
        .clone()
        .normalize();
      if (
        this.active.normal.x + this.active.normal.y + this.active.normal.z <
        0
      )
        this.active.normal.negate();
      // console.log(this.active.normal)
      this.controls.enabled = false;

      this.active.vertices = ((this.active.intersection.object as THREE.Mesh)
        .geometry as THREE.Geometry).faces
        .filter(f =>
          nearlyEqual(f.normal, this.active.intersection.face.normal)
        )
        .reduce((set, f) => {
          if (!f.color.equals(this.active.model.faceActiveColor)) {
            this.faceColor$.next([f, this.props.colors.faceActive]);
          }
          set.add(this.active.model.geometry.vertices[f.a]);
          set.add(this.active.model.geometry.vertices[f.b]);
          set.add(this.active.model.geometry.vertices[f.c]);
          return set;
        }, new Set());
      this.active.originalVertices = [...this.active.vertices].map(v =>
        v.clone()
      );

      this.debugPlane.position.copy(this.active.intersection.point);
      this.debugPlane.lookAt(
        this.active.intersection.point
          .clone()
          .add(this.active.intersection.face.normal)
      );

      // this.scene.add(Box(this.debugPlane.position))
      // this.scene.add(Box(this.debugPlane.localToWorld(this.debugPlane.userData.green)))
      // this.scene.add(Box(this.debugPlane.localToWorld(this.debugPlane.userData.blue)))
      // this.debugPlane.updateMatrixWorld(true);
      // this.debugPlane.userData.pts().map(pt => {
      //   this.scene.add(Box(pt))
      // })

      const [a, b, c] = this.debugPlane.userData.pts();
      this.active.plane.setFromCoplanarPoints(a, b, c);

      // plane.position.copy(this.debugPlane.position)
      // plane.setRotationFromEuler(this.debugPlane.rotation)
      // plane.rotateY(Math.PI/2)

      // const coplanarPoint = this.active.plane.coplanarPoint();
      // const focalPoint = new THREE.Vector3()
      //                     .copy(coplanarPoint)
      //                     .add(this.active.plane.normal);

      this.handleMouseMove(event);
    }
  };

  handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    // this.bbox.setFromObject(this.active.model.mesh);
    // const x = Math.round((this.bbox.max.x - this.bbox.min.x) * 100);
    // const y = Math.round((this.bbox.max.y - this.bbox.min.y) * 100);
    // this.wrenModel.container.position.copy(this.bbox.min);
    // this.wrenModel.update(
    //   new Wren([[0, 0], [x, 0], [x, y], [0, y]]),
    //   this.bbox.max.z - this.bbox.min.z
    // );

    this.mouseDown = false;
    this.controls.enabled = true;
    this.active.clickPoint = undefined;
    this.active.vertices.clear();
    this.active.originalVertices = undefined;
    this.handleMouseMove(event);
  };

  // handleMouseWheel = (event: React.WheelEvent<HTMLDivElement>) => {
  //   console.log(event);
  //   // // TODO: fix bug where target is broken after zoom
  //   // // https://stackoverflow.com/questions/23994206/zoom-to-object-in-threejs/30514984#30514984
  //   // const factor = -event.deltaY / 50;
  //   // const [x, y] = getPosition(
  //   //   event.clientX,
  //   //   event.clientY,
  //   //   this.props.width,
  //   //   this.props.height
  //   // );
  //   // var vector = new THREE.Vector3(x, y, 1);
  //   // vector.unproject(this.camera);
  //   // vector.sub(this.camera.position);
  //   // this.camera.position.addVectors(
  //   //   this.camera.position,
  //   //   vector.setLength(factor)
  //   // );
  //   // this.controls.target.addVectors(
  //   //   this.controls.target,
  //   //   vector.setLength(factor)
  //   // );
  // };

  render3 = () => {
    this.renderer.render(this.scene, this.camera);
    // requestAnimationFrame(this.render3);
    // TODO: don't call this on every render iteration
    rendererStats.update(this.renderer);
  };

  render() {
    const { width, height } = this.props;
    return (
      <div
        id="container"
        ref="container"
        onMouseMove={this.handleMouseMove}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
      >
        <Measurement title="width" value={100} x={20} y={30} />
        <Measurement title="height" value={220} x={20} y={60} />
      </div>
    );
  }
}

// onWheel={Mouse.handleMouseWheel}

export default Scene;
