import * as THREE from "three";
import { MindARThree } from "mindar-image-three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";

function createYouTube(videoUrl) {
  const id = videoUrl.match(/(?:v=|youtu\.be\/|embed\/)([^?&]+)/)?.[1];

  const wrapper = document.createElement("div");
  wrapper.style.width = "1500px";
  wrapper.style.height = "540px";
  wrapper.style.position = "relative";
  wrapper.style.transform = "translateY(580px) scale(0.65)";
  wrapper.style.transformOrigin = "top center";

  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube.com/embed/${id}?enablejsapi=1&autoplay=0`;
  iframe.width = "960";
  iframe.height = "540";
  iframe.allow = "autoplay; fullscreen";
  iframe.style.border = "none";
  iframe.style.position = "absolute";
  iframe.style.left = "0";
  iframe.style.top = "0";
  wrapper.appendChild(iframe);

  const label = document.createElement("div");
  label.innerText = "Одна із моїх робіт";
  label.style.position = "absolute";
  label.style.left = "990px";
  label.style.top = "220px";
  label.style.width = "450px";
  label.style.backgroundColor = "#FF9800";
  label.style.color = "#ffffff";
  label.style.fontFamily = "Arial, sans-serif";
  label.style.fontSize = "42px";
  label.style.fontWeight = "bold";
  label.style.textAlign = "center";
  label.style.padding = "25px 10px";
  label.style.borderRadius = "12px";
  label.style.boxShadow = "0 8px 16px rgba(0,0,0,0.3)";
  wrapper.appendChild(label);

  return {
    element: wrapper,
    play: () => {
      iframe.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "playVideo" }),
        "*"
      );
    },
    pause: () => {
      iframe.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo" }),
        "*"
      );
    }
  };
}

const loadGLTF = (path) => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(path, (gltf) => { resolve(gltf); }, undefined, reject);
  });
};

const showToast = () => {
  const toast = document.getElementById("toast");
  toast.style.opacity = "1";
  setTimeout(() => { toast.style.opacity = "0"; }, 2000);
};

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("startButton");
  const container = document.getElementById("mind-ar-container");
  const screen = document.getElementById("start-screen");

  button.addEventListener("click", async () => {
    screen.style.display = "none";

    const mindarThree = new MindARThree({
      container: container,
      imageTargetSrc: "./marker/marker.mind",
      uiScanning: "yes",
      uiLoading: "yes",
    });

    const { scene, cssScene, camera, renderer, cssRenderer } = mindarThree;

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.5);
    scene.add(light);

    const createTextTexture = (text, backColor, textColor, fontSize = 28) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = backColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = textColor;
      ctx.font = `Bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      return new THREE.CanvasTexture(canvas);
    };

    const cssAnchor = mindarThree.addCSSAnchor(0);
    const webglAnchor = mindarThree.addAnchor(0);

    const youtube = createYouTube("https://youtu.be/GxYaVkPlzm0");
    const obj1 = new CSS3DObject(youtube.element);
    cssAnchor.group.add(obj1);

    cssAnchor.onTargetFound = () => youtube.play();
    cssAnchor.onTargetLost = () => youtube.pause();

    const studentGeom = new THREE.PlaneGeometry(1.2, 0.18);
    const studentMat = new THREE.MeshBasicMaterial({
      map: createTextTexture("Михайло Овчінніков, група Ім-25", "#2C3E50", "#ffffff", 26),
      transparent: true,
      opacity: 0.95
    });
    const studentMesh = new THREE.Mesh(studentGeom, studentMat);
    studentMesh.position.set(0, 0.6, 0);
    webglAnchor.group.add(studentMesh);

    const titleGeometry = new THREE.PlaneGeometry(0.6, 0.15);
    const titleMaterial = new THREE.MeshBasicMaterial({ map: createTextTexture("ВІЗИТІВКА", "#34495E", "#ffffff", 44), transparent: true, opacity: 0.9 });
    const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
    titleMesh.position.set(0, 0.3, 0);
    webglAnchor.group.add(titleMesh);

    const buttonGeometry = new THREE.PlaneGeometry(0.5, 0.2);
    const githubMaterial = new THREE.MeshBasicMaterial({ map: createTextTexture("GitHub", "#24292e", "#ffffff", 40) });
    const githubButton = new THREE.Mesh(buttonGeometry, githubMaterial);
    githubButton.position.set(0.6, 0, 0);
    githubButton.userData.clickable = true;
    githubButton.userData.action = "github";
    webglAnchor.group.add(githubButton);

    const infoMaterial = new THREE.MeshBasicMaterial({ map: createTextTexture("Контакти", "#007ACC", "#ffffff", 40) });
    const infoButton = new THREE.Mesh(buttonGeometry, infoMaterial);
    infoButton.position.set(-0.6, 0, 0);
    infoButton.userData.clickable = true;
    infoButton.userData.action = "info";
    webglAnchor.group.add(infoButton);

    const panelGeometry = new THREE.PlaneGeometry(1.0, 0.2);
    const emailText = "mykhailo.ovchinnikov.mi21@gmail.com";
    const panelMaterial = new THREE.MeshBasicMaterial({ map: createTextTexture(emailText, "#222222", "#ffffff", 24), transparent: true, opacity: 0.9 });
    const infoPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    infoPanel.position.set(-0.6, -0.25, 0);
    infoPanel.visible = false;
    infoPanel.userData.clickable = true;
    infoPanel.userData.action = "copy";
    webglAnchor.group.add(infoPanel);

    let modelContainer = new THREE.Group();
    try {
      const gltf = await loadGLTF("./../../assets/models/3d_github_logo.glb");
      const githubModelMesh = gltf.scene;

      const box = new THREE.Box3().setFromObject(githubModelMesh);
      const center = new THREE.Vector3();
      box.getCenter(center);
      githubModelMesh.position.sub(center);

      modelContainer.scale.set(0.2, 0.2, 0.2);
      modelContainer.position.set(1, 0.4, 0);
      modelContainer.add(githubModelMesh);
      webglAnchor.group.add(modelContainer);
    } catch (e) {
      console.error("Помилка завантаження моделі:", e);
    }

    window.addEventListener("click", (e) => {
      const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      const mouse = new THREE.Vector2(mouseX, mouseY);

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(webglAnchor.group.children, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;

        while (obj.parent && !obj.userData.clickable) {
          obj = obj.parent;
        }

        if (obj.userData.clickable) {
          if (obj.userData.action === "github") {
            window.open('https://github.com/Mykhailo-82', '_blank');
          } else if (obj.userData.action === "info") {
            infoPanel.visible = !infoPanel.visible;
          } else if (obj.userData.action === "copy") {
            navigator.clipboard.writeText(emailText).then(() => {
              showToast();
            });
          }
        }
      }
    });

    await mindarThree.start();

    renderer.setAnimationLoop(() => {
      if (modelContainer) {
        modelContainer.rotation.y += 0.02;
      }
      renderer.render(scene, camera);
      cssRenderer.render(cssScene, camera);
    });
  });
});