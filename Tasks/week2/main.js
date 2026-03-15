

import * as THREE from 'three';
import {MindARThree} from 'mindar-image-three';

document.addEventListener("DOMContentLoaded", () => {

  const mindarThree = new MindARThree({
    container: document.body,
    imageTargetSrc: "./../../assets/iodomarine.mind",
  });

  const {renderer, scene, camera} = mindarThree;

  const anchor = mindarThree.addAnchor(0);

  const geometry1 = new THREE.SphereGeometry(0.15, 32, 32);
  const material1 = new THREE.MeshBasicMaterial({ color: "#2862ea" });
  const sphere = new THREE.Mesh(geometry1, material1);
  sphere.position.set(-0.4, 0, 0);

  const geometry2 = new THREE.TorusGeometry(0.15, 0.05, 16, 64);
  const material2 = new THREE.MeshBasicMaterial({ color: "#ff0000" });
  const torus = new THREE.Mesh(geometry2, material2);
  torus.position.set(0, 0, 0);

  const geometry3 = new THREE.ConeGeometry(0.15, 0.3, 32);
  const material3 = new THREE.MeshBasicMaterial({ color: "#00ff00" });
  const cone = new THREE.Mesh(geometry3, material3);
  cone.position.set(0.4, 0, 0);
  cone.rotation.x = Math.PI / 2;

  anchor.group.add(sphere);
  anchor.group.add(torus);
  anchor.group.add(cone);

  const start = async () => {
    await mindarThree.start();

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  };

  start();
});



