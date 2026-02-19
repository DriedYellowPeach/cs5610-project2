# Deployment Guide

Serve the app at `https://www.driedyellowpeach.us/web-dev-proj2` using Docker on a cloud VM that already has Nginx + HTTPS configured.

## Overview

```
Browser --> Nginx (VM, port 443) --> /web-dev-proj2/ --> Docker app (port 3000)
                                                    --> Docker mongo (internal)
```

Nginx on the VM strips the `/web-dev-proj2/` prefix and proxies to the containerized app, which listens at root `/`.

## 1. Build and Push the Docker Image

On your local machine, build and push to Docker Hub (or GitHub Container Registry).

### Docker Hub

```bash
# Log in once
docker login

# Build and push (replace YOUR_DOCKERHUB_USER)
docker build -t YOUR_DOCKERHUB_USER/cs5610-project2:latest .
docker push YOUR_DOCKERHUB_USER/cs5610-project2:latest
```

### GitHub Container Registry (alternative)

```bash
# Log in with a GitHub PAT that has write:packages scope
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USER --password-stdin

docker build -t ghcr.io/YOUR_GITHUB_USER/cs5610-project2:latest .
docker push ghcr.io/YOUR_GITHUB_USER/cs5610-project2:latest
```

## 2. Create Compose File on the VM

SSH into your VM and create a project directory:

```bash
mkdir -p ~/cs5610-project2 && cd ~/cs5610-project2
```

Create `docker-compose.yml`:

```yaml
services:
  mongo:
    image: mongo:7
    container_name: cs5610-mongo
    restart: unless-stopped
    volumes:
      - mongo-data:/data/db

  app:
    image: YOUR_DOCKERHUB_USER/cs5610-project2:latest
    container_name: cs5610-app
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      - PORT=3000
      - MONGODB_URI=mongodb://mongo:27017/cs5610-project2
      - JWT_SECRET=CHANGE_ME_TO_A_RANDOM_STRING
      - BASE_PATH=/web-dev-proj2
    depends_on:
      - mongo

volumes:
  mongo-data:
```

Generate a JWT secret and replace the placeholder:

```bash
openssl rand -base64 48
```

Notes:
- `127.0.0.1:3000:3000` binds port 3000 to localhost only, so it's only accessible via Nginx, not directly from the internet.
- MongoDB is not exposed to the host at all - only the app container can reach it.

## 3. Add Nginx Location Block on the VM

Edit your existing Nginx site config (likely `/etc/nginx/sites-available/default` or similar):

```bash
sudo nano /etc/nginx/sites-available/default
```

Add this `location` block inside your existing `server { ... }` block that handles `www.driedyellowpeach.us`:

```nginx
location /web-dev-proj2/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

The trailing `/` on `proxy_pass` is critical - it strips the `/web-dev-proj2/` prefix so the app receives requests at root `/`.

Test and reload Nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 4. Start the App

```bash
cd ~/cs5610-project2
docker compose up -d
```

Verify at `https://www.driedyellowpeach.us/web-dev-proj2/`.

## 5. Deploy Updates

When you push a new image version:

```bash
cd ~/cs5610-project2
docker compose pull
docker compose up -d
```

Or as a one-liner:

```bash
cd ~/cs5610-project2 && docker compose pull && docker compose up -d
```

## 6. Common Operations

### View logs

```bash
docker compose logs -f        # all services
docker compose logs -f app    # app only
```

### Restart

```bash
docker compose restart
```

### Stop

```bash
docker compose down
```

### Seed fake data (for testing)

```bash
docker compose exec app node server/seed.js
```

### Back up MongoDB

```bash
docker compose exec mongo mongodump --archive --gzip > backup_$(date +%F).gz
```

### Restore MongoDB

```bash
docker compose exec -T mongo mongorestore --archive --gzip < backup_2026-02-19.gz
```

## How BASE_PATH Works

The `BASE_PATH` environment variable controls the subpath prefix for all frontend URLs. The server dynamically generates `js/config.js` from this variable at runtime - no source code changes needed between environments.

- **Production**: Set `BASE_PATH=/web-dev-proj2` in `docker-compose.yml`. All JS navigation and API calls get prefixed.
- **Local dev**: Don't set `BASE_PATH` (defaults to `""`). The app works at `http://localhost:3000/` with no prefix.
