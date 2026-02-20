import { apiFetch, getCurrentUser } from "./api.js";
import { BASE } from "./config.js";

const tbody = document.getElementById("leaderboard-body");
const paginationEl = document.getElementById("pagination");
const PAGE_SIZE = 10;

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    page: parseInt(params.get("page")) || 1,
    highlight: params.get("highlight") || null,
  };
}

function setUrlPage(page) {
  const params = new URLSearchParams(window.location.search);
  params.set("page", page);
  params.delete("highlight");
  window.history.pushState({}, "", `?${params}`);
}

async function loadLeaderboard(page, highlightId) {
  try {
    const data = await apiFetch(`/api/scores/leaderboard?page=${page}&limit=${PAGE_SIZE}`);
    const { scores, total, page: currentPage, limit } = data;
    const currentUser = getCurrentUser();
    const totalPages = Math.ceil(total / limit);

    if (scores.length === 0 && currentPage === 1) {
      tbody.innerHTML = `<tr><td colspan="4">No scores yet. Be the first to play!</td></tr>`;
      paginationEl.innerHTML = "";
      return;
    }

    tbody.innerHTML = scores
      .map((entry, i) => {
        const rank = (currentPage - 1) * limit + i + 1;
        const isMe = currentUser && entry.userId === currentUser.userId;
        const isHighlighted = highlightId && entry._id === highlightId;
        const date = new Date(entry.createdAt).toLocaleString();

        let rowClass = "";
        if (isHighlighted) rowClass = "highlight-new";
        else if (isMe) rowClass = "highlight";

        return `
          <tr class="${rowClass}" ${isHighlighted ? 'id="highlighted-score"' : ""}>
            <td>${rank}</td>
            <td><a href="${BASE}/profile.html?id=${entry.userId}">${entry.username}</a></td>
            <td>${entry.score}</td>
            <td>${date}</td>
          </tr>`;
      })
      .join("");

    renderPagination(currentPage, totalPages);

    if (highlightId) {
      const row = document.getElementById("highlighted-score");
      if (row) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  } catch {
    tbody.innerHTML = `<tr><td colspan="4">Failed to load leaderboard.</td></tr>`;
    paginationEl.innerHTML = "";
  }
}

function renderPagination(current, totalPages) {
  if (totalPages <= 1) {
    paginationEl.innerHTML = "";
    return;
  }

  let html = "";

  html += `<button ${current === 1 ? "disabled" : ""} data-page="${current - 1}">Prev</button>`;

  const pages = getPageNumbers(current, totalPages);
  for (const p of pages) {
    if (p === "...") {
      html += `<span class="page-info">...</span>`;
    } else {
      html += `<button class="${p === current ? "active" : ""}" data-page="${p}">${p}</button>`;
    }
  }

  html += `<button ${current === totalPages ? "disabled" : ""} data-page="${current + 1}">Next</button>`;

  paginationEl.innerHTML = html;

  paginationEl.querySelectorAll("button[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = parseInt(btn.dataset.page);
      setUrlPage(page);
      loadLeaderboard(page, null);
    });
  });
}

function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set([1, total]);

  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push("...");
    }
    result.push(sorted[i]);
  }
  return result;
}

// Handle browser back/forward
window.addEventListener("popstate", () => {
  const { page, highlight } = getUrlParams();
  loadLeaderboard(page, highlight);
});

// Initial load
const { page, highlight } = getUrlParams();
loadLeaderboard(page, highlight);
