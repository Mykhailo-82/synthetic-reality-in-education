import * as THREE from 'three';

document.addEventListener("DOMContentLoaded", () => {
    const initialize = async () => {
        const arButton = document.querySelector("#ar-button");
        const supported = navigator.xr && await navigator.xr.isSessionSupported("immersive-ar");

        if (!supported) {
            arButton.textContent = "WebXR не підтримується";
            arButton.disabled = true;
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera();
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);
        
        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);

        const day = 24.0 * 60 * 60; // Тривалість земного дня у секундах
        const dt = day / 3;         // Крок інтегрування
        const G = 6.67e-11;         // Гравітаційна стала
        
        const distanceScale = 3e11; 
        
        const planetsData = [
            { name: "Sun", mass: 1.989e30, dist: 0, T: 0, color: 0xffaa00, size: 0.04, pos: [0, 0, 0], v: [0, 0, 0], a: [0, 0, 0] },
            { name: "Mercury", mass: 3.285e23, dist: 5.79e10, T: 88, color: 0xaaaaaa, size: 0.01, pos: [0, 0, 0], v: [0, 0, 0], a: [0, 0, 0] },
            { name: "Venus", mass: 4.867e24, dist: 1.082e11, T: 224.7, color: 0xe3bb76, size: 0.015, pos: [0, 0, 0], v: [0, 0, 0], a: [0, 0, 0] },
            { name: "Earth", mass: 5.972e24, dist: 1.496e11, T: 365.2, color: 0x0088ff, size: 0.016, pos: [0, 0, 0], v: [0, 0, 0], a: [0, 0, 0] },
            { name: "Mars", mass: 6.39e23, dist: 2.279e11, T: 687, color: 0xc1440e, size: 0.012, pos: [0, 0, 0], v: [0, 0, 0], a: [0, 0, 0] }
        ];

        planetsData.forEach(p => {
            p.pos = [p.dist, 0, -0.5];
            
            if (p.T !== 0) {
                const secondsPerYear = p.T * day;
                p.v[1] = (2 * Math.PI * p.dist) / secondsPerYear;
            }

            const geometry = new THREE.SphereGeometry(p.size, 16, 16);
            const material = new THREE.MeshBasicMaterial({ color: p.color });
            p.mesh = new THREE.Mesh(geometry, material);
            scene.add(p.mesh);

            p.mesh.position.set(p.pos[0] / distanceScale, p.pos[1] / distanceScale, p.pos[2]);
        });

        renderer.xr.addEventListener("sessionstart", () => {
            console.log("Сесію WebXR розпочато");
        });

        renderer.xr.addEventListener("sessionend", () => {
            console.log("Сесію WebXR завершено");
        });

        let currentSession = null;
        
        const start = async () => {
            currentSession = await navigator.xr.requestSession(
                "immersive-ar", {
                    optionalFeatures: ["dom-overlay"],
                    domOverlay: { root: document.body }
                }
            );

            renderer.xr.enabled = true;
            renderer.xr.setReferenceSpaceType("local");
            await renderer.xr.setSession(currentSession);
            
            arButton.textContent = "Завершити сесію WebXR";
            
            renderer.setAnimationLoop(() => {
                if (!currentSession) return;

                for (let i = 0; i < planetsData.length; i++) {
                    let p1 = planetsData[i];
                    p1.a[0] = p1.a[1] = p1.a[2] = 0;

                    for (let j = 0; j < planetsData.length; j++) {
                        if (i !== j) {
                            let p2 = planetsData[j];
                            let deltapos = [
                                p2.pos[0] - p1.pos[0],
                                p2.pos[1] - p1.pos[1],
                                (p2.pos[2] + 0.5) - (p1.pos[2] + 0.5)
                            ];

                            let r = Math.sqrt(deltapos[0]**2 + deltapos[1]**2 + deltapos[2]**2);
                            
                            if (r > 0) {
                                for (let k = 0; k < 3; k++) {
                                    p1.a[k] += (G * p2.mass * deltapos[k]) / (r**3);
                                }
                            }
                        }
                    }
                }

                planetsData.forEach(p => {
                    for (let k = 0; k < 3; k++) {
                        p.v[k] += p.a[k] * dt;
                        p.pos[k] += p.v[k] * dt;
                    }

                    p.mesh.position.x = p.pos[0] / distanceScale;
                    p.mesh.position.y = p.pos[1] / distanceScale;
                    p.mesh.position.z = p.pos[2]; 
                });

                renderer.render(scene, camera);
            });
        };

        const end = async () => {
            await currentSession.end();
            renderer.setAnimationLoop(null);
            renderer.clear();
            currentSession = null;
            renderer.xr.enabled = false;
            arButton.textContent = "Увійти до WebXR";
        };

        arButton.addEventListener("click", () => {
            if (currentSession) {
                end();
            } else {
                start();
            }
        });
    };

    initialize();
});