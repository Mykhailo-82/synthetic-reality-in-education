import * as THREE from 'three';
import { MindARThree } from "mindar-face-three";
import Human from '@vladmandic/human';

const genderUA = {
  male: 'чоловік',
  female: 'жінка',
};

const humanConfig = {
  debug: false,
  backend: 'webgl',
  modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models/',
  filter: { enabled: false },
  face: {
    enabled: true,
    detector: { rotation: false },
    mesh: { enabled: true },
    iris: { enabled: false },
    attention: { enabled: false },
    description: { enabled: true },
    emotion: { enabled: false },
    antispoof: { enabled: false },
    liveness: { enabled: false },
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  gesture: { enabled: false },
  segmentation: { enabled: false },
};

document.addEventListener('DOMContentLoaded', () => {

  const start = async () => {

    const mindarThree = new MindARThree({
      container: document.body,
      uiScanning: 'yes',
      uiLoading: 'yes',
    });

    const { scene, camera, renderer } = mindarThree;

    await mindarThree.start();

    const video = document.querySelector('video');

    const human = new Human(humanConfig);

    console.log('Human version:', human.version, '| tfjs version:', human.tf.version['tfjs-core']);
    console.log('Backend:', human.tf.getBackend(), '| available:', human.env.backends);

    await human.load();
    console.log('Models loaded:', human.models.loaded());

    await human.warmup();
    console.log('Human ready');

    const ageEl = document.querySelector('.info-panel__metric--age');
    const genderEl = document.querySelector('.info-panel__metric--gender');

    let frameCount = 0;
    let isDetecting = false;

    renderer.setAnimationLoop(() => {
      frameCount++;

      if (frameCount % 5 === 0 && !isDetecting) {
        isDetecting = true;
        human.detect(video)
          .then(() => {
            const face = human.result?.face?.[0];
            if (face) {
              if (face.age) {
                ageEl.textContent = 'Вік: ' + Math.round(face.age);
              }
              if (face.gender && face.genderScore > 0.5) {
                genderEl.textContent = 'Стать: ' + (genderUA[face.gender] || face.gender);
              }
            }
          })
          .catch(err => {
            console.warn('Human detect error:', err);
          })
          .finally(() => {
            isDetecting = false;
          });
      }

      renderer.render(scene, camera);
    });
  };

  start();
});