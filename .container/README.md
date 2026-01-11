# Docker Deployment for StudyBuddy

This folder contains Docker configuration files for deploying StudyBuddy.

## Quick Setup

### Step 1: Create Environment File

```bash
cd .container
cp .env.example .env
```

### Step 2: Generate Secure Secrets

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate SESSION_SECRET
openssl rand -base64 32
```

### Step 3: Update `.env` File

Edit `.env` and replace the placeholder values:

```env
# PostgreSQL Configuration
POSTGRES_USER=studybuddy
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD_HERE
POSTGRES_DB=studybuddy
POSTGRES_PORT=5432

# App Secrets (paste the generated secrets here)
JWT_SECRET=PASTE_YOUR_GENERATED_JWT_SECRET_HERE
SESSION_SECRET=PASTE_YOUR_GENERATED_SESSION_SECRET_HERE

# App Configuration
PORT=3000
NODE_ENV=production
```

**Important:**
- Replace `YOUR_SECURE_PASSWORD_HERE` with a strong password
- Replace JWT_SECRET and SESSION_SECRET with the values generated above

### Step 4: Start Docker

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f
```

### Step 5: Check Status

```bash
# Check running containers
docker compose ps

# Expected output:
# NAME              STATUS
# studybuddy-app    Up (healthy)
# studybuddy-db     Up (healthy)
```

---

## How It Works

### Environment Variables Flow

```
.env file (you create)
    ↓
docker-compose.yml reads it
    ↓
Passes to containers
    ↓
App uses the values
```

### File Structure

```
.container/
├── docker-compose.yml  ← Reads variables from .env
├── .env.example       ← Template (safe to commit)
├── .env               ← Your actual secrets (NEVER commit)
└── README.md          ← This file
```

---

## Access Your App

Once running:
- **App**: http://localhost:3000 (local) or http://YOUR_IP:3000 (VPS)
- **Database**: Runs inside Docker network, accessible by app container

---

## Common Commands

### Start Services

```bash
docker compose up -d
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f postgres
```

### Stop Services

```bash
docker compose down
```

### Rebuild After Code Changes

```bash
docker compose down
docker compose up -d --build
```

### Check Container Status

```bash
docker compose ps
```

### Access Container Shell

```bash
# App container
docker exec -it studybuddy-app sh

# Database container
docker exec -it studybuddy-db sh
```

---

## Troubleshooting

### "Can't connect to database" error

**Problem:** App starts before database is ready

**Solution:**
```bash
# Check if postgres is healthy
docker compose ps

# Wait a few seconds, then check app logs
docker compose logs app
```

### Port already in use

**Problem:** Port 3000 or 5432 already used

**Solution:** Change ports in `.env`:
```env
PORT=3001           # Change app port
POSTGRES_PORT=5433  # Change database port
```

### Permission denied

**Problem:** Can't write to volumes

**Solution:**
```bash
# Stop services
docker compose down

# Remove volumes (WARNING: deletes data)
docker compose down -v

# Start fresh
docker compose up -d
```

### Out of disk space

**Problem:** Docker images taking too much space

**Solution:**
```bash
# Clean up unused images
docker image prune -a

# Remove all unused containers, networks, images
docker system prune -a --volumes
```

---

## Updating Your App

When you push code changes:

```bash
# Pull latest code
git pull

# Rebuild and restart
cd .container
docker compose down
docker compose up -d --build
```

---

## Production Deployment

### On VPS (104.248.147.230)

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/study-buddy-v2.git
cd study-buddy-v2/.container

# Create .env file
cp .env.example .env
nano .env  # Edit with your values

# Start services
docker compose up -d --build
```

### With Nginx (HTTPS)

See [DEPLOYMENT.md](../documentation/DEPLOYMENT.md) for setting up Nginx with HTTPS.

Nginx proxies requests to the Docker container:
```
User → Nginx (443) → Docker App (3000)
```

---

## Data Persistence

Database data is stored in a Docker volume named `postgres_data`.

### Backup Database

```bash
# Backup to file
docker exec studybuddy-db pg_dump -U studybuddy studybuddy > backup.sql

# Restore from file
cat backup.sql | docker exec -i studybuddy-db psql -U studybuddy studybuddy
```

### Backup Volume

```bash
# Backup entire volume
docker run --rm \
  -v studybuddy_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz /data
```

---

## Security Checklist

### Before Deploying to Production

- [ ] Changed default `POSTGRES_PASSWORD`
- [ ] Generated secure `JWT_SECRET` (32+ characters)
- [ ] Generated secure `SESSION_SECRET` (32+ characters)
- [ ] `.env` file is NOT committed to Git
- [ ] Firewall configured (UFW)
- [ ] Nginx setup with HTTPS
- [ ] Regular backups configured

---

## CI/CD Integration

When using GitHub Actions CI/CD:

1. **Create GitHub Secret** named `ENV_FILE` with your `.env` contents
2. **CI/CD will:**
   - Create `.env` file on VPS
   - Run `docker compose up -d --build`
   - Restart services automatically

See [../.github/workflows/cd.yml](../.github/workflows/cd.yml) for details.

---

## Summary

**What you need to do:**

1. Copy `.env.example` to `.env`
2. Generate secure secrets
3. Update `.env` with your values
4. Run `docker compose up -d`

**That's it!** Your app will be running with:
- PostgreSQL database
- Auto-restart on failure
- Persistent data storage
- Isolated environment

**For questions, see:**
- [docker-docs.md](../documentation/docker-docs.md) - Complete Docker guide
- [cicd-docs.md](../documentation/cicd-docs.md) - CI/CD automation
- [DEPLOYMENT.md](../documentation/DEPLOYMENT.md) - Full deployment guide
