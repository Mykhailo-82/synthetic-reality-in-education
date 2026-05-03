import * as THREE from "three";
import { MindARThree } from "mindar-image-three";
import { CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";


function createYouTube(videoUrl) {
  const id = videoUrl.match(/(?:v=|youtu\.be\/)([^&]+)/)?.[1];

  const iframe = document.createElement("iframe");

  iframe.src = `https://www.youtube.com/embed/${id}?enablejsapi=1&autoplay=0`;
  iframe.width = "960";
  iframe.height = "540";
  iframe.allow = "autoplay; fullscreen";
  iframe.style.border = "none";

  return {
    element: iframe,
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


document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("startButton");
  const container = document.getElementById("mind-ar-container");
  const screen = document.getElementById("start-screen");

  button.addEventListener("click", async () => {
    screen.style.display = "none";

    const mindarThree = new MindARThree({
      container: container,
      imageTargetSrc: "./../../assets/targets/panadolAndWorld.mind",
      maxTrack: 2,
      uiScanning: "yes",
      uiLoading: "yes",
    });

    const { scene, cssScene, camera, renderer, cssRenderer } = mindarThree;

    


    const anchor1 = mindarThree.addCSSAnchor(0);

    const youtube = createYouTube(
      "https://www.youtube.com/watch?v=qP-7GNoDJ5c"
    );

    const obj1 = new CSS3DObject(youtube.element);
    anchor1.group.add(obj1);

    anchor1.onTargetFound = () => youtube.play();
    anchor1.onTargetLost = () => youtube.pause();


    


    const anchor2 = mindarThree.addCSSAnchor(1);

    const iframe2 = document.createElement("iframe");

    iframe2.src = "https://player.vimeo.com/video/76979871?autoplay=0&muted=1";
    iframe2.width = "480";
    iframe2.height = "270";
    iframe2.allow = "autoplay; fullscreen";
    iframe2.style.border = "none";

    const obj2 = new CSS3DObject(iframe2);
    anchor2.group.add(obj2);

    anchor2.onTargetFound = () => {
      iframe2.contentWindow?.postMessage('{"method":"play"}', "*");
    };

    anchor2.onTargetLost = () => {
      iframe2.contentWindow?.postMessage('{"method":"pause"}', "*");
    };


    

    await mindarThree.start();

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
      cssRenderer.render(cssScene, camera);
    });
  });
});