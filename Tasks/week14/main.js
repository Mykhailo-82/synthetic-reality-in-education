const MODEL_URL = "./../../assets/ai/presidents/";
const THRESHOLD = 0.75;

const videoEl = document.getElementById("webcam");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

let model = null;

const tmCanvas = document.createElement("canvas");
tmCanvas.width = 224;
tmCanvas.height = 224;
const tmCtx = tmCanvas.getContext("2d");

async function startCamera() {
  statusEl.textContent = "Запуск камери...";

  const tries = [
    { video: { facingMode: { exact: "environment" } }, audio: false },
    { video: { facingMode: "environment" }, audio: false },
    { video: true, audio: false }
  ];

  for (const constraints of tries) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoEl.srcObject = stream;

      await new Promise((resolve, reject) => {
        videoEl.oncanplay = resolve;
        videoEl.onerror = reject;
      });

      await videoEl.play();
      statusEl.textContent = "Камера працює. Завантаження моделі...";
      return true;
    } catch (e) {
      console.warn("Камера не доступна з:", constraints, e.message);
    }
  }

  statusEl.textContent = "Немає доступу до камери!";
  return false;
}

async function loadModel() {
  try {
    model = await tmImage.load(
      MODEL_URL + "model.json",
      MODEL_URL + "metadata.json"
    );
    statusEl.textContent = "Спрямуйте камеру на портрет президента";
    return true;
  } catch (e) {
    console.error("Помилка моделі:", e);
    statusEl.textContent = "Помилка завантаження моделі";
    return false;
  }
}

async function predict() {
  if (!model) return;
  if (videoEl.readyState < videoEl.HAVE_ENOUGH_DATA) return;

  try {
    tmCtx.drawImage(videoEl, 0, 0, 224, 224);

    const predictions = await model.predict(tmCanvas);

    let best = predictions.reduce((a, b) => a.probability > b.probability ? a : b);

    if (best.probability >= THRESHOLD) {
      resultEl.textContent = `${best.className} (${Math.round(best.probability * 100)}%)`;
      resultEl.style.borderColor = "#fff";
      resultEl.style.background = "rgba(255, 255, 255, 0.2)";
    } else {
      resultEl.textContent = "Сканування...";
      resultEl.style.borderColor = "rgba(255, 255, 255, 0.1)";
      resultEl.style.background = "rgba(255, 255, 255, 0.05)";
    }

    resultEl.style.whiteSpace = "pre";
    resultEl.style.fontSize = "14px";
    resultEl.style.textAlign = "left";
    resultEl.textContent = lines;

  } catch (e) {
    console.error("Помилка розпізнавання:", e);
  }
}

async function main() {
  const cameraOk = await startCamera();
  if (!cameraOk) return;

  const modelOk = await loadModel();
  if (!modelOk) return;

  setInterval(predict, 250);
}

main();