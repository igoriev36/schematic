import * as React from "react";
import * as THREE from "three";
import Model from "./components/model";

class Editor extends React.Component {
  // activeModel:Model;

  componentDidMount() {
    const scene = new THREE.Scene();
    const { innerWidth: width, innerHeight: height, devicePixelRatio } = window;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x111111);
    renderer.setSize(width, height);
    renderer.setPixelRatio(devicePixelRatio);
    (this.refs.container as HTMLElement).appendChild(renderer.domElement);
    //
    const model = new Model();
    scene.add(model.mesh);
    //
    camera.position.x = 10;
    camera.position.y = 10;
    camera.position.z = 10;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    //
    renderer.render(scene, camera);
  }

  render() {
    return <div id="container" ref="container" />;
  }
}

export default Editor;
