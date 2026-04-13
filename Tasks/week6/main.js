import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loadVideo = (path) => {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.src = path;
    video.setAttribute("playsinline", "");
    video.setAttribute("muted", "true");
    video.setAttribute("loop", "");
    video.addEventListener("loadeddata", () => resolve(video));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.querySelector("#startButton");
  const container = document.getElementById('mind-ar-container');

  const mindarThree = new MindARThree({
    container: container,
    imageTargetSrc: "./../../assets/targets/panadolAndIodomarine.mind",
    maxTrack: 2,
    uiScanning: "yes",
    uiLoading: "yes",
  });

  const { renderer, scene, camera } = mindarThree;

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  const anchor1 = mindarThree.addAnchor(0); 
  const anchor2 = mindarThree.addAnchor(1); 

  const gltfLoader = new GLTFLoader();
  let shipModel = null;

  gltfLoader.load("./../../assets/models/ship.glb", (gltf) => {
    shipModel = gltf.scene;
    shipModel.scale.set(0.1, 0.1, 0.1);
    shipModel.position.set(0, 0, 0);
    shipModel.rotation.set(Math.PI / 2, 0, 0); 
    anchor2.group.add(shipModel);
  });

  window.addEventListener("click", (e) => {
    if (!shipModel) return;

    const mouse = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(anchor2.group.children, true);

    if (intersects.length > 0) {
      const randomAngle = (Math.random() * 45 + 45) * Math.PI / 180;
      shipModel.rotation.z += randomAngle;
    }
  });

  startButton.addEventListener("click", async () => {
    try {
      startButton.textContent = "Завантаження...";
      
      const video = await loadVideo("./../../assets/videos/ocean.mp4");
      const texture = new THREE.VideoTexture(video);
      const geometry = new THREE.PlaneGeometry(1, 0.6); 
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const plane = new THREE.Mesh(geometry, material);
      
      anchor1.group.add(plane);

      anchor1.onTargetFound = () => video.play();
      anchor1.onTargetLost = () => video.pause();

      await mindarThree.start();
      
      document.getElementById('start-screen').style.display = 'none'; 
      startButton.disabled = true;

      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
    } catch (err) {
      console.error( err);
    }
  });
});