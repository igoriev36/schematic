import * as React from "react";
import * as Rx from "rxjs/Rx";
import * as THREE from "three";
import Axes from "./components/axes";
import Measurement from "./components/measurement";
import Model from "./components/model";
import { Event } from "three";
import { getPosition } from "./libs/utils";
import DebugPlane from "./components/debug_plane";
import DebugArrows from "./components/debug_arrows";
import { lineMaterial } from "./materials";
import Wren from "../../../wren/lib/wren";
import SceneControls from "./components/scene_controls";
import WrenModel from "./components/wren_model";

// prettier-ignore
const points = [
  [100, 400],
  [500, 400],
  [500, 200],
  [300, 50],
  [100, 100],
];
const wren = new Wren(points);

interface IProps {
  width: number;
  height: number;
  devicePixelRatio: number;
  colors: any;
}

interface IState {
  tool: string;
}

class Scene extends React.Component<IProps, IState> {
  private activeIntersection: THREE.Intersection;
  private activeModel: Model;
  private activeVertices: Set<THREE.Vector3> = new Set();
  private originalVertices: THREE.Vector3[];
  private camera: THREE.Camera;
  private faceColor$: Rx.Subject<any> = new Rx.Subject();
  private mouseDown: Boolean = false;
  private plane: THREE.Plane = new THREE.Plane();
  private planeIntersection: THREE.Vector3 = new THREE.Vector3();
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene = new THREE.Scene();
  private vertices$: Rx.Subject<any> = new Rx.Subject();
  private clickPoint: THREE.Vector3;
  private debugPlane = DebugPlane();
  private debugArrows = DebugArrows();
  private line: THREE.Line3 = new THREE.Line3();
  private lineHelper: THREE.Line = new THREE.Line();
  private controls;

  Tools = {
    EXTRUDE: "Extrude"
  };

  state: IState = {
    tool: this.Tools.EXTRUDE
  };

  set tool(newTool) {
    this.setState(prevState => {
      prevState.tool = newTool;
      return prevState;
    });
  }

  constructor(props) {
    super(props);
    const { width, height, colors } = props;
    this.debugPlane.visible = false;
    this.debugPlane.add(this.debugArrows.arrows);

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(colors.bg);
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(devicePixelRatio);

    this.scene.add(this.debugPlane);

    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    this.lineHelper = new THREE.Line(lineGeometry, lineMaterial);
    this.scene.add(this.lineHelper);

    this.controls = SceneControls(this.camera, this.renderer.domElement);

    this.vertices$
      .map(([vector, cloned, toAdd]) => vector.copy(cloned.add(toAdd)))
      // .debounceTime(1)
      .subscribe(vertex => {
        this.activeModel.updateGeometry();
        requestAnimationFrame(this.render3);
      });

    this.faceColor$
      .map(([face, color]) => face.color.setHex(color))
      .debounceTime(20)
      .subscribe(result => {
        this.activeModel.updateMaterials();
        requestAnimationFrame(this.render3);
      });
  }

  componentWillUnmount() {
    this.faceColor$.unsubscribe();
    this.vertices$.unsubscribe();
  }

  componentDidMount() {
    (this.refs.container as HTMLElement).appendChild(this.renderer.domElement);

    // this.scene.add(new Axes(10));

    const model = new Model(
      [[0, 0], [2, 0], [2, 2], [1, 3], [0, 2]],
      this.props.colors.face,
      this.props.colors.faceHighlight
    );
    this.activeModel = model;
    this.scene.add(model.mesh);

    const wrenModel = new WrenModel(
      wren,
      this.props.colors.face,
      this.props.colors.faceHighlight
    );
    this.scene.add(wrenModel.mesh);

    this.camera.position.x = 10;
    this.camera.position.y = 10;
    this.camera.position.z = 10;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    requestAnimationFrame(this.render3);
  }

  handleMouseWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    // TODO: fix bug where target is broken after zoom
    // https://stackoverflow.com/questions/23994206/zoom-to-object-in-threejs/30514984#30514984
    const factor = -event.deltaY / 50;
    const [x, y] = getPosition(
      event.clientX,
      event.clientY,
      this.props.width,
      this.props.height
    );
    var vector = new THREE.Vector3(x, y, 1);
    vector.unproject(this.camera);
    vector.sub(this.camera.position);
    this.camera.position.addVectors(
      this.camera.position,
      vector.setLength(factor)
    );
    this.controls.target.addVectors(
      this.controls.target,
      vector.setLength(factor)
    );
  };

  handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const [x, y] = getPosition(
      event.clientX,
      event.clientY,
      this.props.width,
      this.props.height
    );
    this.raycaster.setFromCamera({ x, y }, this.camera);

    const intersects = this.raycaster.intersectObject(
      this.activeModel.mesh,
      false
    );

    if (intersects.length > 0) {
      this.activeIntersection = intersects[0];

      // highlight closest edge
      const positions = this.activeModel.edgesGeometry.getAttribute("position")
        .array as number[];
      let minDistance = Infinity;
      let j = undefined;
      for (let i = 0; i < positions.length; i += 2) {
        this.line.start.fromArray(positions, i * 3);
        this.line.end.fromArray(positions, i * 3 + 3);
        let closestPoint = this.line.closestPointToPoint(
          this.activeIntersection.point
        );
        let distance = closestPoint.distanceTo(this.activeIntersection.point);
        if (distance < minDistance) {
          minDistance = distance;
          j = i;
        }
      }

      j *= 3;

      let needsUpdate = false;
      // prettier-ignore
      if (minDistance < 0.08) {
        this.lineHelper.visible = true;
        // (this.lineHelper.geometry as THREE.Geometry).vertices[0] = new THREE.Vector3().fromArray(positions, j*3);
        if (
          (this.lineHelper.geometry as THREE.Geometry).vertices[0].x !== positions[j] ||
          (this.lineHelper.geometry as THREE.Geometry).vertices[0].y !== positions[j+1] ||
          (this.lineHelper.geometry as THREE.Geometry).vertices[0].z !== positions[j+2]
        ) {
          needsUpdate = true;
          (this.lineHelper.geometry as THREE.Geometry).vertices[0] = new THREE.Vector3().fromArray(positions, j);
        }
        // (this.lineHelper.geometry as THREE.Geometry).vertices[1] = new THREE.Vector3().fromArray(positions, j*3+3);
        if (
          (this.lineHelper.geometry as THREE.Geometry).vertices[1].x !== positions[j+3] ||
          (this.lineHelper.geometry as THREE.Geometry).vertices[1].y !== positions[j+4] ||
          (this.lineHelper.geometry as THREE.Geometry).vertices[1].z !== positions[j+5]
        ) {
          needsUpdate = true;
          (this.lineHelper.geometry as THREE.Geometry).vertices[1] = new THREE.Vector3().fromArray(positions, j+3);
        }
        if (needsUpdate) {
          (this.lineHelper.geometry as THREE.Geometry).verticesNeedUpdate = true;
          requestAnimationFrame(this.render3);
        }

      } else {
        this.lineHelper.visible = false;

        // highlight active face
        this.activeModel.geometry.faces.forEach(face => {
          if (face.normal.equals(this.activeIntersection.face.normal)) {
            if (!face.color.equals(this.activeModel.faceHighlightColor)) {
              this.faceColor$.next([face, this.props.colors.faceHighlight]);
            }
          } else {
            if (!face.color.equals(this.activeModel.faceColor)) {
              this.faceColor$.next([face, this.props.colors.face]);
            }
          }
        });
      }

      if (this.mouseDown) {
        if (
          this.raycaster.ray.intersectPlane(this.plane, this.planeIntersection)
        ) {
          const toAdd = new THREE.Vector3().multiplyVectors(
            this.activeIntersection.face.normal,
            this.planeIntersection.clone().sub(this.clickPoint.clone())
          );
          let count = 0;
          this.activeVertices.forEach(v => {
            this.vertices$.next([
              v,
              this.originalVertices[count].clone(),
              toAdd
            ]);
            count++;
          });
        }
      }
    } else {
      this.activeIntersection = undefined;
      this.activeModel.geometry.faces
        .filter(face => !face.color.equals(this.activeModel.faceColor))
        .forEach(face => {
          this.faceColor$.next([face, this.props.colors.face]);
        });
    }

    // TODO: send a done/commit signal, so it doesn't need to debounce
  };

  handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    this.mouseDown = false;
    this.activeVertices.clear();
  };

  handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    this.mouseDown = true;
    if (this.activeIntersection) {
      this.clickPoint = this.activeIntersection.point;

      this.activeVertices = ((this.activeIntersection.object as THREE.Mesh)
        .geometry as THREE.Geometry).faces
        .filter(f => f.normal.equals(this.activeIntersection.face.normal))
        .reduce((set, f) => {
          set.add(this.activeModel.geometry.vertices[f.a]);
          set.add(this.activeModel.geometry.vertices[f.b]);
          set.add(this.activeModel.geometry.vertices[f.c]);
          return set;
        }, new Set());
      this.originalVertices = [...this.activeVertices].map(v => v.clone());

      this.debugPlane.position.copy(this.activeIntersection.point);
      this.debugPlane.lookAt(
        this.activeIntersection.point
          .clone()
          .add(this.activeIntersection.face.normal)
      );
      this.plane.setFromCoplanarPoints(
        this.debugPlane.position.clone(),
        this.debugPlane.localToWorld(this.debugArrows.green.clone()),
        this.debugPlane.localToWorld(this.debugArrows.blue.clone())
      );
    }
  };

  render3 = () => {
    // console.log("render");
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render3);
  };

  render() {
    return (
      <div
        id="container"
        ref="container"
        onMouseUp={this.handleMouseUp}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onWheel={this.handleMouseWheel}
      >
        <Measurement title="width" value={100} x={20} y={30} />
        <Measurement title="height" value={220} x={20} y={60} />
      </div>
    );
  }
}

export default Scene;
