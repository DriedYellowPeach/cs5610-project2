import { apiFetch, setToken, isLoggedIn } from "./api.js";

if (isLoggedIn()) {
  window.location.href = "/";
}

let isRegister = false;

const form = document.getElementById("auth-form");
const title = document.getElementById("auth-title");
const usernameGroup = document.getElementById("username-group");
const submitBtn = document.getElementById("submit-btn");
const toggleText = document.getElementById("toggle-text");
const toggleLink = document.getElementById("toggle-link");
const errorMsg = document.getElementById("error-msg");

toggleLink.addEventListener("click", (e) => {
  e.preventDefault();
  isRegister = !isRegister;
  title.textContent = isRegister ? "Register" : "Login";
  usernameGroup.style.display = isRegister ? "block" : "none";
  submitBtn.textContent = isRegister ? "Register" : "Login";
  toggleText.textContent = isRegister ? "Already have an account?" : "Don't have an account?";
  toggleLink.textContent = isRegister ? "Login" : "Register";
  errorMsg.textContent = "";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    if (isRegister) {
      const username = document.getElementById("username").value;
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
      });
      setToken(data.token);
    } else {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
    }
    window.location.href = "/";
  } catch (err) {
    errorMsg.textContent = err.message;
  }
});
