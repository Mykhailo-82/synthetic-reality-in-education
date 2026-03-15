import * as THREE from "https://unpkg.com/three@0.145.0/build/three.module.js";

document.addEventListener("DOMContentLoaded", () => {
    const scene = new THREE.Scene();

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({color: "#2862ea"});
    const cube = new THREE.Mesh(geometry, material);

    cube.position.set(0, 0, -2);
    scene.add(cube);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 2);

    const renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;

    navigator.mediaDevices.getUserMedia({video: true})
        .then((stream) => {
            video.srcObject = stream;
            video.play();
        });

    video.style.position = "fixed";
    video.style.top = "0";
    video.style.left = "0";
    video.style.width = "100vw";
    video.style.height = "100vh";
    video.style.objectFit = "cover";
    video.style.zIndex = "-1";
    
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";

    document.body.appendChild(video);

    function animate(time) {
        cube.rotation.x = time / 2000;
        cube.rotation.y = time / 1000;
        renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);
});