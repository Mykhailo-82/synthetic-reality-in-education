import * as THREE from 'three';
import { UARButton } from 'webxr/UARButton';

document.addEventListener("DOMContentLoaded", () => {
    const initialize = async() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera();

        const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.xr.enabled = true;

        document.body.appendChild(renderer.domElement);

        // Освітлення для об'єктів
        const light = new THREE.AmbientLight(0xffffff, 1.0);
        scene.add(light);

        let currentMesh = null;

        // Кнопка входу в WebXR
        document.body.appendChild(UARButton.createButton(renderer, {
            optionalFeatures: ["dom-overlay"],
            domOverlay: { root: document.body }
        }));

        renderer.setAnimationLoop((timestamp, frame) => {
            // Обертання кульки
            if (currentMesh) {
                currentMesh.rotation.x += 0.01;
                currentMesh.rotation.y += 0.02;
            }
            renderer.render(scene, camera);
        });

        renderer.xr.addEventListener("sessionstart", async () => {
            console.log("Сесію WebXR розпочато");

            const session = renderer.xr.getSession();
            const referenceSpace = await session.requestReferenceSpace('local');
            renderer.xr.setReferenceSpace(referenceSpace);

            const geometry = new THREE.SphereGeometry(0.05, 32, 32);
            const material = new THREE.MeshStandardMaterial({color: 0xff3322});
            currentMesh = new THREE.Mesh(geometry, material);
            
            currentMesh.position.set(0, 0, -0.5);
            scene.add(currentMesh);
        });

        renderer.xr.addEventListener("sessionend", () => {
            console.log("Сесію WebXR завершено");

            if (currentMesh) {
                scene.remove(currentMesh);
                currentMesh = null;
            }
        });
    }

    initialize();
});