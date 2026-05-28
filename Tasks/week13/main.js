import * as THREE from 'three';
import { UARButton } from 'webxr/UARButton';

document.addEventListener("DOMContentLoaded", () => {
  const initialize = async () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;

    document.body.appendChild(renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    const spawnedModels = [];

    document.body.appendChild(UARButton.createButton(renderer, {
      optionalFeatures: ["dom-overlay"],
      domOverlay: { root: document.body }
    }));

    const rayGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1)
    ]);
    const rayMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const rayLine = new THREE.Line(rayGeometry, rayMaterial);
    rayLine.name = "visualRay";
    rayLine.visible = false;

    renderer.setAnimationLoop((timestamp, frame) => {
      spawnedModels.forEach(model => {
        model.rotation.y += 0.01;
      });
      renderer.render(scene, camera);
    });

    const preloadModels = async () => {
      const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();

      const modelSpecs = [
        { name: "hat", glbPath:   "../../assets/models/hat.glb", scale: { x: 0.25, y: 0.25, z: 0.25 } },
        { name: "ship", glbPath:  "../../assets/models/ship.glb", scale: { x: 0.005, y: 0.005, z: 0.005 } }
      ];

      const promises = modelSpecs.map(spec => {
        return new Promise((resolve, reject) => {
          loader.load(spec.glbPath, (gltf) => {
            resolve({
              scene: gltf.scene,
              scale: spec.scale,
              name: spec.name
            });
          }, undefined, (error) => {
            console.error(`Помилка завантаження моделі ${spec.name}:`, error);
            reject(error);
          });
        });
      });

      return Promise.all(promises);
    };

    const preloadedModels = await preloadModels();

    function getRandomModelClone() {
      const randomIndex = Math.floor(Math.random() * preloadedModels.length);
      const { scene: modelScene, scale, name } = preloadedModels[randomIndex];

      const clone = modelScene.clone(true);
      clone.scale.set(scale.x, scale.y, scale.z);
      console.log(`Склоновано модель: ${name}`);
      return clone;
    }

    renderer.xr.addEventListener("sessionstart", async (e) => {
      console.log("Сесію WebXR розпочато");

      const session = renderer.xr.getSession();
      const referenceSpace = await session.requestReferenceSpace('local');
      renderer.xr.setReferenceSpace(referenceSpace);

      const controller = renderer.xr.getController(0);

      controller.add(rayLine);
      rayLine.visible = true;
      scene.add(controller);

      controller.addEventListener('selectstart', () => {
        console.log("Екран натиснуто — розміщуємо випадкову модель");

        const model = getRandomModelClone();

        const position = new THREE.Vector3(0, 0, -0.5);
        position.applyMatrix4(controller.matrixWorld);
        model.position.copy(position);

        scene.add(model);
        spawnedModels.push(model);
      });
    });

    renderer.xr.addEventListener("sessionend", () => {
      console.log("Сесію WebXR завершено");

      rayLine.visible = false;

      spawnedModels.forEach(model => {
        scene.remove(model);
        model.traverse(child => {
          if (child.isMesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      });

      spawnedModels.length = 0;
    });
  };

  initialize();
});