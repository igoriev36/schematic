import * as React from "react";
import * as Rx from "rxjs/Rx";
import * as THREE from "three";
import CuttingPlane from "./components/cutting_plane";
import DebugPlane from "./components/debug_plane";
import LineHelper from "./components/line_helper";
import Measurement from "./components/measurement";
import Model from "./components/model";
import SceneControls from "./components/scene_controls";
import Wren from "../../../wren/lib/wren";
import WrenModel from "./components/wren_model";
import rendererStats from "./components/renderer_stats";
import { Event } from "three";
import { getPosition } from "./libs/utils";
import { lineMaterial, pointsMaterial, cutLineMaterial } from "./materials";
import { nearlyEqual } from "./libs/vector";
// import WrenWorker from "worker-loader!./components/wren_worker";

const planeX = new CuttingPlane(1, "x");
const planeY = new CuttingPlane(1, "y");
const planeZ = new CuttingPlane(2, "z");
const cutLines = new THREE.Object3D();

const wren = new Wren([]);
// const worker = new WrenWorker();

interface IProps {
  width: number;
  height: number;
  devicePixelRatio: number;
  colors: any;
}

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

class Scene extends React.Component<IProps> {
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

  private bbox: THREE.Box3 = new THREE.Box3();
  private camera: THREE.PerspectiveCamera;
  private controls;
  private debugPlane = DebugPlane(false);
  private faceColor$: Rx.Subject<any> = new Rx.Subject();
  private line: THREE.Line3 = new THREE.Line3();
  private lineHelper: LineHelper = new LineHelper();
  private mouseDown: Boolean = false;
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene = new THREE.Scene();
  private vertices$: Rx.Subject<any> = new Rx.Subject();
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
        planeX.intersect(this.active.model);
        planeY.intersect(this.active.model);
        planeZ.intersect(this.active.model);

        cutLines.add(planeX.intersectionLines);
        cutLines.add(planeY.intersectionLines);
        cutLines.add(planeZ.intersectionLines);

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

    const model = new Model(
      [[0, 0], [2, 0], [2, 2], [1, 3], [0, 2]],
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

    this.wrenModel = new WrenModel(
      wren,
      this.props.colors.face,
      this.props.colors.faceHighlight
    );

    const light = new THREE.HemisphereLight(0xfafafa, 0xeeeeee);
    this.scene.add(light);
    const light2 = new THREE.PointLight(0xffffff);
    light2.position.y = 3;
    light2.position.x = 3;
    light2.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(light2);

    this.camera.position.x = 10;
    this.camera.position.y = 10;
    this.camera.position.z = 10;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    const pg = new THREE.PlaneGeometry(10, 10, 1, 1);
    pg.rotateX(Math.PI / 2);
    const m = new THREE.ShadowMaterial({ side: THREE.DoubleSide });
    const me = new THREE.Mesh(pg, m);
    me.receiveShadow = true;
    this.scene.add(me);

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

    const cutLineIntersects = this.raycaster.intersectObject(
      planeX.mesh,
      false
    );
    // if (true || cutLineIntersects.length > 0) {

    // } else {
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
    // }

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

      const [a, b, c] = this.debugPlane.userData.pts();
      this.active.plane.setFromCoplanarPoints(a, b, c);

      this.handleMouseMove(event);
    }
  };

  handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    this.mouseDown = false;
    this.controls.enabled = true;
    this.active.clickPoint = undefined;
    this.active.vertices.clear();
    this.active.originalVertices = undefined;
    this.handleMouseMove(event);
  };

  render3 = () => {
    this.renderer.render(this.scene, this.camera);
    // requestAnimationFrame(this.render3);
    // TODO: don't call this on every render iteration
    rendererStats.update(this.renderer);
  };

  handleKeyUp = (event: React.MouseEvent<HTMLDivElement>) => {
    this.scene.add(this.wrenModel.container);
    this.bbox.setFromObject(this.active.model.mesh);
    const x = Math.round((this.bbox.max.x - this.bbox.min.x) * 100);
    const y = Math.round((this.bbox.max.y - this.bbox.min.y) * 100);
    this.wrenModel.container.position.copy(this.bbox.min);
    this.wrenModel.update(
      new Wren([[0, 0], [x, 0], [x, y], [0, y]]),
      this.bbox.max.z - this.bbox.min.z
    );
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
        onDoubleClick={this.handleKeyUp}
      >
        <Measurement title="width" value={100} x={20} y={30} />
        <Measurement title="height" value={220} x={20} y={60} />
      </div>
    );
  }
}

export default Scene;
