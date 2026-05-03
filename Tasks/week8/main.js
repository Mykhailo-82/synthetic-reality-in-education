import * as THREE from "three";
import { MindARThree } from "mindar-face-three";

document.addEventListener("DOMContentLoaded", () => {

  const menu = document.getElementById("menu");
  const arContainer = document.getElementById("ar-container");
  const vrMode = document.getElementById("vrMode");
  const arMode = document.getElementById("arMode");
  const backButton = document.getElementById("backButton");

  let mindarThree;
  let spheres = [];

  const start = async (isVR = false) => {

    mindarThree = new MindARThree({
      container: arContainer,
      uiScanning: "yes",
      uiLoading: "yes",
    });

    const { scene, camera, renderer } = mindarThree;

    const geometry = new THREE.SphereGeometry(0.01, 32, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      transparent: true,
      opacity: 0.5
    });

    spheres = [];
    const anchors = [];

    for (let i = 0; i < 468; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      spheres.push(mesh);
      anchors.push(mindarThree.addAnchor(i));
    }

    for (let i = 0; i < 468; i++) {
      anchors[i].group.add(spheres[i]);
    }

    await mindarThree.start();


    if (isVR) {
      const video = document.querySelector("video");
      if (video) {
        video.style.display = "none";
      }
    }

    renderer.setAnimationLoop(() => {
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