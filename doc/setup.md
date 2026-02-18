# Setup Guide

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [Node.js](https://nodejs.org/) v18+ (only needed for local development without Docker)

## Installation

### Option 1: Docker (Recommended)

Clone the repository and start everything:

```bash
git clone <repo-url>
cd cs5610-project2
docker compose up -d
```

This builds the Node app image and starts both the MongoDB and Node containers. The app is available at http://localhost:3000.

### Option 2: Local Node + Docker MongoDB

Use Docker only for MongoDB, run Node directly on your machine:

```bash
git clone <repo-url>
cd cs5610-project2
docker compose up -d mongo    # start only MongoDB
npm install                   # install Node dependencies
```

## Environment Variables

When running via `docker compose up`, environment variables are configured in `docker-compose.yml`. No `.env` file is needed.

When running Node locally, the `.env` file is used:

| Variable       | Default                                         | Description                     |
|----------------|--------------------------------------------------|----------------------------------|
| `PORT`         | `3000`                                           | Port the server listens on       |
| `MONGODB_URI`  | `mongodb://localhost:27017/cs5610-project2`      | MongoDB connection string        |
| `JWT_SECRET`   | `change-this-to-a-random-secret`                 | Secret key for signing JWT tokens|

## Common Commands

### Docker Compose

| Command                        | Description                                          |
|--------------------------------|------------------------------------------------------|
| `docker compose up -d`         | Start all services (MongoDB + Node app) in background|
| `docker compose down`          | Stop all services                                    |
| `docker compose down -v`       | Stop all services and delete database data           |
| `docker compose logs -f`       | Follow logs from all services                        |
| `docker compose logs -f app`   | Follow logs from the Node app only                   |
| `docker compose logs -f mongo` | Follow logs from MongoDB only                        |
| `docker compose watch`         | Start with file watching (auto-sync on changes)      |
| `docker compose build`         | Rebuild the Node app image                           |
| `docker compose restart app`   | Restart just the Node app                            |
| `docker compose up -d mongo`   | Start only MongoDB                                   |

### npm

| Command         | Description                                              |
|-----------------|----------------------------------------------------------|
| `npm install`   | Install dependencies                                     |
| `npm start`     | Start the server                                         |
| `npm run dev`   | Start the server with auto-reload on file changes        |

### Docker Troubleshooting

**Permission denied on `docker.sock`:**

```bash
sudo usermod -aG docker $USER
newgrp docker
```

**Start the Docker daemon:**

```bash
sudo systemctl start docker
sudo systemctl enable docker   # auto-start on boot
```

**Rebuild after changing `package.json` or `Dockerfile`:**

```bash
docker compose up -d --build
```
