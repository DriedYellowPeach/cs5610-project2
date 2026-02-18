# Frontend Pages

All pages are static HTML served by Express from the `public/` directory. Each page includes a shared navigation bar and uses vanilla ES6 JavaScript modules.

## Pages

### Home (`/` -> `index.html`)

The landing page for the application.

- Hero section with project title and description
- "Play Now" button linking to the game page
- Preview of top 5 leaderboard scores fetched from `/api/scores/leaderboard?limit=5`
- Each player name links to their profile page

**JS:** `js/main.js` - fetches and renders the top scores preview

---

### Login / Register (`/login.html`)

User authentication page with a toggleable form.

- Default view: login form (email + password)
- Toggle link switches to register form (email + username + password)
- On success: stores JWT in `localStorage` and redirects to home page
- On error: displays error message inline
- Redirects to home if already logged in

**JS:** `js/auth.js` - handles form toggle, submit, and token storage

---

### Game (`/game.html`)

The main gameplay page.

- Webcam video preview (requests camera permission on load)
- Game canvas area with live score display
- Start button to begin the game
- Game over overlay with:
  - Final score display
  - "Submit Score" button (only if logged in, calls `POST /api/scores`)
  - "Play Again" button
  - Message prompting login if not authenticated

**JS:** `js/game.js` - webcam init, game loop (currently a placeholder), score submission

**Note:** The game currently runs a placeholder that auto-increments a score. The actual WASM game needs to be integrated by replacing the `startPlaceholderGame()` function.

---

### Leaderboard (`/leaderboard.html`)

Global ranking of all player scores.

- Table with columns: Rank, Player, Score, Date
- Fetches top 20 scores from `/api/scores/leaderboard?limit=20`
- Each player name links to their profile page (`/profile.html?id=<userId>`)
- Current user's rows are highlighted if logged in

**JS:** `js/leaderboard.js` - fetches scores and renders the table

---

### Profile (`/profile.html`)

User profile page, used for both viewing and editing.

- **URL format:** `/profile.html?id=<userId>` or just `/profile.html` for own profile
- Displays: avatar, username, "member since" date
- Top 10 score history table
- **Own profile only:** edit section with:
  - Username input field
  - Avatar picker grid (7 preset SVG avatars)
  - Save button (calls `PUT /api/users/me`)
- Redirects to login if not logged in and no `?id=` provided

**JS:** `js/profile.js` - detects own vs. other profile, fetches data, handles edit form

---

## Shared JavaScript Modules

### `js/api.js`

Shared utility module used by all pages.

| Function            | Description                                                      |
|---------------------|------------------------------------------------------------------|
| `getToken()`        | Returns JWT from `localStorage`                                  |
| `setToken(token)`   | Stores JWT in `localStorage`                                     |
| `removeToken()`     | Removes JWT from `localStorage`                                  |
| `isLoggedIn()`      | Returns `true` if a token exists                                 |
| `getCurrentUser()`  | Decodes JWT payload and returns `{ userId, username }` or `null` |
| `apiFetch(url, opt)`| `fetch` wrapper that auto-attaches `Authorization` header        |

### `js/nav.js`

Dynamically injects the navigation bar into every page.

- Looks for a `<div id="nav"></div>` element in the page
- Renders links: Home, Play, Leaderboard
- If logged in: shows username (links to profile) and Logout button
- If not logged in: shows Login link
- Logout clears token and redirects to home
- Responsive: hamburger toggle on mobile screens

## Styling

All styles are in `css/style.css`. Key sections:

| Section       | What it covers                                            |
|---------------|-----------------------------------------------------------|
| Reset         | Box-sizing, margin/padding reset                          |
| Navbar        | Sticky top nav, dark theme, mobile hamburger menu         |
| Layout        | `.page-container` max-width centering                     |
| Buttons       | `.btn`, `.btn-primary`, `.btn-large` variants             |
| Hero          | Centered hero section on home page                        |
| Tables        | `.leaderboard-table` with header styling and row hover    |
| Forms         | `.form-group` label + input styling with focus state      |
| Auth page     | Centered card layout for login/register                   |
| Game page     | Flexbox game area, canvas, webcam, overlay                |
| Profile page  | Header with avatar, edit section, avatar picker grid      |
| Utility       | `.hidden` class                                           |

## Assets

### Avatars (`assets/avatars/`)

7 preset SVG avatar images:

| File           | Color  |
|----------------|--------|
| `default.svg`  | Gray   |
| `avatar1.svg`  | Blue   |
| `avatar2.svg`  | Green  |
| `avatar3.svg`  | Orange |
| `avatar4.svg`  | Purple |
| `avatar5.svg`  | Red    |
| `avatar6.svg`  | Teal   |
