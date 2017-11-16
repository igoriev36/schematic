import * as React from "react";
import * as Rx from "rxjs/Rx";
import * as THREE from "three";
import Axes from "./components/axes";
import Measurement from "./components/measurement";
import Model from "./components/model";
import { Event } from "three";
import { getPosition } from "./libs/utils";

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
  private camera: THREE.Camera;
  private faceColor$: Rx.Subject<any> = new Rx.Subject();
  private mouseDown: Boolean = false;
  private plane: THREE.Plane = new THREE.Plane();
  private planeIntersection: THREE.Vector3 = new THREE.Vector3();
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene = new THREE.Scene();
  private vertices$: Rx.Subject<any> = new Rx.Subject();

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
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(colors.bg);
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(devicePixelRatio);

    this.vertices$
      .map(([vertex, normal, distance]) =>
        vertex.addScaledVector(normal, distance)
      )
      .debounceTime(20)
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

    this.scene.add(new Axes(10));

    const model = new Model(
      this.props.colors.face,
      this.props.colors.faceHighlight
    );
    this.activeModel = model;
    this.scene.add(model.mesh);

    this.camera.position.x = 10;
    this.camera.position.y = 10;
    this.camera.position.z = 10;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    requestAnimationFrame(this.render3);
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
      this.activeModel.mesh,
      false
    );

    if (intersects.length > 0) {
      this.activeIntersection = intersects[0];
      this.activeModel.geometry.faces.forEach(face => {
        if (face.normal.equals(this.activeIntersection.face.normal)) {
          if (!face.color.equals(this.activeModel.faceHighlightColor)) {
            this.activeVertices.add(this.activeModel.geometry.vertices[face.a]);
            this.activeVertices.add(this.activeModel.geometry.vertices[face.b]);
            this.activeVertices.add(this.activeModel.geometry.vertices[face.c]);

            this.faceColor$.next([face, this.props.colors.faceHighlight]);
          }
        } else {
          if (!face.color.equals(this.activeModel.faceColor)) {
            this.faceColor$.next([face, this.props.colors.face]);
          }
        }
      });
      if (this.mouseDown) {
        if (
          this.raycaster.ray.intersectPlane(this.plane, this.planeIntersection)
        ) {
          console.log("mouse down and over");
        }
      }
    } else {
      this.activeVertices.clear();

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
      const { face } = this.activeIntersection;
      this.activeVertices.forEach(vertex => {
        console.log(vertex);
        this.vertices$.next([vertex, face.normal, 1]);
      });
    }
  };

  render3 = () => {
    // console.log("render");
    this.renderer.render(this.scene, this.camera);
  };

  render() {
    return (
      <div
        id="container"
        ref="container"
        onMouseUp={this.handleMouseUp}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
      >
        <Measurement title="width" value={100} x={20} y={30} />
        <Measurement title="height" value={220} x={20} y={60} />
      </div>
    );
  }
}

export default Scene;
