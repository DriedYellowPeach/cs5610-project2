import { apiFetch } from "./api.js";
import { BASE } from "./config.js";

const topScores = document.getElementById("top-scores");

async function loadTopScores() {
  try {
    const { scores } = await apiFetch("/api/scores/leaderboard?limit=5");
    if (scores.length === 0) {
      topScores.innerHTML = `<tr><td colspan="3">No scores yet. Be the first!</td></tr>`;
      return;
    }
    topScores.innerHTML = scores
      .map(
        (s, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><a href="${BASE}/profile.html?id=${s.userId}">${s.username}</a></td>
          <td>${s.score}</td>
        </tr>`,
      )
      .join("");
  } catch {
    topScores.innerHTML = `<tr><td colspan="3">Could not load scores.</td></tr>`;
  }
}

loadTopScores();
// Peer review: Nice modular structure here—good use of ES6 modules and clean code organization.
