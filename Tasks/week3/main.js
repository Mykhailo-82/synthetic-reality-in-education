

import * as THREE from 'three';
import {MindARThree} from 'mindar-image-three';

document.addEventListener("DOMContentLoaded", () => {

  const mindarThree = new MindARThree({
    container: document.body,
    imageTargetSrc: "./../../assets/iodomarine.mind",
    // imageTargetSrc: "./../../assets/panadol.mind",
  });

  const {renderer, scene, camera} = mindarThree;

  const anchor = mindarThree.addAnchor(0);

  
  const textureLoader = new THREE.TextureLoader();
  const catTexture1 = textureLoader.load(
    "https://raw.githubusercontent.com/Mykhailo-82/synthetic-reality-in-education/main/Tasks/week3/images/cat1.jpg"
  );
  const catTexture2 = textureLoader.load(
    "https://images.unsplash.com/vector-1749532960959-c79c35d8bf7e?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=mila-okta-safitri-7gvme6muqY8-unsplash.jpg&w=512"
  );
  const catTexture3 = textureLoader.load(
    "./images/cat3.jpg"
  );


  const cubeGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);

  const cubeMaterials = [
    new THREE.MeshBasicMaterial({ map: catTexture1 }),
    new THREE.MeshBasicMaterial({ map: catTexture1 }),
    new THREE.MeshBasicMaterial({ map: catTexture2 }),
    new THREE.MeshBasicMaterial({ map: catTexture2 }),
    new THREE.MeshBasicMaterial({ map: catTexture3 }),
    new THREE.MeshBasicMaterial({ map: catTexture3 }),
  ];

  const cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
  cube.position.set(0.75, 0, 0);

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
  anchor.group.add(cube);

  const start = async () => {
    await mindarThree.start();

    let clock = new THREE.Clock();

    renderer.setAnimationLoop(() => {
      const t = clock.getElapsedTime();

      cube.rotation.x = t;
      cube.rotation.y = t * 0.7;
      cube.rotation.z = t * 0.5;

      cone.position.y = 0.1 * Math.abs(Math.sin(t * 3));

      const scale = 1 + 0.3 * Math.sin(t * 2);
      sphere.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    });
  };

  start();
});



