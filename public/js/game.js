import { apiFetch, isLoggedIn } from "./api.js";

const webcamEl = document.getElementById("webcam");
const scoreDisplay = document.getElementById("score-display");
const startBtn = document.getElementById("start-btn");
const gameOverOverlay = document.getElementById("game-over");
const finalScoreEl = document.getElementById("final-score");
const submitScoreBtn = document.getElementById("submit-score-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const scoreMsg = document.getElementById("score-msg");

let currentScore = 0;

// --- Webcam setup ---
async function initWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    webcamEl.srcObject = stream;
  } catch (err) {
    console.error("Webcam access denied:", err);
  }
}

function onScoreUpdate(score) {
  currentScore = score;
  scoreDisplay.textContent = `Score: ${score}`;
}

function onGameOver(score) {
  currentScore = score;
  finalScoreEl.textContent = score;
  gameOverOverlay.classList.remove("hidden");

  if (!isLoggedIn()) {
    submitScoreBtn.style.display = "none";
    scoreMsg.textContent = "Login to submit your score!";
  } else {
    submitScoreBtn.style.display = "";
    scoreMsg.textContent = "";
  }
}

// Placeholder: simulate a short game for testing
function startPlaceholderGame() {
  gameOverOverlay.classList.add("hidden");
  scoreMsg.textContent = "";
  currentScore = 0;
  onScoreUpdate(0);

  let tick = 0;
  const interval = setInterval(() => {
    tick++;
    onScoreUpdate(tick);
    if (tick >= 10) {
      clearInterval(interval);
      onGameOver(tick);
    }
  }, 300);
}

// --- Event listeners ---
startBtn.addEventListener("click", () => {
  startPlaceholderGame();
});

playAgainBtn.addEventListener("click", () => {
  startPlaceholderGame();
});

submitScoreBtn.addEventListener("click", async () => {
  try {
    await apiFetch("/api/scores", {
      method: "POST",
      body: JSON.stringify({ score: currentScore }),
    });
    scoreMsg.textContent = "Score submitted!";
    scoreMsg.style.color = "green";
    submitScoreBtn.disabled = true;
  } catch (err) {
    scoreMsg.textContent = err.message;
  }
});

// Init
initWebcam();
