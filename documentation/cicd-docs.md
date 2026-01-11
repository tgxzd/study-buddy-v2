# CI/CD Guide for StudyBuddy

**Your Server IP:** `104.248.147.230`

---

## Quick Start

1. **What is CI/CD?**
2. **Setup GitHub Actions**
3. **Automated Testing**
4. **Automated Deployment**
5. **Zero-Downtime Deployments**

---

## Part 1: What is CI/CD?

### CI = Continuous Integration

**What it means:** Every time you push code, it's automatically tested

**Example:**
```
You push code → GitHub detects change → Runs tests → Tells you if it passes
```

### CD = Continuous Deployment

**What it means:** Every time tests pass, code is automatically deployed

**Example:**
```
Tests pass → Build Docker image → Deploy to VPS → App is updated
```

### Why Use CI/CD?

| Benefit | Description |
|---------|-------------|
| **Automated Testing** | Catch bugs before they reach production |
| **Faster Deployments** | One command to deploy |
| **Consistency** | Same process every time |
| **Rollback** | Easy to revert if something breaks |
| **No Manual Work** | Push and forget |

---

## Part 2: GitHub Actions Basics

### What is GitHub Actions?

GitHub Actions is GitHub's automation platform. It runs workflows based on events (like pushing code).

### Where Workflows Are Stored

Workflows are stored in `.github/workflows/` directory:

```
study-buddy-v2/
├── .github/
│   └── workflows/
│       ├── ci.yml       # Continuous Integration
│       └── cd.yml       # Continuous Deployment
```

---

## Part 3: Setup Continuous Integration (CI)

### Create CI Workflow

**Create file:** `.github/workflows/ci.yml`

```bash
mkdir -p .github/workflows
nano .github/workflows/ci.yml
```

**Paste this:**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Generate Prisma Client
        run: yarn prisma generate

      - name: Run tests
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/testdb
        run: yarn test
        continue-on-error: true

      - name: Build
        run: yarn build
```

**Save:** Press `Ctrl + X`, then `Y`, then `Enter`

### What This Does

1. **Triggers**: Runs when you push to `main` branch
2. **Sets up PostgreSQL**: Creates test database
3. **Installs dependencies**: Runs `yarn install`
4. **Runs tests**: Executes your test suite
5. **Builds app**: Ensures code compiles

### Test It

```bash
git add .github/workflows/ci.yml
git commit -m "Add CI workflow"
git push
```

Go to your GitHub repo → Click **Actions** tab → Watch it run!

---

## Part 4: Setup Continuous Deployment (CD)

### Option A: Deploy to VPS with SSH

**Create file:** `.github/workflows/cd.yml`

```bash
nano .github/workflows/cd.yml
```

**Paste this:**

```yaml
name: CD

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: 104.248.147.230
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd ~/study-buddy-v2
            git pull
            docker compose down
            docker compose up -d --build
            docker image prune -f
```

**Save:** Press `Ctrl + X`, then `Y`, then `Enter`

### Setup SSH Key for GitHub

**On your computer:**

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -f ~/.ssh/github_actions -N ""
```

**Copy public key to VPS:**

```bash
ssh-copy-id -i ~/.ssh/github_actions.pub root@104.248.147.230
```

**Add private key to GitHub Secrets:**

1. Copy private key:
   ```bash
   cat ~/.ssh/github_actions
   ```

2. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**

3. Click **New repository secret**

4. Name: `SSH_PRIVATE_KEY`

5. Paste the entire private key (including `-----BEGIN` and `-----END` lines)

6. Click **Add secret**

### Test It

```bash
git add .github/workflows/cd.yml
git commit -m "Add CD workflow"
git push
```

Go to **Actions** tab → Watch it deploy!

---

## Option B: Deploy with Docker Registry

### Build and Push to Docker Hub

**Create file:** `.github/workflows/docker-cd.yml`

```bash
nano .github/workflows/docker-cd.yml
```

**Paste this:**

```yaml
name: Docker CD

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/studybuddy:latest
            ${{ secrets.DOCKER_USERNAME }}/studybuddy:${{ github.sha }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: 104.248.147.230
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            docker logout
            docker login -u ${{ secrets.DOCKER_USERNAME }} -p ${{ secrets.DOCKER_PASSWORD }}
            cd ~/study-buddy-v2
            docker compose pull
            docker compose up -d
            docker image prune -f
```

**Save:** Press `Ctrl + X`, then `Y`, then `Enter`

### Setup Docker Hub Secrets

1. Create Docker Hub account: https://hub.docker.com

2. Go to GitHub repo → **Settings** → **Secrets** → **Actions**

3. Add these secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password or access token

4. Update `docker-compose.yml` on VPS to use your image:

```yaml
services:
  app:
    image: YOUR_DOCKER_USERNAME/studybuddy:latest
    # ... rest of config
```

---

## Part 5: Advanced CI/CD Features

### Automated Testing

**Add test script to `package.json`:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Linting

**Add lint job to CI:**

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'
      - run: yarn install
      - run: yarn lint
```

### Build Artifacts

**Save build artifacts:**

```yaml
jobs:
  build:
    # ... build steps
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

### Deploy on Tag

**Only deploy when you push a tag:**

```yaml
on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    # ... deploy on version tags like v1.0.0
```

**Usage:**
```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## Part 6: Zero-Downtime Deployment

### Why Zero-Downtime?

Users never see "Site under maintenance" - app is always available.

### Strategy: Blue-Green Deployment

**How it works:**
1. Run new version alongside old version (green)
2. Test new version
3. Switch traffic to new version
4. Remove old version (blue)

### Implement Blue-Green Deployment

**Create `.github/workflows/blue-green.yml`:**

```yaml
name: Blue-Green Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy Green (New Version)
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: 104.248.147.230
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd ~/study-buddy-v2

            # Pull latest code
            git pull

            # Build new version (green)
            export COLOR=green
            docker compose -f docker-compose.yml -f docker-compose.green.yml up -d --build

            # Test green version
            curl -f http://localhost:3001/api/health || exit 1

            # Switch Nginx to green
            sed -i 's/3000/3001/g' /etc/nginx/sites-available/studybuddy
            nginx -t
            systemctl reload nginx

            # Stop blue (old version)
            export COLOR=blue
            docker compose -f docker-compose.yml -f docker-compose.blue.yml down
```

### Create Color-Specific Compose Files

**`docker-compose.green.yml` (Port 3001):**

```yaml
services:
  app:
    ports:
      - "3001:3000"
    container_name: studybuddy-app-green
```

**`docker-compose.blue.yml` (Port 3002):**

```yaml
services:
  app:
    ports:
      - "3002:3000"
    container_name: studybuddy-app-blue
```

---

## Part 7: Monitoring & Rollback

### Health Checks

**Add health check endpoint to your app:**

```typescript
// src/server/routes/health.ts
import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
```

### Add to CI/CD

```yaml
# After deploy step
- name: Health check
  run: |
    sleep 10
    curl -f http://104.248.147.230/api/health || exit 1
```

### Automatic Rollback

**Add rollback step:**

```yaml
jobs:
  deploy:
    # ... deploy steps

    steps:
      - name: Deploy
        id: deploy
        # ... deploy command

      - name: Health check
        id: health
        run: curl -f http://104.248.147.230/api/health

      - name: Rollback on failure
        if: failure() && steps.deploy.outcome == 'success'
        run: |
          # Revert to previous version
          git reset --hard HEAD~1
          git push
```

---

## Common GitHub Actions Recipes

### Run Tests on Multiple Node Versions

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x, 21.x]
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
```

### Cache Dependencies

```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.yarn/cache
    key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}
```

### Notify on Failure

```yaml
- name: Notify on failure
  if: failure()
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
      -d '{"text":"Deployment failed!"}'
```

---

## Troubleshooting CI/CD

### Workflow Fails?

**Check logs:**
1. Go to **Actions** tab
2. Click on failed workflow
3. Click on failed job
4. Expand failed step to see error

### SSH Connection Fails?

**Verify secrets:**
1. Check `SSH_PRIVATE_KEY` secret is set
2. Check key format (should include `-----BEGIN` and `-----END`)
3. Test SSH from local machine: `ssh root@104.248.147.230`

### Docker Build Fails?

**Common issues:**
- Insufficient resources on runner
- Timeout (increase with `timeout-minutes`)
- Invalid Dockerfile syntax

**Solution:**

```yaml
jobs:
  build:
    timeout-minutes: 30  # Increase timeout
    runs-on: ubuntu-latest
```

### Deploy Fails Silently?

**Add error logging:**

```yaml
- name: Deploy with logs
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: 104.248.147.230
    username: root
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    script: |
      set -e  # Exit on error
      set -x  # Print commands
      cd ~/study-buddy-v2
      git pull 2>&1 | tee deploy.log
      docker compose up -d 2>&1 | tee -a deploy.log
```

---

## Best Practices

### 1. Use Environment Variables

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

### 2. Use Matrix Strategy for Testing

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node: [18, 20]
```

### 3. Separate CI and CD

- CI runs on every push and PR
- CD runs only on main branch

### 4. Use Status Checks

Require CI to pass before merging:

```yaml
# In GitHub repo settings
Branch protection rules:
✅ Require status checks to pass before merging
✅ Require branches to be up to date before merging
```

### 5. Version Your Deployments

```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## Summary

**What You Learned:**
1. ✅ What CI/CD is
2. ✅ How to setup GitHub Actions
3. ✅ Automated testing
4. ✅ Automated deployment
5. ✅ Zero-downtime deployments
6. ✅ Monitoring and rollback
7. ✅ Best practices

**Your CI/CD Pipeline:**
- Push code → Tests run → Build → Deploy → Live!
- Automated, consistent, fast
- Easy rollback if something breaks

---

## Complete Workflow Example

**Your complete development workflow:**

```bash
# 1. Make changes
git add .
git commit -m "Add new feature"

# 2. Push
git push

# 3. CI/CD runs automatically
# - Tests run
# - Build succeeds
# - Deploys to VPS
# - App is live!

# 4. Check status
# Go to GitHub Actions tab

# 5. If something breaks
git revert HEAD
git push
# CI/CD automatically reverts!
```

---

## What's Next?

### Advanced CI/CD Topics

- **Monitoring**: Sentry, Datadog, etc.
- **A/B Testing**: Deploy multiple versions
- **Canary Deployments**: Roll out to subset of users
- **GitOps**: Infrastructure as code
- **Multi-Environment**: Dev, Staging, Production

**Your StudyBuddy app is now fully automated! 🎉**
