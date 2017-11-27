import * as React from "react";
import * as Rx from "rxjs/Rx";
import * as THREE from "three";
import CuttingPlane from "./components/cutting_plane";
import DebugPlane from "./components/debug_plane";
// import LineHelper from "./components/line_helper";
import Measurement from "./components/measurement";
import Model from "./components/model";
import SceneControls from "./components/scene_controls";
import Wren from "../../../wren/lib/wren";
import WrenModel from "./components/wren_model";
// import rendererStats from "./components/renderer_stats";
import { Event } from "three";
import { getPosition, get2DCoords } from "./libs/utils";
import { lineMaterial, pointsMaterial, cutLineMaterial } from "./materials";
import { nearlyEqual } from "./libs/vector";
// import WrenWorker from "worker-loader!./components/wren_worker";
// const worker = new WrenWorker();

const xPlanes = [new CuttingPlane(0, "x"), new CuttingPlane(0, "x")];
const yPlanes = [new CuttingPlane(0, "y"), new CuttingPlane(0, "y")];
// const planeZ = new CuttingPlane(2, "z");
const cutLines = new THREE.Object3D();

const wren = new Wren([]);

interface IProps {
  width: number;
  height: number;
  devicePixelRatio: number;
  colors: any;
  updateDimensions: any;
  showModel: boolean;
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
  roofType: any;
}

interface IState {
  labels: any;
}

const Roof = {
  FLAT: "FLAT",
  PITCH: "PITCH",
  LEFT_LEANING: "LEFT_LEANING",
  RIGHT_LEANING: "RIGHT_LEANING"
};

class Scene extends React.Component<IProps, IState> {
  state = {
    labels: {
      width: {
        value: 100,
        x: -100,
        y: 30
      },
      length: {
        value: 220,
        x: -100,
        y: 60
      },
      height: {
        value: 220,
        x: -100,
        y: 90
      }
    }
  };

  private active: IActive = {
    intersection: undefined,
    model: undefined,
    clickPoint: undefined,
    vertices: new Set(),
    originalVertices: undefined,
    normal: undefined,
    plane: new THREE.Plane(),
    planeIntersection: new THREE.Vector3(),
    roofType: Roof.FLAT
  };

  private bbox: THREE.Box3 = new THREE.Box3();
  private camera: THREE.PerspectiveCamera;
  private controls;
  private debugPlane = DebugPlane(false);
  private faceColor$: Rx.Subject<any> = new Rx.Subject();
  private line: THREE.Line3 = new THREE.Line3();
  // private lineHelper: LineHelper = new LineHelper();
  private mouseDown: Boolean = false;
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene = new THREE.Scene();
  private vertices$: Rx.Subject<any> = new Rx.Subject();
  private wrenModel: WrenModel;

  private points = [];

  private xPlanes = new Set();
  private yPlanes = new Set();

  constructor(props) {
    super(props);

    this.setupScene();
    this.setupStreams();
  }

  // shouldComponentUpdate() {
  //   return false;
  // }

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
      .debounceTime(5)
      .subscribe(vertex => {
        this.wrenModel.hide();
        this.bbox.setFromObject(this.active.model.mesh);
        this.active.model.updateGeometry();

        cutLines.visible = false;
        while (cutLines.children.length > 0) {
          const c = cutLines.children.pop();
          (c as THREE.Mesh).geometry.dispose();
          cutLines.remove(c);
        }
        cutLines.visible = true;

        const width = this.bbox.max.x - this.bbox.min.x;
        const numColumns = Math.floor(width / 3.6);
        this.xPlanes.clear();
        for (let i = 0; i < numColumns; i++) {
          this.xPlanes.add(width / (numColumns + 1) * (i + 1));
        }
        for (let i = 0; i < xPlanes.length; i++) {
          xPlanes[i].geometry.center();
          const v = [...this.xPlanes][i] || 0;
          xPlanes[i].geometry.translate(this.bbox.min.x + v, 0, 0);
          if (v !== 0) {
            xPlanes[i].intersect(this.active.model);
            cutLines.add(xPlanes[i].intersectionLines);
          }
        }

        const height = this.bbox.max.y - this.bbox.min.y;
        const numRows = Math.floor(height / 5);
        this.yPlanes.clear();
        for (let i = 0; i < numRows; i++) {
          this.yPlanes.add(height / (numRows + 1) * (i + 1));
        }
        for (let i = 0; i < yPlanes.length; i++) {
          yPlanes[i].geometry.center();
          const v = [...this.yPlanes][i] || 0;
          yPlanes[i].geometry.translate(0, v, 0);
          if (v !== 0) {
            yPlanes[i].intersect(this.active.model);
            cutLines.add(yPlanes[i].intersectionLines);
          }
        }

        // this.controls.target.copy(new THREE.Vector3(width/2,2,(this.bbox.max.z - this.bbox.min.z)/2))
        // this.controls.update()

        this.updateLabels();
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

  updateLabels = () => {
    this.setState(prevState => {
      let coords = get2DCoords(
        new THREE.Vector3(
          this.bbox.min.x + (this.bbox.max.x - this.bbox.min.x) / 2,
          this.bbox.min.y,
          this.bbox.max.z + 0.2
        ),
        this.camera
      );
      prevState.labels.width = {
        x: coords.x - 25,
        y: coords.y - 10,
        value: (this.bbox.max.x - this.bbox.min.x).toFixed(2) + "m"
      };

      coords = get2DCoords(
        new THREE.Vector3(
          this.bbox.max.x + 0.1,
          this.bbox.min.y - (this.bbox.min.y - this.bbox.max.y) / 2,
          this.bbox.min.z - 0.05
        ),
        this.camera
      );
      prevState.labels.height = {
        x: coords.x - 25,
        y: coords.y - 10,
        value: (this.bbox.max.y - this.bbox.min.y).toFixed(2) + "m"
      };

      coords = get2DCoords(
        new THREE.Vector3(
          this.bbox.max.x + 0.2,
          this.bbox.min.y,
          this.bbox.min.z + (this.bbox.max.z - this.bbox.min.z) / 2
        ),
        this.camera
      );
      prevState.labels.length = {
        x: coords.x - 25,
        y: coords.y - 10,
        value: (this.bbox.max.z - this.bbox.min.z).toFixed(2) + "m"
      };
      return prevState;
    });
  };

  componentDidMount() {
    (this.refs.container as HTMLElement).appendChild(this.renderer.domElement);

    this.scene.add(this.debugPlane);
    // this.scene.add(this.lineHelper);
    // this.scene.add(new THREE.AxisHelper(10))

    const model = new Model(
      // [[0, 0], [2, 0], [2, 2], [0, 2]],
      [[0, 0], [2, 0], [2, 2], [1, 2], [0, 2]],
      this.props.colors.face,
      this.props.colors.faceHighlight,
      this.props.colors.faceActive
    );
    this.active.model = model;
    this.scene.add(model.mesh);

    this.scene.add(cutLines);
    // this.scene.add(planeZ.mesh);
    xPlanes.forEach(xPlane => this.scene.add(xPlane.mesh));
    yPlanes.forEach(yPlane => this.scene.add(yPlane.mesh));

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
    this.camera.position.y = 15;
    this.camera.position.z = 15;
    this.camera.lookAt(new THREE.Vector3(1, 2, 1));

    const m = new THREE.ShadowMaterial({ side: THREE.DoubleSide });
    const pg = new THREE.PlaneGeometry(10, 10, 1, 1);
    pg.rotateX(Math.PI / 2);
    const me = new THREE.Mesh(pg, m);
    me.receiveShadow = true;
    me.castShadow = true;

    this.scene.add(me);

    this.controls.addEventListener("change", event => {
      this.updateLabels();
      requestAnimationFrame(this.render3);
    });

    // document.body.appendChild(rendererStats.domElement);

    requestAnimationFrame(this.render3);
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
      // (this.active.model.mesh.material as any).opacity = 0;
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

    // TODO: send a done/commit signal, so it doesn't need to debounce
  };

  handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    this.mouseDown = true;
    if (this.active.intersection) {
      this.active.clickPoint = this.active.intersection.point;
      this.controls.enabled = false;

      if (
        Math.abs(this.active.intersection.face.normal.y - 0) < 0.0001 ||
        Math.abs(this.active.intersection.face.normal.y - 1) < 0.0001
      ) {
        this.active.normal = this.active.intersection.face.normal
          .clone()
          .normalize();

        if (
          this.active.normal.x + this.active.normal.y + this.active.normal.z <
          0
        ) {
          this.active.normal.negate();
        }

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
      }

      this.handleMouseMove(event);
    }
  };

  handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    this.wrenModel.show();
    this.recalculateModel();

    this.mouseDown = false;
    this.controls.enabled = true;
    this.active.clickPoint = undefined;
    this.active.vertices.clear();
    this.active.originalVertices = undefined;
    this.handleMouseMove(event);
    requestAnimationFrame(this.render3);
  };

  handleRightClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!this.active.intersection) return;

    let newPos;
    if (this.active.roofType === Roof.FLAT) {
      this.active.roofType = Roof.PITCH;
      this.active.model.geometry.vertices
        .filter(v => Math.abs(v.y - this.bbox.max.y) < 0.001)
        .filter(
          v =>
            Math.abs(v.x - this.bbox.min.x) > 0.001 &&
            Math.abs(v.x - this.bbox.max.x) > 0.001
        )
        .map(v => {
          v.copy(
            new THREE.Vector3(
              this.bbox.min.x +
                (this.bbox.max.x - this.bbox.min.x) / 2 -
                0.00001,
              v.y + 1.1,
              v.z
            )
          );
        });
    } else {
      this.active.roofType = Roof.FLAT;
      // newPos = v => new THREE.Vector3(v.x, v.y - 1, v.z)

      const vs = this.active.model.geometry.vertices.filter(v => v.y > 0.1);
      const newY = Math.min(...vs.map(v => v.y));
      vs.map(v => v.setY(newY));
    }

    this.vertices$.next([
      this.active.model.geometry.vertices[0],
      this.active.model.geometry.vertices[0].clone(),
      new THREE.Vector3(0, 0, 0)
    ]);
  };

  recalculateModel = () => {
    this.bbox.setFromObject(this.active.model.mesh);
    const x = Math.round((this.bbox.max.x - this.bbox.min.x) * 100);
    const y = Math.round((this.bbox.max.y - this.bbox.min.y) * 100);
    // this.points = [[0, 0], [x, 0], [x, y], [0, y]];
    this.points = this.active.model.geometry.vertices
      .filter(v => Math.abs(v.z - this.bbox.max.z) < 0.01)
      .map(v => [v.x * 100, v.y * 100]);
    this.wrenModel.container.position.copy(this.bbox.min);
    this.wrenModel.update(
      new Wren(this.points),
      this.bbox.max.z - this.bbox.min.z
    );
    this.wrenModel.mesh.position.x = -this.bbox.min.x;
    this.props.updateDimensions(this.wrenModel.wren.dimensions);
  };

  componentDidUpdate(prevProps) {
    if (this.props.showModel !== prevProps.showModel) {
      if (prevProps.showModel) {
        // this.active.model.mesh.visible = true;
        this.scene.remove(this.wrenModel.container);
      } else {
        // this.active.model.mesh.visible = false;
        this.scene.add(this.wrenModel.container);
        this.wrenModel.show();
        this.recalculateModel();
      }
      requestAnimationFrame(this.render3);
    }
  }

  render3 = () => {
    this.renderer.render(this.scene, this.camera);
    // requestAnimationFrame(this.render3);
    // TODO: don't call this on every render iteration
    // rendererStats.update(this.renderer);
  };

  render() {
    const { width, height } = this.props;
    const { labels } = this.state;
    return (
      <div
        id="container"
        ref="container"
        onMouseMove={this.handleMouseMove}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onContextMenu={this.handleRightClick}
      >
        <Measurement
          title="width"
          value={labels.width.value}
          x={labels.width.x}
          y={labels.width.y}
        />
        <Measurement
          title="height"
          value={labels.height.value}
          x={labels.height.x}
          y={labels.height.y}
        />
        <Measurement
          title="length"
          value={labels.length.value}
          x={labels.length.x}
          y={labels.length.y}
        />
      </div>
    );
  }
}

export default Scene;
