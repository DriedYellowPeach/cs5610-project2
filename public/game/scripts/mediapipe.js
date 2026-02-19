import vision from "../third-party/mediapipe/tasks-vision@0.10.3.js";
import { BASE } from "../../js/config.js";

const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

const videoBlendShapes = document.getElementById("video-blend-shapes");

let faceLandmarker;
let runningMode = "IMAGE"; // "IMAGE" or "VIDEO"
let toggleFaceMeshButton = document.getElementById("toggle-face-mesh-button");
let webcamRunning = false;
let lastDispatchTimeUp = 0;
let lastDispatchTimeDown = 0;
let showIntroductionSection = true;
const dispatchCooldown = 1000;
const videoWidth = 320;
const faceMeshColor = "#7aa2f7";
const browLeftColor = "#f7768e";
const browRightColor = "#9ece6a";
const irisLeftColor = "#f7768e";
const irisRightColor = "#9ece6a";

// Setup Button to Toggle Face Mesh
function toggleFaceMesh() {
  const introSection = document.getElementById("introduction-section");
  const faceMeshSection = document.getElementById("facemesh-section");

  showIntroductionSection = !showIntroductionSection;

  if (showIntroductionSection) {
    introSection.style.display = "block";
    faceMeshSection.classList.add("section-hidden");
  } else {
    introSection.style.display = "none";
    faceMeshSection.classList.remove("section-hidden");
  }
}
toggleFaceMeshButton.addEventListener("click", toggleFaceMesh);

// Load FaceLandmarker model
async function createFaceLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    BASE + "/game/third-party/mediapipe/wasm",
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: BASE + "/game/third-party/mediapipe/face_landmarker.task",
      delegate: "GPU",
    },
    outputFaceBlendshapes: true,
    runningMode,
    numFaces: 1,
  });
}
createFaceLandmarker();

// Webcam stream detection
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");

function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

if (hasGetUserMedia()) {
} else {
  console.warn("getUserMedia() is not supported by your browser");
}
let lastVideoTime = -1;
let results = undefined;
const drawingUtils = new DrawingUtils(canvasCtx);

getWebCamPermission();

function getWebCamPermission() {
  const constraints = { video: true };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
      webcamRunning = true;
      toggleFaceMeshButton.style.display = "block";
    })
    .catch((err) => {
      console.error("Error accessing webcam: ", err);
      webcamRunning = false;
      // Show help paragraph to let user reload the page
      const reload_page = document.getElementById("reload-page-div");
      reload_page.style.display = "flex";
    });
}

async function predictWebcam() {
  if (!faceLandmarker) {
    window.requestAnimationFrame(predictWebcam);
    return;
  }

  const ratio = video.videoHeight / video.videoWidth;
  video.style.width = videoWidth + "px";
  video.style.height = videoWidth * ratio + "px";
  canvasElement.style.width = videoWidth + "px";
  canvasElement.style.height = videoWidth * ratio + "px";
  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;

  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await faceLandmarker.setOptions({ runningMode });
  }

  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = faceLandmarker.detectForVideo(video, startTimeMs);
  }

  if (results.faceLandmarks) {
    for (const landmarks of results.faceLandmarks) {
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
        color: faceMeshColor,
        lineWidth: 0.5,
      });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, {
        color: browRightColor,
      });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, {
        color: browRightColor,
      });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, {
        color: browLeftColor,
      });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, {
        color: browLeftColor,
      });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, {
        color: faceMeshColor,
      });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
        color: faceMeshColor,
      });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, {
        color: browRightColor,
      });
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, {
        color: browLeftColor,
      });
    }
  }

  drawBlendShapes(videoBlendShapes, results.faceBlendshapes);

  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}

function drawBlendShapes(el, blendShapes) {
  if (!blendShapes.length) return;
  const now = Date.now();
  let html = "";

  blendShapes[0].categories.forEach((shape) => {
    const name = shape.displayName || shape.categoryName;

    if (name.toLowerCase().includes("brow")) {
      html += `
      <li class="blend-shapes-item">
        <span class="blend-shapes-label">${name}</span>
        <progress class="score" value="${shape.score * 100}" max="100"></progress>
        <span class="progress"> ${shape.score.toFixed(4)} </span>
      </li>
    `;
      if (
        name === "browDownLeft" &&
        shape.score > 0.2 &&
        now - lastDispatchTimeUp > dispatchCooldown
      ) {
        document.dispatchEvent(new CustomEvent("move", { detail: { down: shape.score } }));
        lastDispatchTimeUp = now;
      }

      if (
        name === "browInnerUp" &&
        shape.score > 0.5 &&
        now - lastDispatchTimeDown > dispatchCooldown
      ) {
        document.dispatchEvent(new CustomEvent("move", { detail: { up: shape.score } }));
        lastDispatchTimeDown = now;
      }
    }
  });

  el.innerHTML = html;
}
