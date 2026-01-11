# StudyBuddy Deployment Guide

**Your Server IP:** `104.248.147.230`

---

## Quick Start (3 Simple Steps)

1. **Connect to your server**
2. **Deploy your app**
3. **Setup HTTPS**

---

## Step 1: Connect to Your VPS

### 1.1 Connect via SSH

```bash
ssh root@104.248.147.230
```

**First time?** Type `yes` when prompted

**Using password?** You won't see it typing (normal)

### 1.2 Update Server

```bash
apt update && apt upgrade -y
```

### 1.3 Install Required Software

**Option A: Install Node.js with Docker (Recommended)**

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Pull Node.js 24 LTS image
docker pull node:24-alpine

# Verify Docker and Node.js
docker --version
docker run --rm node:24-alpine node -v  # Should show v24.12.0

# Install other tools
apt install -y git postgresql postgresql-contrib nginx ufw

# Note: Docker handles process management (no PM2 needed!)
```

**Option B: Traditional Node.js Installation (PM2)**

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Install other tools
apt install -y git postgresql postgresql-contrib nginx ufw
npm install -g yarn pm2

# Verify installations
node --version  # Should show v20.x.x
yarn --version
pm2 --version
```

### 1.4 Setup Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 3000
ufw enable
```

Type `y` when prompted.

---

## Step 2: Deploy Your App

### 2.1 Push Code to GitHub (On Your Computer)

```bash
cd c:\Users\aizad\Desktop\project\study-buddy-v2

git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/study-buddy-v2.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username.**

### 2.2 Clone Code on VPS

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/study-buddy-v2.git
cd study-buddy-v2
```

### 2.3 Setup Environment Variables

```bash
nano .env
```

**Paste this:**

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/studybuddy"
JWT_SECRET="your-super-secret-jwt-key"
SESSION_SECRET="your-session-secret"
PORT=3000
NODE_ENV=production
```

**Generate secrets:**
```bash
openssl rand -base64 32  # Use for JWT_SECRET
openssl rand -base64 32  # Use for SESSION_SECRET
```

**Save:** Press `Ctrl + X`, then `Y`, then `Enter`

### 2.4 Setup Database

```bash
# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

**In PostgreSQL console:**

```sql
CREATE DATABASE studybuddy;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE studybuddy TO your_user;
\q
```

**Update your `.env` DATABASE_URL with the actual user/password you created.**

### 2.5 Build and Run

**Option A: Run with Docker (Recommended if you installed Docker)**

> **Note:** Docker already handles process management (auto-restart, logs, etc.). PM2 is NOT needed when using Docker.

```bash
# Install dependencies (using Docker)
docker run --rm -v "$(pwd):/app" -w /app node:24-alpine yarn install

# Generate Prisma Client
docker run --rm -v "$(pwd):/app" -w /app node:24-alpine yarn prisma generate

# Run migrations
docker run --rm -v "$(pwd):/app" -w /app --network host node:24-alpine yarn prisma migrate deploy

# Build app
docker run --rm -v "$(pwd):/app" -w /app node:24-alpine yarn build

# Run with Docker in background
docker run -d \
  --name studybuddy \
  -p 3000:3000 \
  -v "$(pwd):/app" \
  -w /app \
  --restart unless-stopped \
  node:24-alpine \
  yarn start

# View logs
docker logs -f studybuddy
```

**Option B: Run with PM2 (Traditional - Only if using Option B above)**

```bash
# Install dependencies
yarn install

# Generate Prisma Client
yarn prisma generate

# Run migrations
yarn prisma migrate deploy

# Build app
yarn build

# Start with PM2
pm2 start "yarn start" --name "studybuddy"

# Save PM2 config
pm2 save
pm2 startup
# Copy and run the command it shows you
```

### 2.6 Test Your App

Open browser: **http://104.248.147.230:3000**

You should see StudyBuddy!

---

## Step 3: Setup HTTPS with Nginx

### 3.1 Create Nginx Config

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

### 3.2 Enable Site

```bash
ln -s /etc/nginx/sites-available/studybuddy /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

**Test:** http://104.248.147.230 (no :3000 needed!)

### 3.3 Add HTTPS (SSL Certificate)

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/studybuddy-selfsigned.key \
  -out /etc/ssl/certs/studybuddy-selfsigned.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=104.248.147.230"
```

```bash
# Update Nginx config for HTTPS
nano /etc/nginx/sites-available/studybuddy
```

**Replace everything with:**

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name 104.248.147.230;
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl;
    server_name 104.248.147.230;

    ssl_certificate /etc/ssl/certs/studybuddy-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/studybuddy-selfsigned.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

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

### 3.4 Final Test

Open browser: **https://104.248.147.230**

**Note:** You'll see a browser warning - click "Advanced" → "Proceed to 104.248.147.230 (unsafe)"

---

## Update Your App (When You Make Changes)

### On Your Computer:

```bash
git add .
git commit -m "Your changes"
git push
```

### On VPS (if using Docker):

```bash
cd ~/study-buddy-v2
git pull
docker stop studybuddy
docker rm studybuddy
docker run -d \
  --name studybuddy \
  -p 3000:3000 \
  -v "$(pwd):/app" \
  -w /app \
  --restart unless-stopped \
  node:24-alpine \
  yarn start
```

### On VPS (if using PM2 - Traditional only):

```bash
cd ~/study-buddy-v2
git pull
yarn install
yarn build
pm2 restart studybuddy
```

---

## Common Commands

### Docker (if using Docker)

```bash
docker ps                      # See running containers
docker logs studybuddy         # View logs
docker logs -f studybuddy      # Follow logs
docker restart studybuddy      # Restart app
docker stop studybuddy         # Stop app
docker start studybuddy        # Start app
docker exec -it studybuddy sh  # Access container shell
```

### PM2 (if using PM2)

```bash
pm2 list                 # See all running apps
pm2 logs studybuddy      # View logs
pm2 restart studybuddy   # Restart app
pm2 stop studybuddy      # Stop app
```

### Nginx (Web Server)

```bash
nginx -t                        # Test configuration
systemctl restart nginx         # Restart Nginx
systemctl status nginx          # Check status
tail -f /var/log/nginx/error.log  # View error logs
```

### Server

```bash
docker logs studybuddy --lines 50  # View last 50 log lines (Docker)
pm2 logs studybuddy --lines 50     # View last 50 log lines (PM2)
df -h                          # Check disk space
free -h                        # Check memory
top                            # View running processes
```

---

## Troubleshooting

### App not working?

**If using Docker:**
```bash
# Check if container is running
docker ps

# View error logs
docker logs studybuddy

# Restart container
docker restart studybuddy

# Check if port 3000 is being used
lsof -i :3000
```

**If using PM2:**
```bash
# Check if app is running
pm2 list

# View error logs
pm2 logs studybuddy

# Check if port 3000 is being used
lsof -i :3000

# Restart app
pm2 restart studybuddy
```

### Database connection error?

```bash
# Check PostgreSQL is running
systemctl status postgresql

# Start PostgreSQL
systemctl start postgresql

# Check database exists
sudo -u postgres psql -l
```

### Nginx not working?

```bash
# Test Nginx config
nginx -t

# Check Nginx status
systemctl status nginx

# View Nginx error logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

---

## You're Done! 🎉

**Your app is live at:** https://104.248.147.230

---

## What's Next?

### Part 4: Docker (Optional)

Want to learn Docker? It helps with:
- Consistent environments
- Easy deployment
- Better isolation

### Part 5: CI/CD (Optional)

Automate deployment with GitHub Actions:
- Auto-deploy when you push to GitHub
- Run tests automatically
- Zero-downtime deployments

**Let me know when you're ready for Docker or CI/CD!**
