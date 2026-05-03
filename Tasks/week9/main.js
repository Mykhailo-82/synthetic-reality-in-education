import * as THREE from "three";
import { MindARThree } from "mindar-face-three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("menu");
  const arContainer = document.getElementById("ar-container");
  const vrMode = document.getElementById("vrMode");
  const arMode = document.getElementById("arMode");
  const backButton = document.getElementById("backButton");

  let mindarThree;

  const start = async (isVR = false) => {
    mindarThree = new MindARThree({
      container: arContainer,
      uiScanning: "yes",
      uiLoading: "yes",
    });

    const { scene, camera, renderer } = mindarThree;

    
    renderer.sortObjects = true;
    renderer.autoClear = false;

    
    scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.5));
    const directLight = new THREE.DirectionalLight(0xffffff, 1);
    directLight.position.set(0, 1, 1);
    scene.add(directLight);

    
    const faceMesh = mindarThree.addFaceMesh();
    faceMesh.material = new THREE.MeshBasicMaterial({
      colorWrite: false,
      depthWrite: true,
      side: THREE.DoubleSide
    });
    faceMesh.renderOrder = 0; 
    scene.add(faceMesh);

    
    const loader = new GLTFLoader();
    loader.load("../../assets/models/hat.glb", (gltf) => {
      const hatModel = gltf.scene;
      hatModel.scale.set(4.0, 4.0, 4.0); 
      hatModel.position.set(0, 0.4, -0.6); 
      hatModel.rotation.set(0, 180, 0); 

      hatModel.traverse((child) => {
        if (child.isMesh) {
          child.renderOrder = 999; 
          child.material.depthTest = true;
          child.material.depthWrite = true;
          child.material.transparent = false;
        }
      });

      const anchor = mindarThree.addAnchor(10);
      anchor.group.add(hatModel);
    });

    
    if (isVR) {
      const geometry = new THREE.SphereGeometry(0.01, 32, 16);
      const material = new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        transparent: true,
        opacity: 0.5
      });

      for (let i = 0; i < 468; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        const anchor = mindarThree.addAnchor(i);
        anchor.group.add(mesh);
      }
    }

    await mindarThree.start();

    
    camera.near = 0.01;
    camera.updateProjectionMatrix();

    
    if (isVR) {
      const video = document.querySelector("video");
      if (video) {
        video.style.display = "none";
      }
    }

    renderer.setAnimationLoop(() => {
      renderer.clear();
      renderer.render(scene, camera);
    });
  };

  arMode.addEventListener("click", async () => {
    menu.style.display = "none";
    arContainer.style.display = "block";
    await start(false);
  });

  vrMode.addEventListener("click", async () => {
    menu.style.display = "none";
    arContainer.style.display = "block";
    await start(true);
  });

  backButton.addEventListener("click", () => {
    location.reload();
  });
});