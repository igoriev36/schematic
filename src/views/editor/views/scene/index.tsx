import * as React from "react";
import * as THREE from "three";
import Model from "./components/model";
import { Event } from "three";
import { getPosition } from "./libs/utils";

interface IProps {
  width: number;
  height: number;
  devicePixelRatio: number;
  bgColor: number | string;
}

class Scene extends React.Component<IProps> {
  private activeModel: Model;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private raycaster: THREE.Raycaster;

  constructor(props) {
    super(props);
    const { width, height, bgColor } = props;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.raycaster = new THREE.Raycaster();
    this.renderer.setClearColor(bgColor);
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(devicePixelRatio);
  }

  componentDidMount() {
    (this.refs.container as HTMLElement).appendChild(this.renderer.domElement);
    //
    const model = new Model();
    this.activeModel = model;
    this.scene.add(model.mesh);
    //
    this.camera.position.x = 10;
    this.camera.position.y = 10;
    this.camera.position.z = 10;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.render3();
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
