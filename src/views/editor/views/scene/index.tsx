import * as React from "react";
import * as Rx from "rxjs/Rx";
import * as THREE from "three";
import Model from "./components/model";
import { Event } from "three";
import { getPosition } from "./libs/utils";
import Measurement from "./components/measurement";

interface IProps {
  width: number;
  height: number;
  devicePixelRatio: number;
  colors: any;
}

class Scene extends React.Component<IProps> {
  private activeModel: Model;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private mouseDown: Boolean = false;
  private faceColor$: Rx.Subject<any> = new Rx.Subject();
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private scene: THREE.Scene = new THREE.Scene();
  private plane: THREE.Plane = new THREE.Plane();
  private planeIntersection: THREE.Vector3 = new THREE.Vector3();

  constructor(props) {
    super(props);
    const { width, height, colors } = props;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(colors.bg);
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(devicePixelRatio);

    this.faceColor$
      .map(([face, color]) => face.color.setHex(color))
      .debounceTime(20)
      .subscribe(result => {
        this.activeModel.geometry.colorsNeedUpdate = true;
        requestAnimationFrame(this.render3);
      });
  }

  componentWillUnmount() {
    this.faceColor$.unsubscribe();
  }

  componentDidMount() {
    (this.refs.container as HTMLElement).appendChild(this.renderer.domElement);

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
      this.activeModel.geometry.faces.forEach(face => {
        if (face.normal.equals(intersects[0].face.normal)) {
          if (!face.color.equals(this.activeModel.faceHighlightColor)) {
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
  };

  handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    this.mouseDown = true;
  };

  render3 = () => {
    console.log("render");
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
