# Complete Project Documentation

This documentation serves as a complete reference for building full-stack applications with authentication, database, Docker deployment, and CI/CD. Uses framework TanStack Router with Express.js backend.

---

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Authentication System](#authentication-system)
5. [Database Design](#database-design)
6. [Docker Setup](#docker-setup)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Deployment Guide](#deployment-guide)
9. [File Structure](#file-structure)
10. [Common Patterns](#common-patterns)
11. [Implemented Features](#implemented-features)

---

## Project Overview

### Purpose
Build a scalable, production-ready web application with:
- User authentication (JWT + HTTP-only cookies)
- Database management with Prisma ORM
- Docker containerization
- CI/CD automation
- Production deployment (VPS + Cloudflare)

### Core Features Implemented
- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Protected routes
- ✅ Study groups with **dual joining system**
- ✅ Invite code generation (instant join)
- ✅ Group search by name (request-based join)
- ✅ Join request approval system
- ✅ File sharing with database storage
- ✅ Dashboard with statistics
- ✅ Database migrations
- ✅ Docker multi-stage builds

### Key Innovation: Dual Joining System

The application implements **two distinct methods** for joining study groups:

1. **Invite Code (Instant Join)**
   - 6-character unique code generated per group
   - Only visible to group owner
   - Users enter code → instantly added to group
   - No approval needed
   - Perfect for trusted invitations

2. **Search & Request (Approval-Based)**
   - Search groups by name (case-insensitive)
   - Send join request to group owner
   - Owner reviews and accepts/declines
   - Pending request tracking
   - Perfect for public/group discovery

---

## Tech Stack

### Current Stack (TanStack Router + Express)

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TanStack Router, Tailwind CSS v4 |
| **Backend** | Express.js, JWT, Multer |
| **Database** | PostgreSQL 16, Prisma ORM |
| **Auth** | JWT, HTTP-only cookies, bcryptjs |
| **Validation** | Zod |
| **Deployment** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions |
| **Hosting** | DigitalOcean Droplets, Cloudflare |

---

## Architecture

### Explore the Project Structure First

Before building your project, explore this codebase to understand the patterns and architecture.

### Current File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx          # Reusable button component
│   │   ├── Card.tsx            # Glass-morphism card component
│   │   └── Input.tsx           # Form input component
│   └── layout/
│       └── Navbar.tsx          # Main navigation bar
├── routes/
│   ├── __root.tsx              # Root layout with providers
│   ├── index.tsx               # Landing page
│   ├── dashboard.tsx           # Dashboard with stats
│   ├── auth/
│   │   ├── register.tsx        # User registration
│   │   └── login.tsx           # User login
│   └── groups/
│       ├── index.tsx           # Groups list + dual join system
│       ├── create.tsx          # Create new group
│       ├── $id.tsx             # Group details + invite code display
│       ├── $id.edit.tsx        # Edit group (owner only)
│       ├── $id.files.tsx       # File management
│       └── $id.requests.tsx    # Join requests (owner only)
├── server/
│   ├── config/
│   │   └── database.ts         # Prisma client singleton
│   ├── routes/
│   │   ├── auth.ts             # Auth endpoints
│   │   ├── groups.ts           # Group endpoints + dual join
│   │   ├── files.ts            # File upload/download
│   │   └── dashboard.ts        # Stats endpoint
│   ├── services/
│   │   ├── authService.ts      # Auth business logic
│   │   ├── groupService.ts     # Group operations + invite code
│   │   ├── joinRequestService.ts  # Join request logic
│   │   └── fileService.ts      # File operations
│   ├── middleware/
│   │   ├── authMiddleware.ts   # JWT verification
│   │   ├── errorHandler.ts     # Central error handling
│   │   └── requestLogger.ts    # Request logging
│   ├── utils/
│   │   ├── password.ts         # Hashing utilities
│   │   └── validation.ts       # Zod schemas
│   └── index.ts                # Express app setup
├── lib/
│   └── api.ts                  # Centralized API client
├── contexts/
│   └── AuthContext.tsx         # Auth state management
└── styles/
    └── globals.css             # Tailwind + custom styles
```

### Architecture Pattern

```
┌─────────────────────────────────────────────┐
│              Frontend (React 19)            │
│         TanStack Router + Vite              │
└──────────────┬──────────────────────────────┘
               │ HTTP Requests
┌──────────────▼──────────────────────────────┐
│         Backend (Express.js)                │
│    ┌─────────────────────────────────┐     │
│    │  JWT Middleware                 │     │
│    │  (Protected Routes)             │     │
│    └──────────────┬──────────────────┘     │
│                   │                         │
│    ┌──────────────▼──────────────────┐     │
│    │  Route Handlers                 │     │
│    │  - Auth Routes                   │     │
│    │  - Group Routes                  │     │
│    │  - File Routes                   │     │
│    └──────────────┬──────────────────┘     │
│                   │                         │
│    ┌──────────────▼──────────────────┐     │
│    │  Service Layer                  │     │
│    │  - Business Logic                │     │
│    │  - Validation                    │     │
│    │  - Data Transformation            │     │
│    └──────────────┬──────────────────┘     │
└───────────────────┼─────────────────────────┘
                    │ Prisma ORM
┌───────────────────▼─────────────────────────┐
│         PostgreSQL Database                 │
│  - Users                                     │
│  - StudyGroups (+ Invite Codes)             │
│  - GroupMembers                              │
│  - GroupJoinRequests                        │
│  - Files                                     │
└─────────────────────────────────────────────┘
```

---

## Authentication System

### Design

```
┌─────────────┐
│  User       │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Frontend Form (Login/Register)     │
└──────┬──────────────────────────────┘
       │ POST /api/auth/login or /register
       ▼
┌─────────────────────────────────────┐
│  Express Route Handler             │
│  - Validate input (Zod)             │
│  - Check user exists                │
│  - Hash password (bcrypt)           │
│  - Generate JWT                     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Set HTTP-only Cookie               │
│  - jwt token (7 days expiry)        │
│  - HttpOnly flag (XSS protection)   │
│  - Secure flag (HTTPS only)         │
│  - SameSite flag (CSRF protection)  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Subsequent Requests                │
│  - Cookie sent automatically        │
│  - Middleware verifies JWT          │
│  - User attached to request         │
└─────────────────────────────────────┘
```

### Implementation Files

**Server-side:**

```typescript
// src/server/config/jwt.ts
export async function generateToken(payload: JWTPayload): Promise<string>
export async function verifyToken(token: string): Promise<JWTPayload | null>

// src/server/utils/password.ts
export async function hashPassword(password: string): Promise<string>
export async function verifyPassword(password: string, hash: string): Promise<boolean>

// src/server/services/authService.ts
export async function registerUser(data: RegisterInput): Promise<User>
export async function loginUser(email: string, password: string): Promise<User | null>
```

**Route handler example:**

```typescript
// src/server/routes/auth.ts
router.post('/login', asyncHandler(async (req: AuthRequest, res) => {
  const { loginSchema } = await import('../utils/validation')
  const { loginUser } = await import('../services/authService')
  const { generateToken } = await import('../config/jwt')

  const validatedData = loginSchema.parse(req.body)
  const user = await loginUser(validatedData.email, validatedData.password)

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = await generateToken({ userId: user.id, email: user.email })

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })

  res.json({ user: { id: user.id, name: user.name, email: user.email } })
}))
```

### Middleware Protection

```typescript
// src/server/middleware/authMiddleware.ts
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  req.user = payload
  next()
}
```

---

## Database Design

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums
enum UserRole {
  STUDENT
  ADMIN
}

enum JoinRequestStatus {
  PENDING
  ACCEPTED
  REJECTED
}

// Models
model User {
  id             String             @id @default(cuid())
  name           String
  email          String             @unique
  password       String
  role           UserRole           @default(STUDENT)
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt

  // Relations
  ownedGroups      StudyGroup[]        @relation("GroupOwner")
  memberships      GroupMember[]
  joinRequests     GroupJoinRequest[]
  uploadedFiles    File[]
  chatMessages     ChatMessage[]
  createdSessions  StudySession[]
}

model StudyGroup {
  id          String             @id @default(cuid())
  name        String
  description String?
  inviteCode  String             @unique  // NEW: 6-character invite code
  ownerId     String
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  // Relations
  owner        User                @relation("GroupOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  members      GroupMember[]
  joinRequests GroupJoinRequest[]
  files        File[]
  sessions     StudySession[]
  chatMessages ChatMessage[]
}

model GroupMember {
  id        String   @id @default(cuid())
  userId    String
  groupId   String
  joinedAt  DateTime @default(now())

  // Unique constraint
  @@unique([userId, groupId])

  // Relations
  user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  group StudyGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
}

model GroupJoinRequest {
  id        String             @id @default(cuid())
  userId    String
  groupId   String
  status    JoinRequestStatus  @default(PENDING)
  createdAt DateTime           @default(now())
  updatedAt DateTime           @updatedAt

  // Unique constraint
  @@unique([userId, groupId])

  // Relations
  user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  group StudyGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
}

model File {
  id         String   @id @default(cuid())
  filename   String
  data       Bytes    // Store file data as bytes (Base64 encoding) - Phase 1
  size       Int      // File size in bytes
  mimeType   String   // e.g., "application/pdf", "image/jpeg"
  groupId    String
  uploaderId String
  createdAt  DateTime @default(now())

  // Index for faster queries
  @@index([groupId])

  // Relations
  group    StudyGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  uploader User       @relation(fields: [uploaderId], references: [id], onDelete: Cascade)
}

// File Storage Strategy:
// Phase 1 (Current): Store files directly in database as Bytes (Base64 encoded)
//   - Size limit: 5MB per file (PostgreSQL limitation)
//   - Simple implementation, no external services
//   - Good for MVP and small-scale applications
//
// Phase 2 (Future): Migrate to AWS S3 or similar object storage
//   - Replace `data` field with `url` field (String)
//   - Store S3 URLs instead of file bytes
//   - Support larger files
//   - Better for production scale

model StudySession {
  id          String   @id @default(cuid())
  title       String
  description String?
  date        DateTime
  link        String?
  location    String?
  groupId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  group StudyGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
}

model ChatMessage {
  id        String   @id @default(cuid())
  content   String
  userId    String
  groupId   String
  createdAt DateTime @default(now())

  // Relations
  user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  group StudyGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
}
```

### Migration Strategy

**Development:**
```bash
# Create migration
yarn prisma migrate dev --name describe_your_change

# Reset database (destructive)
yarn prisma migrate reset
```

**Production:**
```bash
# Deploy migrations
yarn prisma migrate deploy
```

**Docker:**
```bash
# Development uses db push
yarn prisma db push --skip-generate

# Production uses migrate deploy
yarn prisma migrate deploy
```

---

## Docker Setup

### Multi-Stage Dockerfile

```dockerfile
# .container/Dockerfile

# =============================================================================
# Build Stage - Compile the application
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# =============================================================================
# Production Stage - Minimal runtime image
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache openssl

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 node

# Copy from builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public

# Set ownership
RUN chown -R node:nodejs /app

# Switch to non-root user
USER node

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/server/index.js"]
```

### Shell Scripts

**1-start-dev.sh - Development**
```bash
#!/bin/sh
set -e

echo "Waiting for database..."
until pg_isready -q "$DATABASE_HOST" 2>/dev/null; do
  sleep 1
done

yarn prisma generate
yarn prisma db push --skip-generate
exec yarn dev
```

**2-start-prod.sh - Production**
```bash
#!/bin/sh
set -e

echo "Waiting for database..."
until pg_isready -q "$DATABASE_HOST" 2>/dev/null; do
  sleep 1
done

yarn prisma generate
yarn prisma migrate deploy
exec yarn start
```

### Docker Compose Files

**Development (docker-compose.dev.yml):**
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-studybuddy}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-devpassword}
      POSTGRES_DB: ${POSTGRES_DB:-studybuddy}
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-studybuddy}"]
      interval: 5s
      timeout: 3s
      retries: 5

  app:
    build:
      context: ..
      dockerfile: .container/Dockerfile
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://...@postgres:5432/...
      DATABASE_HOST: postgres
    ports:
      - "3000:3000"
    volumes:
      - ../src:/app/src           # Hot reload
      - ../prisma:/app/prisma     # Schema changes
    depends_on:
      postgres:
        condition: service_healthy
    command: ["sh", "-c", "yarn prisma db push --skip-generate && yarn dev"]
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**CI Pipeline (.github/workflows/ci.yml):**
```yaml
name: CI

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

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
        continue-on-error: true

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'
      - run: yarn install
      - run: yarn prisma generate
      - run: yarn typecheck

  build:
    runs-on: ubuntu-latest
    needs: [typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'
      - run: yarn install
      - run: yarn prisma generate
      - run: yarn build
        env:
          NODE_ENV: production
```

---

## Deployment Guide

### DigitalOcean + Cloudflare

#### 1. DigitalOcean Setup

**Create Droplet:**
- OS: Ubuntu 22.04 or 24.04 LTS
- Plan: Basic ($6-12/month for starting)
- Region: Closest to your users
- Authentication: SSH Keys

**Initial Server Setup:**
```bash
# Connect to server
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Create user
adduser username
usermod -aG sudo username

# Install Docker
curl -fsSL https://get.docker.com | sh
apt install docker-compose -y
usermod -aG docker username
```

**Deploy Application:**
```bash
# Clone repository
git clone https://github.com/username/repo.git
cd repo

# Create environment file
cp .env.example .env
nano .env  # Edit with production values

# Start application
docker-compose up -d
```

#### 2. Cloudflare Setup

**Add Domain:**
1. Add domain to Cloudflare
2. Update nameservers at registrar
3. Wait for propagation

**DNS Records:**
| Type | Name | Content | Proxy |
|------|------|---------|--------|
| A | @ | Droplet IP | ✅ Yes |
| A | www | Droplet IP | ✅ Yes |

**SSL/TLS:**
- Mode: Full (strict)

**Page Rules (Optional):**
- Cache static assets
- Auto HTTPS rewrite

---

## File Structure Reference

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `vite.config.ts` | Vite bundler config |
| `.gitignore` | Git exclusions |
| `.dockerignore` | Docker build exclusions |
| `.env` | Environment variables (local) |
| `.env.example` | Environment template |

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/routes/` | Route handlers (pages) |
| `src/components/` | React components |
| `src/server/` | Backend code |
| `prisma/` | Database schema and migrations |

---

## Common Patterns

### Service Layer Pattern

```typescript
// src/server/services/groupService.ts
export async function createGroup(data: CreateGroupInput, ownerId: string) {
  // Generate unique invite code
  let inviteCode = generateInviteCode()
  let codeExists = await prisma.studyGroup.findUnique({ where: { inviteCode } })

  while (codeExists) {
    inviteCode = generateInviteCode()
    codeExists = await prisma.studyGroup.findUnique({ where: { inviteCode } })
  }

  const group = await prisma.studyGroup.create({
    data: {
      name: data.name,
      description: data.description,
      inviteCode,
      ownerId,
      members: {
        create: { userId: ownerId },
      },
    },
    include: { owner: true, members: true, _count: true },
  })

  return group
}
```

### Validation Pattern

```typescript
// src/server/utils/validation.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});
```

### API Client Pattern

```typescript
// src/lib/api.ts
export const groupsApi = {
  list: () => apiRequest<{ groups: any[] }>('/groups'),

  create: (data: { name: string; description?: string }) =>
    apiRequest<{ group: any }>('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  joinByCode: (code: string) =>
    apiRequest<{ message: string; groupId: string }>('/groups/join-by-code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  search: (query: string) =>
    apiRequest<{ groups: any[] }>(`/groups/search?q=${encodeURIComponent(query)}`),
}
```

### File Upload Pattern

**Service Layer:**
```typescript
// src/server/services/fileService.ts
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
const ALLOWED_TYPES = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg', 'image/png', 'text/plain']

export async function uploadFile(file: File, groupId: string, uploaderId: string) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 5MB limit')
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('File type not allowed')
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return prisma.file.create({
    data: {
      filename: file.name,
      data: buffer,
      size: file.size,
      mimeType: file.type,
      groupId,
      uploaderId,
    },
  })
}
```

---

## Implemented Features

### ✅ Phase 1: Authentication (COMPLETE)

**Backend:**
- JWT token generation and verification
- Password hashing with bcryptjs (salt rounds: 10)
- HTTP-only cookie management
- Protected route middleware

**Frontend:**
- Login page with form validation
- Registration page
- Auth context for state management
- Protected route wrapper component

**API Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

---

### ✅ Phase 2: Study Groups (COMPLETE)

**Backend:**
- Group CRUD operations
- Invite code generation (6-character, unique)
- Member management
- Owner permissions

**Frontend:**
- Groups list page with tabbed interface
- Create group page
- Group detail page
- Edit group page (owner only)

**API Endpoints:**
- `GET /api/groups` - List user's groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group details
- `PATCH /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

---

### ✅ Phase 2.5: Dual Group Joining System (COMPLETE)

#### Method 1: Invite Code (Instant Join)

**How it works:**
1. Each group gets a unique 6-character code on creation
2. Code only visible to group owner on group detail page
3. Users enter code → instantly added to group
4. No approval needed

**Implementation:**

```typescript
// Invite Code Generation
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No I, 1, O, 0
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Join by Code Endpoint
router.post('/join-by-code', asyncHandler(async (req: AuthRequest, res) => {
  const { getGroupByInviteCode, addGroupMember } = await import('../services/groupService')

  const { code } = req.body
  const group = await getGroupByInviteCode(code)

  if (!group) {
    return res.status(404).json({ error: 'Invalid invite code' })
  }

  const isMember = group.members.some((m) => m.user.id === req.user!.id)
  if (isMember) {
    return res.status(400).json({ error: 'You are already a member' })
  }

  // Auto-join - add directly without request
  await addGroupMember(group.id, req.user!.id)

  res.json({ message: 'Successfully joined!', groupId: group.id })
}))
```

**UI Components:**
- Invite code display card (owner only)
- Copy to clipboard button
- Invite code input field (6 characters, auto-uppercase)

#### Method 2: Search & Request (Approval-Based)

**How it works:**
1. Users search groups by name (case-insensitive)
2. System returns matching groups (max 20)
3. User clicks "Request to Join"
4. Request created (PENDING status)
5. Owner sees pending count badge
6. Owner accepts/declines requests

**Implementation:**

```typescript
// Search Endpoint
router.get('/search', asyncHandler(async (req: AuthRequest, res) => {
  const { prisma } = await import('../config/database')
  const query = req.query.q as string

  const groups = await prisma.studyGroup.findMany({
    where: {
      name: {
        contains: query.trim(),
        mode: 'insensitive',
      },
    },
    include: {
      owner: { select: { name: true } },
      _count: { select: { members: true } },
    },
    take: 20,
  })

  res.json({ groups })
}))

// Join Request Endpoints
router.post('/:id/join', asyncHandler(async (req: AuthRequest, res) => {
  const { createJoinRequest } = await import('../services/joinRequestService')
  const request = await createJoinRequest(req.params.id, req.user!.id)
  res.status(201).json({ request })
}))

router.post('/:id/requests/handle', asyncHandler(async (req: AuthRequest, res) => {
  const { acceptJoinRequest, rejectJoinRequest } = await import('../services/joinRequestService')

  if (validatedData.action === 'accept') {
    const request = await acceptJoinRequest(validatedData.requestId, req.user!.id)
    res.json({ request })
  } else {
    const request = await rejectJoinRequest(validatedData.requestId, req.user!.id)
    res.json({ request })
  }
}))
```

**UI Components:**
- Tab-based interface ("My Groups" vs "Browse & Join")
- Search input with icon
- Group cards with "Request to Join" buttons
- Pending request indicators
- Accept/Decline buttons (owner only)

---

### ✅ Phase 3: File Sharing (COMPLETE)

**Backend:**
- File upload with Multer (memory storage)
- File validation (size: 5MB, types: pdf, docx, jpg, png, txt)
- Database storage (PostgreSQL Bytes type)
- File download with proper MIME type
- File deletion (uploader/owner)

**Frontend:**
- File upload component
- File list display
- Download buttons
- Delete buttons (with permissions)
- File type icons

**API Endpoints:**
- `POST /api/files/upload` - Upload file
- `GET /api/files/group/:groupId` - List group files
- `GET /api/files/:id/download` - Download file
- `DELETE /api/files/:id` - Delete file

---

### ✅ Dashboard (COMPLETE)

**Backend:**
- Statistics calculation
- Group count
- File count
- Session count

**Frontend:**
- Stats cards with icons
- Quick action buttons
- Getting started guide

**API Endpoints:**
- `GET /api/dashboard/stats` - Get user statistics

---

## Environment Variables

### Environment File Example

See `.env.example` for the complete template. Copy it to create your local environment:

```bash
cp .env.example .env
```

### PostgreSQL Connection String Format

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public
```

| Component | Description | Example |
|-----------|-------------|---------|
| `postgresql://` | Scheme (protocol) | Required |
| `USERNAME` | Database user | `studybuddy` |
| `PASSWORD` | Database password | Generated secret |
| `HOST` | Database host | `localhost` (local) or `postgres` (Docker) |
| `PORT` | Database port | `5432` (default) |
| `DATABASE` | Database name | `studybuddy` |
| `schema=public` | PostgreSQL schema | Default schema |

**Examples:**

```bash
# Local development
DATABASE_URL=postgresql://studybuddy:password@localhost:5432/studybuddy?schema=public

# Docker (internal network)
DATABASE_URL=postgresql://studybuddy:password@postgres:5432/studybuddy?schema=public

# Production (remote server)
DATABASE_URL=postgresql://db_user:secret_password@db.example.com:5432/production_db?schema=public
```

### Key Variables

| Variable | Purpose | Generate With |
|----------|---------|---------------|
| `DATABASE_URL` | PostgreSQL connection string | Manual setup |
| `JWT_SECRET` | JWT token signing | `openssl rand -base64 32` |
| `SESSION_SECRET` | Session encryption | `openssl rand -base64 32` |
| `POSTGRES_PASSWORD` | Database password | `openssl rand -base64 16` |

---

## Useful Commands

### Development
```bash
yarn dev                    # Start dev server
yarn build                  # Build for production
yarn start                  # Start production server
yarn typecheck              # Type check
```

### Database
```bash
yarn prisma generate        # Generate Prisma Client
yarn prisma migrate dev     # Create migration
yarn prisma migrate deploy  # Deploy migrations
yarn prisma studio          # Open Prisma Studio
yarn prisma db push         # Push schema (dev only)
```

### Docker
```bash
# Development
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose up -d
docker-compose logs -f
docker-compose down
```

---

## Remaining Tasks

### ⏳ Phase 4: Study Sessions
- Session CRUD operations
- Calendar view
- Session reminders

### ⏳ Phase 5: Real-time Chat
- Socket.io integration
- Message persistence
- Typing indicators

### ⏳ Phase 6: Security Enhancements
- Rate limiting
- Helmet middleware
- Content Security Policy

### ⏳ Phase 7: Production Deployment
- DigitalOcean setup
- Cloudflare configuration
- CI/CD automation

---

*This documentation serves as a complete reference for the StudyBuddy project with its innovative dual group joining system.*
