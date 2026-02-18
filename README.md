# Facial Expression Control Game and Leaderboard

A web platform that serves a Flappy Bird-style game controlled by facial expressions. Features user accounts, a global leaderboard, and user profiles with customizable avatars.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)

## Quick Start

Start everything (MongoDB + Node server) with one command:

```bash
docker compose up -d
```

Open http://localhost:3000

### Development with File Watching

To auto-sync file changes into the running container:

```bash
docker compose watch
```

This watches `server/` and `public/` for changes and syncs them into the container automatically.

### Stop

```bash
docker compose down
```

Stop and delete all data:

```bash
docker compose down -v
```

### Run Without Docker (alternative)

If you prefer running Node locally:

```bash
docker compose up -d mongo    # start only MongoDB
npm install
npm run dev                   # start Node server with auto-reload
```

## Project Structure

```
├── server/                 # Backend
│   ├── index.js            # Express entry point
│   ├── db/connection.js    # MongoDB connection
│   ├── middleware/auth.js   # JWT auth middleware
│   └── routes/
│       ├── auth.js         # /api/auth   (register, login, me)
│       ├── scores.js       # /api/scores (submit, leaderboard, my scores)
│       └── users.js        # /api/users  (profile, update, user scores)
├── public/                 # Frontend (served as static files)
│   ├── index.html          # Home page
│   ├── login.html          # Login / Register
│   ├── game.html           # Game page
│   ├── leaderboard.html    # Leaderboard
│   ├── profile.html        # User profile
│   ├── css/style.css       # Styles
│   ├── js/                 # Client-side JavaScript
│   └── assets/             # Avatars, WASM files
├── Dockerfile              # Node app container
├── docker-compose.yml      # Full stack (MongoDB + Node app)
├── package.json
└── .env                    # Environment variables
```

## API Endpoints

| Method | Endpoint                 | Auth     | Description                |
|--------|--------------------------|----------|----------------------------|
| POST   | `/api/auth/register`     | No       | Register a new account     |
| POST   | `/api/auth/login`        | No       | Login                      |
| GET    | `/api/auth/me`           | Required | Get current user info      |
| POST   | `/api/scores`            | Required | Submit a score             |
| GET    | `/api/scores/me`         | Required | Get my scores              |
| GET    | `/api/scores/leaderboard`| No       | Get top scores             |
| GET    | `/api/users/:id`         | No       | Get user profile           |
| PUT    | `/api/users/me`          | Required | Update own profile         |
| GET    | `/api/users/:id/scores`  | No       | Get a user's scores        |

## Documentation

- [Setup Guide](doc/setup.md) - installation, environment variables, all commands
- [API Reference](doc/api.md) - backend endpoints, request/response formats, database schema
- [Frontend Guide](doc/frontend.md) - pages, shared JS modules, styling, assets

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB native driver
- **Frontend**: Vanilla ES6 JavaScript, HTML5, CSS3
- **Auth**: JWT (jsonwebtoken), bcrypt
- **Database**: MongoDB 7 (Docker)
