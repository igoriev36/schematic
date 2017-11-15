import * as React from "react";
import * as THREE from "three";
import Model from "./components/model";

interface IProps {
  width: number;
  height: number;
  devicePixelRatio: number;
  bgColor: number | string;
}

class Editor extends React.Component<IProps> {
  // activeModel:Model;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;

  constructor(props) {
    super(props);
    const { width, height, bgColor } = props;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(bgColor);
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(devicePixelRatio);
  }

  componentDidMount() {
    (this.refs.container as HTMLElement).appendChild(this.renderer.domElement);
    //
    const model = new Model();
    this.scene.add(model.mesh);
    //
    this.camera.position.x = 10;
    this.camera.position.y = 10;
    this.camera.position.z = 10;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.render3();
  }

  render3 = () => {
    this.renderer.render(this.scene, this.camera);
  };

  render() {
    return <div id="container" ref="container" />;
  }
}

export default Editor;
