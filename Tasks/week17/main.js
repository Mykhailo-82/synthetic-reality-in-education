import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

document.addEventListener('DOMContentLoaded', () => {
  const initialize = async () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const textureLoader = new THREE.TextureLoader();
    const gltfLoader = new GLTFLoader();

    const reticleGeometry = new THREE.PlaneGeometry(0.15, 0.15);
    reticleGeometry.rotateX(-Math.PI / 2);

    const reticleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });

    textureLoader.load(
      './reticle.png',
      (texture) => {
        reticleMaterial.map = texture;
        reticleMaterial.needsUpdate = true;
      },
      undefined,
      () => {}
    );

    const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    let loadedModel = null;
    gltfLoader.load(
      './../../assets/models/RobotExpressive.glb',
      (gltf) => {
        loadedModel = gltf.scene;
        loadedModel.scale.set(0.1, 0.1, 0.1);
      },
      undefined,
      () => {}
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    const arButton = ARButton.createButton(renderer, {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay'],
      domOverlay: { root: document.body }
    });

    document.body.appendChild(renderer.domElement);
    document.body.appendChild(arButton);

    const controller = renderer.xr.getController(0);
    scene.add(controller);

    controller.addEventListener('select', () => {
      if (reticle.visible && loadedModel) {
        const modelClone = loadedModel.clone();
        modelClone.position.setFromMatrixPosition(reticle.matrix);
        modelClone.rotation.y = Math.random() * Math.PI * 2;
        scene.add(modelClone);
      }
    });

    let hitTestSource = null;
    let hitTestSourceRequested = false;

    renderer.xr.addEventListener("sessionend", () => {
      hitTestSource = null;
      hitTestSourceRequested = false;
    });

    renderer.setAnimationLoop((timestamp, frame) => {
      if (frame) {
        const session = renderer.xr.getSession();

        if (hitTestSourceRequested === false) {
          session.requestReferenceSpace('viewer').then((referenceSpace) => {
            session.requestHitTestSource({ space: referenceSpace }).then((source) => {
              hitTestSource = source;
            });
          });
          hitTestSourceRequested = true;
        }

        if (hitTestSource) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);

          if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const referenceSpace = renderer.xr.getReferenceSpace();
            const hitPose = hit.getPose(referenceSpace);

            reticle.visible = true;
            reticle.matrix.fromArray(hitPose.transform.matrix);
          } else {
            reticle.visible = false;
          }
        }
      }

      renderer.render(scene, camera);
    });
  };

  initialize();
});