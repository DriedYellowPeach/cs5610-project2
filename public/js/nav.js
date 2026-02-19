import { isLoggedIn, getCurrentUser, removeToken } from "./api.js";
import { BASE } from "./config.js";

const navContainer = document.getElementById("nav");

function buildNav() {
  const user = getCurrentUser();
  const loggedIn = isLoggedIn();

  const links = [
    { href: BASE + "/", label: "Home" },
    { href: BASE + "/game/", label: "Play" },
    { href: BASE + "/leaderboard.html", label: "Leaderboard" },
  ];

  const rightLinks = loggedIn
    ? `<div class="nav-right">
        <a href="${BASE}/profile.html">${user.username}</a>
        <a href="#" id="logout-link">Logout</a>
      </div>`
    : `<div class="nav-right">
        <a href="${BASE}/login.html">Login</a>
      </div>`;

  navContainer.innerHTML = `
    <nav class="navbar">
      <a class="nav-brand" href="${BASE}/">FaceGame</a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">&#9776;</button>
      <div class="nav-links" id="nav-links">
        ${links.map((l) => `<a href="${l.href}">${l.label}</a>`).join("")}
        ${rightLinks}
      </div>
    </nav>`;

  // Logout handler
  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      removeToken();
      window.location.href = BASE + "/";
    });
  }

  // Mobile toggle
  const toggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  toggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

buildNav();
