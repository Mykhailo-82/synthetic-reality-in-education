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

  const ACCESSORIES = [
    {
      id: "hat",
      label: "Капелюх",
      file: "hat.glb",
      anchor: 10,
      scale: [4.0, 4.0, 4.0],
      position: [0, 0.4, -0.6],
      rotation: [0, Math.PI, 0],
    },
    {
      id: "ribbon",
      label: "Стрічка",
      file: "accessory_head_ribbon.glb",
      anchor: 10,
      scale: [800, 800, 800],
      position: [0, -0.2, 0],
      rotation: [0, 0, 0],
    },
    {
      id: "aviators",
      label: "Окуляри",
      file: "aviators.glb",
      anchor: 168,
      scale: [0.0004, 0.0004, 0.0004],
      position: [0, -0.4, -0.2],
      rotation: [0, 0, 0],
    },
    {
      id: "pipe",
      label: "Люлька",
      file: "asian_smoking_pipe.glb",
      anchor: 13,
      scale: [0.2, 0.2, 0.2],
      position: [-0.2, -0.1, 0.2],
      rotation: [0, -90, 0],
    },
    {
      id: "mask_ambu",
      label: "Маска",
      file: "mask_ambu.glb",
      anchor: 168,
      scale: [0.35, 0.35, 0.35],
      position: [0.9, -0.2, 0],
      rotation: [0, 0, 0],
    },
    {
      id: "mustache",
      label: "Вуса",
      file: "mustache.glb",
      anchor: 13,
      scale: [0.35, 0.35, 0.35],
      position: [0, 0.1, 0],
      rotation: [0, 0, 0],
    },
  ];

  const accessoryState = {};
  const urlParams = new URLSearchParams(window.location.search);
  const urlItems = urlParams.get("items")?.split(",").filter(Boolean) ?? [];

  ACCESSORIES.forEach(a => {
    accessoryState[a.id] = urlItems.includes(a.id);
  });

  function syncURL() {
    const active = Object.entries(accessoryState)
      .filter(([, v]) => v)
      .map(([k]) => k);

    const url = new URL(window.location.href);
    if (active.length > 0) {
      url.searchParams.set("items", active.join(","));
    } else {
      url.searchParams.delete("items");
    }
    window.history.replaceState(null, "", url.toString());
  }

  const accessoryGroups = {};

  const panel = document.createElement("div");
  panel.className = "ar-panel";
  document.body.appendChild(panel);

  const shareBtn = document.createElement("button");
  shareBtn.className = "share-btn";
  shareBtn.textContent = "Поділитись";
  document.body.appendChild(shareBtn);

  shareBtn.addEventListener("click", async () => {
    const active = Object.entries(accessoryState)
      .filter(([, v]) => v)
      .map(([k]) => k);

    const shareURL = new URL(window.location.href);
    if (active.length > 0) {
      shareURL.searchParams.set("items", active.join(","));
    } else {
      shareURL.searchParams.delete("items");
    }

    const activeLabels = ACCESSORIES
      .filter(a => accessoryState[a.id])
      .map(a => a.label)
      .join(", ");

    const shareData = {
      title: "Моя AR примірка",
      text: active.length > 0
        ? `Дивись які аксесуари я приміряв: ${activeLabels}`
        : "Спробуй AR примірку аксесуарів!",
      url: shareURL.toString(),
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareURL.toString());
      showToast("Посилання скопійовано!");
    } catch {
      window.prompt("Скопіюйте посилання:", shareURL.toString());
    }
  });

  function showToast(msg) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 500);
    }, 2000);
  }

  function buildPanel() {
    panel.innerHTML = "";
    ACCESSORIES.forEach(acc => {
      const btn = document.createElement("button");
      const active = accessoryState[acc.id];
      btn.textContent = acc.label;
      btn.className = "ar-panel__btn" + (active ? " ar-panel__btn--active" : "");
      btn.addEventListener("click", () => {
        accessoryState[acc.id] = !accessoryState[acc.id];
        const group = accessoryGroups[acc.id];
        if (group) group.visible = accessoryState[acc.id];
        syncURL();
        buildPanel();
      });
      panel.appendChild(btn);
    });
  }

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
    });
    faceMesh.renderOrder = 0;
    scene.add(faceMesh);

    const loader = new GLTFLoader();

    loader.load("../../assets/models/headOccluder.glb", (gltf) => {
      const head = gltf.scene;
      head.scale.set(1.1, 0.8, 1.2);
      head.position.set(0, -2.3, 7);
      head.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshBasicMaterial({
            colorWrite: false,
            depthWrite: true,
            depthTest: true,
          });
          child.renderOrder = 0;
        }
      });
      faceMesh.add(head);
    });

    ACCESSORIES.forEach((acc) => {
      loader.load(`../../assets/models/${acc.file}`, (gltf) => {
        const model = gltf.scene;

        model.scale.set(...acc.scale);
        model.position.set(...acc.position);
        model.rotation.set(...acc.rotation);

        model.traverse((child) => {
          if (child.isMesh) {
            child.renderOrder = 10;
            if (child.material) {
              child.material.depthTest = true;
              child.material.depthWrite = true;
            }
          }
        });

        model.visible = accessoryState[acc.id];
        accessoryGroups[acc.id] = model;

        const anchor = mindarThree.addAnchor(acc.anchor);
        anchor.group.add(model);
      });
    });

    if (isVR) {
      const geometry = new THREE.SphereGeometry(0.01, 32, 16);
      const material = new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        transparent: true,
        opacity: 0.5,
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
      if (video) video.style.display = "none";
    }

    renderer.setAnimationLoop(() => {
      renderer.clear();
      renderer.render(scene, camera);
    });

    panel.style.display = "flex";
    shareBtn.style.display = "block";
    buildPanel();

    if (urlItems.length > 0) {
      const names = ACCESSORIES
        .filter(a => urlItems.includes(a.id))
        .map(a => a.label)
        .join(", ");
      showToast(`Завантажено: ${names}`);
    }
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