import "./project_game_release/restart-audio-context.js";
import game_init from "./project_game_release/project_game.js";
import { apiFetch, isLoggedIn } from "../../js/api.js";
import { BASE } from "../../js/config.js";

// Show Game window
const game_canvas = document.getElementById("project-game");
game_init();

let once = false;
const observer_callback = (_mutations, _observer) => {
  if (!once) {
    game_canvas.style.display = "block";
    game_canvas.style.width = "100%";
    game_canvas.style.aspectRatio =
      game_canvas.attributes.width.value / game_canvas.attributes.height.value;
    once = true;
  }
};
const observer = new MutationObserver(observer_callback);
const config = { attributeFilter: ["width", "height"] };
observer.observe(game_canvas, config);

// Score submission modal
const scoreModal = document.getElementById("score-modal");
const scoreValue = document.getElementById("modal-score-value");
const submitScoreBtn = document.getElementById("submit-score-btn");
const modalCloseBtn = document.getElementById("modal-close-btn");
const scoreMsg = document.getElementById("score-msg");

let currentScore = 0;

document.addEventListener("game-score", (e) => {
  currentScore = e.detail;
  scoreValue.textContent = currentScore;
  scoreModal.style.display = "flex";
  scoreMsg.textContent = "";
  submitScoreBtn.disabled = false;

  if (isLoggedIn()) {
    submitScoreBtn.style.display = "";
  } else {
    submitScoreBtn.style.display = "none";
    scoreMsg.textContent = "Login to submit your score!";
  }
});

submitScoreBtn.addEventListener("click", async () => {
  try {
    submitScoreBtn.disabled = true;
    scoreMsg.textContent = "Submitting...";
    scoreMsg.style.color = "";

    const result = await apiFetch("/api/scores", {
      method: "POST",
      body: JSON.stringify({ score: currentScore }),
    });

    const { page } = await apiFetch(`/api/scores/rank/${result._id}?limit=10`);
    window.location.href = BASE + `/leaderboard.html?page=${page}&highlight=${result._id}`;
  } catch (err) {
    scoreMsg.textContent = err.message;
    scoreMsg.style.color = "#dc2626";
    submitScoreBtn.disabled = false;
  }
});

modalCloseBtn.addEventListener("click", () => {
  scoreModal.style.display = "none";
});
