import { apiFetch, getCurrentUser } from "./api.js";
import { BASE } from "./config.js";

const AVATARS = [
  "/assets/avatars/default.svg",
  "/assets/avatars/avatar1.svg",
  "/assets/avatars/avatar2.svg",
  "/assets/avatars/avatar3.svg",
  "/assets/avatars/avatar4.svg",
  "/assets/avatars/avatar5.svg",
  "/assets/avatars/avatar6.svg",
];

const profileAvatar = document.getElementById("profile-avatar");
const profileUsername = document.getElementById("profile-username");
const profileSince = document.getElementById("profile-since");
const editSection = document.getElementById("edit-section");
const editForm = document.getElementById("edit-form");
const editUsername = document.getElementById("edit-username");
const avatarPicker = document.getElementById("avatar-picker");
const editMsg = document.getElementById("edit-msg");
const scoresBody = document.getElementById("scores-body");

let selectedAvatar = null;

// Get user ID from URL or show own profile
const params = new URLSearchParams(window.location.search);
const currentUser = getCurrentUser();
const profileId = params.get("id") || (currentUser ? currentUser.userId : null);

if (!profileId) {
  window.location.href = BASE + "/login.html";
}

const isOwnProfile = currentUser && currentUser.userId === profileId;

async function loadProfile() {
  try {
    const user = await apiFetch(`/api/users/${profileId}`);
    profileUsername.textContent = user.username;
    profileSince.textContent = `Member since ${new Date(user.createdAt).toLocaleDateString()}`;
    profileAvatar.src = BASE + (user.avatarUrl || AVATARS[0]);

    if (isOwnProfile) {
      editSection.classList.remove("hidden");
      editUsername.value = user.username;
      selectedAvatar = user.avatarUrl || AVATARS[0];
      buildAvatarPicker();
    }
  } catch {
    profileUsername.textContent = "User not found";
  }
}

async function loadScores() {
  try {
    const scores = await apiFetch(`/api/users/${profileId}/scores`);
    if (scores.length === 0) {
      scoresBody.innerHTML = `<tr><td colspan="3">No scores yet.</td></tr>`;
      return;
    }
    scoresBody.innerHTML = scores
      .map(
        (s, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${s.score}</td>
          <td>${new Date(s.createdAt).toLocaleDateString()}</td>
        </tr>`
      )
      .join("");
  } catch {
    scoresBody.innerHTML = `<tr><td colspan="3">Failed to load scores.</td></tr>`;
  }
}

function buildAvatarPicker() {
  avatarPicker.innerHTML = "";
  AVATARS.forEach((url) => {
    const img = document.createElement("img");
    img.src = BASE + url;
    img.alt = "Avatar option";
    img.className = "avatar-option" + (url === selectedAvatar ? " selected" : "");
    img.addEventListener("click", () => {
      selectedAvatar = url;
      avatarPicker.querySelectorAll("img").forEach((el) => el.classList.remove("selected"));
      img.classList.add("selected");
    });
    avatarPicker.appendChild(img);
  });
}

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  editMsg.textContent = "";
  editMsg.style.color = "";

  try {
    const updated = await apiFetch("/api/users/me", {
      method: "PUT",
      body: JSON.stringify({
        username: editUsername.value,
        avatarUrl: selectedAvatar,
      }),
    });
    profileUsername.textContent = updated.username;
    profileAvatar.src = BASE + (updated.avatarUrl || AVATARS[0]);
    editMsg.textContent = "Profile updated!";
    editMsg.style.color = "green";
  } catch (err) {
    editMsg.textContent = err.message;
  }
});

loadProfile();
loadScores();
