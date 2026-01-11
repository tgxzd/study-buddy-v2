# Docker Guide for StudyBuddy

**Your Server IP:** `104.248.147.230`

---

## Quick Start

1. **What is Docker?**
2. **Install Docker**
3. **Create Dockerfile**
4. **Build & Run**
5. **Deploy with Docker**

---

## Part 1: What is Docker?

### Analogy: Docker vs Traditional

**Without Docker:**
```
Your App → Needs Node.js, PostgreSQL, specific versions → Works on your machine but breaks on server
```

**With Docker:**
```
Your App → Packaged with everything it needs → Works exactly the same everywhere
```

### Why Use Docker?

| Benefit | Description |
|---------|-------------|
| **Consistency** | Runs the same on your laptop and server |
| **Isolation** | Doesn't interfere with other apps |
| **Easy Setup** | One command to install everything |
| **Scalability** | Easy to run multiple instances |

### Key Concepts

**Image**: Like a recipe (contains everything needed to run your app)

**Container**: Like the cooked meal (running instance of an image)

**Dockerfile**: The instructions to build the image

---

## Part 2: Install Docker

### On Your VPS:

```bash
# Connect to server
ssh root@104.248.147.230

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verify installation
docker --version
# Should show: Docker version 20.x.x or higher

# Install Docker Compose
apt install docker-compose-plugin -y

# Verify
docker compose version
```

---

## Part 3: Create Dockerfile

### What is a Dockerfile?

A Dockerfile is a text file with instructions to build your Docker image.

### Create Dockerfile

**On your local computer**, in your project root (`study-buddy-v2/`):

```bash
# Create Dockerfile
nano Dockerfile
```

**Paste this:**

```dockerfile
# Use Node.js 20 as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy application files
COPY . .

# Generate Prisma Client
RUN yarn prisma generate

# Build the application
RUN yarn build

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]
```

**Save:** Press `Ctrl + X`, then `Y`, then `Enter`

### Create .dockerignore

**Create `.dockerignore` file** (like .gitignore but for Docker):

```bash
nano .dockerignore
```

**Paste this:**

```
node_modules
dist
.git
.env
.env.*
!.env.example
```

**Save:** Press `Ctrl + X`, then `Y`, then `Enter`

---

## Part 4: Docker Compose (Multi-Container Setup)

### Why Docker Compose?

Your app needs multiple things:
- Node.js app
- PostgreSQL database
- (Optional) Redis, etc.

**Docker Compose** runs all these together with one command.

### Create docker-compose.yml

```bash
nano docker-compose.yml
```

**Paste this:**

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: studybuddy-db
    environment:
      POSTGRES_USER: studybuddy
      POSTGRES_PASSWORD: studybuddy_password
      POSTGRES_DB: studybuddy
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U studybuddy"]
      interval: 10s
      timeout: 5s
      retries: 5

  # StudyBuddy App
  app:
    build: .
    container_name: studybuddy-app
    environment:
      DATABASE_URL: "postgresql://studybuddy:studybuddy_password@postgres:5432/studybuddy"
      JWT_SECRET: "your-jwt-secret-change-this"
      SESSION_SECRET: "your-session-secret-change-this"
      PORT: 3000
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
```

**Save:** Press `Ctrl + X`, then `Y`, then `Enter`

---

## Part 5: Build & Run Locally (Testing)

### Build Docker Image

**On your local computer:**

```bash
cd c:\Users\aizad\Desktop\project\study-buddy-v2

# Build the image
docker build -t studybuddy:latest .
```

This will take a few minutes. You'll see output like:
```
[+] Building 45.2s (12/12) FINISHED
=> => naming to: studybuddy:latest
```

### Run with Docker Compose

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Check running containers
docker ps
```

You should see:
```
CONTAINER ID   IMAGE              STATUS
abc123         studybuddy-app     Up 2 minutes
def456         postgres:16-alpine Up 2 minutes
```

### Test Your App

Open browser: **http://localhost:3000**

### Stop Containers

```bash
# Stop all services
docker compose down

# Remove volumes (deletes database data)
docker compose down -v
```

---

## Part 6: Deploy to VPS with Docker

### Push Code to GitHub

```bash
git add Dockerfile docker-compose.yml .dockerignore
git commit -m "Add Docker files"
git push
```

### On VPS: Pull and Run

```bash
# Connect to VPS
ssh root@104.248.147.230

# Navigate to project
cd ~/study-buddy-v2

# Pull latest code
git pull

# Build and start
docker compose up -d --build

# Check status
docker ps
docker compose logs
```

### Test on VPS

Open browser: **http://104.248.147.230:3000**

---

## Part 7: Setup Nginx with Docker

### Update Nginx Configuration

Docker runs on port 3000, Nginx routes to it.

```bash
nano /etc/nginx/sites-available/studybuddy
```

**Paste this:**

```nginx
server {
    listen 80;
    server_name 104.248.147.230;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Save:** Press `Ctrl + X`, then `Y`, then `Enter`

```bash
nginx -t
systemctl restart nginx
```

**Test:** http://104.248.147.230

---

## Common Docker Commands

### Container Management

```bash
docker ps                    # List running containers
docker ps -a                 # List all containers (including stopped)
docker stop <container_id>   # Stop a container
docker start <container_id>  # Start a container
docker rm <container_id>     # Remove a container
docker logs <container_id>   # View container logs
docker exec -it <container_id> sh  # Access container shell
```

### Image Management

```bash
docker images                # List all images
docker rmi <image_id>        # Remove an image
docker build -t <name> .     # Build an image
```

### Docker Compose

```bash
docker compose up -d         # Start all services
docker compose down          # Stop all services
docker compose logs -f       # View logs
docker compose ps            # List services
docker compose restart       # Restart all services
docker compose up -d --build # Rebuild and start
```

---

## Update Your Docker App

### On Your Computer:

```bash
# Make changes to code
git add .
git commit -m "Your changes"
git push
```

### On VPS:

```bash
cd ~/study-buddy-v2
git pull
docker compose down
docker compose up -d --build
```

---

## Troubleshooting

### Container won't start?

```bash
# Check logs
docker compose logs

# Check specific service
docker compose logs app
docker compose logs postgres

# Rebuild without cache
docker compose build --no-cache
docker compose up -d
```

### Database connection error?

```bash
# Check if postgres is running
docker ps | grep postgres

# Check postgres logs
docker compose logs postgres

# Restart postgres
docker compose restart postgres
```

### Port already in use?

```bash
# Check what's using port 3000
lsof -i :3000

# Stop the conflicting service
pm2 stop studybuddy  # If PM2 is running
```

### Out of disk space?

```bash
# Check Docker disk usage
docker system df

# Clean up unused images
docker system prune -a

# Remove all unused containers, networks, images
docker system prune -a --volumes
```

---

## Best Practices

### 1. Use Environment Variables

Never hardcode secrets in Dockerfile. Use environment variables:

```yaml
services:
  app:
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
```

### 2. Use Multi-Stage Builds

For smaller images, use multi-stage builds:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
CMD ["yarn", "start"]
```

### 3. Health Checks

Add health checks to your services:

```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## Summary

**What You Learned:**
1. ✅ What Docker is and why use it
2. ✅ How to install Docker
3. ✅ How to create a Dockerfile
4. ✅ How to use Docker Compose
5. ✅ How to deploy with Docker
6. ✅ Common commands and troubleshooting

**Your Dockerized App:**
- Runs in containers
- Isolated from host
- Easy to deploy
- Consistent across environments

---

## What's Next?

### CI/CD (cicd-docs.md)

Automate your Docker deployment:
- Build Docker images on push
- Push to Docker registry
- Auto-deploy to VPS
- Zero-downtime deployments

**Check out [cicd-docs.md](cicd-docs.md) for CI/CD setup!**
