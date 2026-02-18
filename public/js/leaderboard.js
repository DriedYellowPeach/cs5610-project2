import { apiFetch, getCurrentUser } from "./api.js";

const tbody = document.getElementById("leaderboard-body");

async function loadLeaderboard() {
  try {
    const scores = await apiFetch("/api/scores/leaderboard?limit=20");
    const currentUser = getCurrentUser();

    if (scores.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4">No scores yet. Be the first to play!</td></tr>`;
      return;
    }

    tbody.innerHTML = scores
      .map((entry, i) => {
        const isMe = currentUser && entry.userId === currentUser.userId;
        const date = new Date(entry.createdAt).toLocaleDateString();
        return `
          <tr class="${isMe ? "highlight" : ""}">
            <td>${i + 1}</td>
            <td><a href="/profile.html?id=${entry.userId}">${entry.username}</a></td>
            <td>${entry.score}</td>
            <td>${date}</td>
          </tr>`;
      })
      .join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">Failed to load leaderboard.</td></tr>`;
  }
}

loadLeaderboard();
