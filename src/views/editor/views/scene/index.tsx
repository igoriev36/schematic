import * as React from "react";
import * as THREE from "three";
import Model from "./components/model";
import { Event } from "three";
import { getPosition } from "./libs/utils";
import * as Rx from "rxjs/Rx";

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
  private scene: THREE.Scene;
  private raycaster: THREE.Raycaster;
  private faceColor$: Rx.Subject<any>;

  constructor(props) {
    super(props);
    const { width, height, colors } = props;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.raycaster = new THREE.Raycaster();
    this.renderer.setClearColor(colors.bg);
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(devicePixelRatio);

    this.faceColor$ = new Rx.Subject();
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
      this.activeModel.geometry.faces
        .filter(face => !face.color.equals(this.activeModel.faceHighlightColor))
        .forEach(face => {
          this.faceColor$.next([face, this.props.colors.faceHighlight]);
        });
    } else {
      this.activeModel.geometry.faces
        .filter(face => !face.color.equals(this.activeModel.faceColor))
        .forEach(face => {
          this.faceColor$.next([face, this.props.colors.face]);
        });
    }
  };

  render3 = () => {
    this.renderer.render(this.scene, this.camera);
  };

  render() {
    return (
      <div id="container" ref="container" onMouseMove={this.handleMouseMove} />
    );
  }
}

export default Scene;
