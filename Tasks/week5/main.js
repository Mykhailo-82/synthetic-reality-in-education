import * as THREE from 'three';
import {MindARThree} from 'mindar-image-three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.querySelector("#startButton");
  const container = document.getElementById('mind-ar-container');

  const mindarThree = new MindARThree({
    container: container,
    imageTargetSrc: "./../../assets/targets/panadolAndIodomarine.mind",
    maxTrack: 2,
  });

  const {renderer, scene, camera} = mindarThree;

  const listener = new THREE.AudioListener();
  camera.add(listener);



  startButton.addEventListener("click", async () => {
    try {
      if (listener.context.state === 'suspended') {
        await listener.context.resume();
      }

      startButton.textContent = "Завантаження...";
      await start();
      
      document.getElementById('start-screen').style.display = 'none'; 
      startButton.disabled = true;
    } catch (err) {
      console.error(err);
    }
  });

  const anchor1 = mindarThree.addAnchor(0);   
  const anchor2 = mindarThree.addAnchor(1);  

  
  const textureLoader = new THREE.TextureLoader();
  const catTexture1 = textureLoader.load("https://raw.githubusercontent.com/Mykhailo-82/synthetic-reality-in-education/main/Tasks/week3/images/cat1.jpg");
  const catTexture2 = textureLoader.load("https://images.unsplash.com/vector-1749532960959-c79c35d8bf7e?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=mila-okta-safitri-7gvme6muqY8-unsplash.jpg&w=512");
  const catTexture3 = textureLoader.load("./images/cat3.jpg");

  
  const cubeGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
  const cubeMaterials = [
    new THREE.MeshBasicMaterial({ map: catTexture1 }),
    new THREE.MeshBasicMaterial({ map: catTexture1 }),
    new THREE.MeshBasicMaterial({ map: catTexture2 }),
    new THREE.MeshBasicMaterial({ map: catTexture2 }),
    new THREE.MeshBasicMaterial({ map: catTexture3 }),
    new THREE.MeshBasicMaterial({ map: catTexture3 }),
  ];

  const cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
  cube.position.set(0.75, 0, 0);

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 32), new THREE.MeshBasicMaterial({ color: "#2862ea" }));
  sphere.position.set(-0.4, 0, 0);

  const torus = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.05, 16, 64), new THREE.MeshBasicMaterial({ color: "#ff0000" }));
  torus.position.set(0, 0, 0);

  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 32), new THREE.MeshBasicMaterial({ color: "#00ff00" }));
  cone.position.set(0.4, 0, 0);
  cone.rotation.x = Math.PI / 2;

  
  scene.add(new THREE.AmbientLight(0xffffff, 1));
  const directLight = new THREE.DirectionalLight(0xffffff, 3);
  directLight.position.set(0, 5, 5);
  scene.add(directLight);

  
  anchor1.group.add(sphere, torus, cone, cube);

  const cube2 = cube.clone();
  cube2.position.set(0.75, 0, 0);

  const sphere2 = sphere.clone();
  sphere2.position.set(-0.4, 0, 0);

  const torus2 = torus.clone();
  torus2.position.set(0, 0, 0);

  const cone2 = cone.clone();
  cone2.position.set(0.4, 0, 0);
  cone2.rotation.x = Math.PI / 2;

  anchor2.group.add(sphere2, torus2, cone2, cube2);

  const animatedCubes = [cube, cube2];
  const animatedCones = [cone, cone2];
  const animatedSpheres = [sphere, sphere2];




  let mixer1, mixer2;
  const gltfLoader = new GLTFLoader();
  const audioLoader = new THREE.AudioLoader();

  gltfLoader.load('./../../assets/models/cow3d.glb', (gltf) => {
    const cow = gltf.scene;
    cow.scale.set(0.3, 0.3, 0.3);
    cow.rotation.x = Math.PI / 2;
    cow.rotation.y = Math.PI / 2;

    anchor1.group.add(cow);
    const cow2 = SkeletonUtils.clone(cow);
    console.log("Cow 2 added to anchor 2", cow2);
    
    cow2.scale.set(0.3, 0.3, 0.3);
    cow2.rotation.x = Math.PI / 2;
    cow2.rotation.y = Math.PI / 2;
    anchor2.group.add(cow2);

    anchor2.group.add(cow2);

    if (gltf.animations && gltf.animations.length > 0) {
      mixer1 = new THREE.AnimationMixer(cow);
      mixer1.clipAction(gltf.animations[0]).play();
      mixer2 = new THREE.AnimationMixer(cow2);
      mixer2.clipAction(gltf.animations[0]).play();
    }



    audioLoader.load("./../../assets/audio/cowMoo.mp3", (buffer) => {
      const sound1 = new THREE.PositionalAudio(listener);
      sound1.setBuffer(buffer);
      sound1.setRefDistance(0.5);
      sound1.setVolume(100.0);
      sound1.setLoop(true);
      anchor1.group.add(sound1);

      const sound2 = new THREE.PositionalAudio(listener);
      sound2.setBuffer(buffer);
      sound2.setRefDistance(0.5);
      sound2.setVolume(100.0);
      sound2.setLoop(true);
      anchor2.group.add(sound2);

      const playSound = async (s) => {
        if (listener.context.state === 'suspended') {
          await listener.context.resume();
        }
        if (!s.isPlaying) s.play();
      };

      anchor1.onTargetFound = () => playSound(sound1);
      anchor1.onTargetLost = () => { if (sound1.isPlaying) sound1.pause(); };

      anchor2.onTargetFound = () => playSound(sound2);
      anchor2.onTargetLost = () => { if (sound2.isPlaying) sound2.pause(); };
    });
  });

  const start = async () => {
    await mindarThree.start();
    const clock = new THREE.Clock();

    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      const t = clock.elapsedTime; 

      if (mixer1) mixer1.update(delta);
      if (mixer2) mixer2.update(delta);

      animatedCubes.forEach(obj => {
        obj.rotation.x = t;
        obj.rotation.y = t * 0.7;
      });

      animatedCones.forEach(obj => {
        obj.position.y = 0.1 * Math.abs(Math.sin(t * 3));
      });

      const currentScale = 1 + 0.3 * Math.sin(t * 2);
      animatedSpheres.forEach(obj => {
        obj.scale.set(currentScale, currentScale, currentScale);
      });

      renderer.render(scene, camera);
    });
  };
});