# StudyBuddy – Full Project Documentation

## 1. Project Requirement Document (PRD)

### Project Name
**StudyBuddy**

### Problem Statement
Students lack a simple, collaborative platform for:
- Sharing study notes
- Scheduling group study sessions
- Chatting in real time
- Tracking group progress

Existing tools (Google Classroom, Notion, Discord) are too fragmented or complex for small study groups.

### Goal
Build a lightweight collaboration platform focused on:
- Study groups
- File sharing
- Scheduling
- Real-time chat

### Target Users
- University students
- Self-study groups
- Online course learners

### User Roles
| Role | Description |
|------|-------------|
| Student | Main user – joins groups, uploads notes, chats |
| Admin | Same as Student (no dashboard), only for moderation (future-ready) |

> **⚠️ MVP: No admin panel**

### Core MVP Features
1. ✅ Authentication (JWT)
2. ✅ Study group creation & discovery
3. ✅ **Two-way group joining system:**
   - Invite code (instant join, owner-only visibility)
   - Search by name (requires owner approval)
4. ✅ Join request approval system
5. ✅ File upload & sharing
6. ⏳ Study session scheduling
7. ⏳ Real-time group chat
8. ⏳ Calendar view

### Out of Scope (MVP)
- Payments
- Notifications (email/push)
- AI features
- Mobile app

---

## 2. App Flow Document

### Authentication Flow
```
Landing Page → Sign Up → Login → JWT Stored (HTTP-only cookie) → Dashboard
```

### Main User Flow
```
Dashboard
 ├── Create Study Group
 ├── Two Ways to Join Groups:
 │    ├── Enter Invite Code (Instant Join - No Approval)
 │    └── Search by Name (Request - Wait for Owner Approval)
 ├── Open Group
 │    ├── Chat
 │    ├── Files
 │    ├── Sessions
 │    └── Settings
 └── Profile
```

### Group Joining Flows (IMPLEMENTED)

#### Method 1: Join by Invite Code (Instant)
```
User receives invite code from owner
 → User enters 6-character code
 → System validates code
 → User automatically added to group
 → No approval needed
```

**Key Features:**
- 6-character alphanumeric code (excluding ambiguous chars: I, 1, O, 0)
- Code only visible to group owner
- Instant membership upon valid code entry
- Auto-redirect to group page after joining

#### Method 2: Search and Request (Approval Required)
```
User searches groups by name
 → System returns matching groups
 → User clicks "Request to Join"
 → Request created (PENDING status)
 → Owner sees badge with pending count
 → Owner views requests in group detail
 → Owner accepts/declines
 ├── Accept: User added to group, status = ACCEPTED
 └── Decline: Request rejected, status = REJECTED
```

**Key Features:**
- Case-insensitive group name search
- Up to 20 search results
- Owner can accept/reject requests
- User can cancel pending requests

### File Upload Flow
```
User selects file
 → Frontend validates (size, type)
 → File converted to Base64/Buffer
 → Metadata + file data saved in PostgreSQL
 → File accessible via download endpoint
```

> **Future (Phase 2):** Upload to AWS S3 with presigned URLs

---

## 3. Tech Stack Document

### Frontend
- **Vite + React 19**
- **TanStack Router** (Current implementation)
- **Tailwind CSS v4**
- **Socket.io-client** (Future)
- **Yarn**
- **Lucide React** (icons)

### Backend
- **Node.js**
- **Express.js** (API server)
- **JWT Authentication**
- **Socket.io** (Future)
- **Prisma ORM**

### Database
- **PostgreSQL 16**

### Infrastructure
- **DigitalOcean Droplets** (VPS hosting)
- **Cloudflare** (DNS, SSL, CDN)
- **File Storage**: Database (Phase 1) → AWS S3 (Phase 2 upgrade)
- **Docker**
- **GitHub Actions** (CI/CD)

---

## 4. Frontend Guidelines Document

### Current Folder Structure (TanStack Router)
```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   └── layout/
│       └── Navbar.tsx
├── routes/
│   ├── __root.tsx (Layout + loader)
│   ├── index.tsx (Landing page)
│   ├── dashboard.tsx
│   ├── auth/
│   │   ├── register.tsx
│   │   └── login.tsx
│   └── groups/
│       ├── index.tsx (List all groups + join functionality)
│       ├── create.tsx (Create new group)
│       ├── $id.tsx (Group details)
│       ├── $id.edit.tsx (Edit group - owner only)
│       ├── $id.files.tsx (File management)
│       └── $id.requests.tsx (Join requests - owner only)
├── server/
│   ├── config/
│   │   └── database.ts (Prisma client)
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── groups.ts
│   │   ├── files.ts
│   │   └── dashboard.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── groupService.ts
│   │   ├── joinRequestService.ts
│   │   └── fileService.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts
│   │   ├── errorHandler.ts
│   │   └── requestLogger.ts
│   └── utils/
│       ├── password.ts
│       └── validation.ts
├── lib/
│   └── api.ts (API client)
├── contexts/
│   └── AuthContext.tsx
└── styles/
    └── globals.css
```

### State Management
- Local state for UI only
- Server-side data fetching with TanStack Router loaders
- API client for backend communication

### Styling
- Tailwind utility-first (v4 with @import syntax)
- Inline styles for dynamic components (when needed)
- Responsive-first
- Purple theme (#6B46C1 primary)
- Glassmorphism effects with dark theme

### Rules
1. One feature = one route file
2. No business logic in components
3. API calls through centralized client

---

## 5. Backend Guidelines Document

### Current Architecture
```
src/server/
├── config/
│   └── database.ts (Prisma client)
├── routes/
│   ├── auth.ts (Auth endpoints)
│   ├── groups.ts (Group endpoints)
│   ├── files.ts (File endpoints)
│   └── dashboard.ts (Stats endpoint)
├── services/
│   ├── authService.ts (Auth operations)
│   ├── groupService.ts (Group operations)
│   ├── joinRequestService.ts (Join request operations)
│   └── fileService.ts (File operations)
├── middleware/
│   ├── authMiddleware.ts (JWT verification)
│   ├── errorHandler.ts (Error handling)
│   └── requestLogger.ts (Request logging)
├── utils/
│   ├── password.ts (Hashing)
│   └── validation.ts (Zod schemas)
└── index.ts (Express app setup)
```

### Architecture
- **Current**: Express.js API server + Vite dev server
- **Routes** → **Middleware** → **Services** → **Prisma**
- JWT middleware for protected routes
- Centralized error handling

### Error Handling
- Try-catch in services
- asyncHandler wrapper for routes
- Standard error response format:
```json
{
  "error": "Error message"
}
```

---

## 6. App Flowchart (Textual)

```
User
 ↓
Login/Register
 ↓
Dashboard
 ↓
Study Groups
 │
 ├── Join by Invite Code (Implemented - Instant)
 │    ├── User enters 6-character code
 │    ├── System validates unique code
 │    ├── User added immediately
 │    └── Redirected to group page
 │
 ├── Search & Request (Implemented)
 │    ├── Search groups by name
 │    ├── Send join request
 │    ├── Owner sees pending count
 │    ├── Owner approves/declines
 │    └── User added on approval
 │
 ├── File Sharing (Implemented)
 │    ├── Upload files (5MB limit)
 │    ├── Store in PostgreSQL as Bytes
 │    ├── List group files
 │    ├── Download files
 │    └── Delete files (owner/uploader)
 │
 ├── Chat (Socket.io) - PENDING
 ├── Sessions (Calendar) - PENDING
 └── Future: Migrate files to AWS S3
```

---

## 7. Security Guideline Document

### Authentication
- **JWT** (Access Token)
- Stored in **HTTP-only cookies**
- Expiry: **7 days** (configured via `JWT_EXPIRES_IN` env var)
- HTTP-only flag prevents JavaScript access (XSS protection)
- Secure flag ensures HTTPS-only in production
- SameSite=Lax prevents CSRF attacks

### Authorization
**Group-based access control**

Only members can:
- View group details
- Upload files
- Access group files

Only group owners can:
- View invite code
- Edit group details
- Approve/decline join requests
- View pending requests
- Delete the group
- Delete any file in the group

### File Security
**Phase 1 (Current):** Database Storage
- File size limit: 5MB per file
- Allowed types: pdf, docx, doc, jpg, jpeg, png, txt
- Validate MIME type on upload
- Sanitize filenames

**Phase 2 (Future):** AWS S3
- Presigned S3 URLs for secure access
- Same file size/type restrictions
- Direct uploads to S3

### General
- Input validation (Zod)
- Helmet middleware (PENDING)
- Rate limiting (PENDING)

---

## 8. Database Design Document

### ER Diagram (Text)
```
User ──< GroupMember >── StudyGroup
User ──< GroupJoinRequest >── StudyGroup
User ──< File
StudyGroup ──< StudySession
StudyGroup ──< ChatMessage
```

### Prisma Models (Implemented)

**User**
```prisma
User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      UserRole @default(STUDENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  Relations:
  - ownedGroups (StudyGroup[])
  - memberships (GroupMember[])
  - joinRequests (GroupJoinRequest[])
  - uploadedFiles (File[])
  - chatMessages (ChatMessage[])
}

enum UserRole {
  STUDENT
  ADMIN
}
```

**StudyGroup**
```prisma
StudyGroup {
  id          String   @id @default(cuid())
  name        String
  description String?
  inviteCode  String   @unique  // NEW: 6-character invite code
  ownerId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  Relations:
  - owner (User)
  - members (GroupMember[])
  - joinRequests (GroupJoinRequest[])
  - files (File[])
  - sessions (StudySession[])
  - chatMessages (ChatMessage[])
}
```

**GroupMember**
```prisma
GroupMember {
  id        String   @id @default(cuid())
  userId    String
  groupId   String
  joinedAt  DateTime @default(now())

  Unique: [userId, groupId]

  Relations:
  - user (User)
  - group (StudyGroup)
}
```

**GroupJoinRequest**
```prisma
GroupJoinRequest {
  id        String           @id @default(cuid())
  userId    String
  groupId   String
  status    JoinRequestStatus @default(PENDING)
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  Unique: [userId, groupId]

  Relations:
  - user (User)
  - group (StudyGroup)
}

enum JoinRequestStatus {
  PENDING
  ACCEPTED
  REJECTED
}
```

**File**
```prisma
File {
  id         String   @id @default(cuid())
  filename   String
  data       Bytes    // Phase 1: Database storage
  size       Int
  mimeType   String
  groupId    String
  uploaderId String
  createdAt  DateTime @default(now())

  Index: [groupId]

  Relations:
  - group (StudyGroup)
  - uploader (User)
}
```

**StudySession**
```prisma
StudySession {
  id          String   @id @default(cuid())
  title       String
  description String?
  date        DateTime
  link        String?
  location    String?
  groupId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  Relations:
  - group (StudyGroup)
}
```

**ChatMessage**
```prisma
ChatMessage {
  id        String   @id @default(cuid())
  content   String
  userId    String
  groupId   String
  createdAt DateTime @default(now())

  Relations:
  - user (User)
  - group (StudyGroup)
}
```

---

## 9. API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (sets JWT cookie)
- `POST /api/auth/logout` - User logout (clears cookie)
- `GET /api/auth/me` - Get current user

### Groups
- `GET /api/groups` - List user's groups (member of)
- `POST /api/groups` - Create new group
- `GET /api/groups/:id` - Get group details (members only)
- `PATCH /api/groups/:id` - Update group (owner only)
- `DELETE /api/groups/:id` - Delete group (owner only)

### Group Joining (Two Methods)

**Method 1: Join by Invite Code (Instant)**
- `POST /api/groups/join-by-code` - Join with invite code
  - Body: `{ code: "ABC123" }`
  - Auto-adds user as member (no approval needed)
  - Only owner can see the invite code

**Method 2: Search & Request**
- `GET /api/groups/search?q=query` - Search groups by name
  - Case-insensitive search
  - Returns up to 20 results
  - No authentication required for search

- `POST /api/groups/:id/join` - Send join request
  - Creates pending request
  - Owner must approve

- `GET /api/groups/:id/requests` - Get pending requests (owner only)
- `POST /api/groups/:id/requests/handle` - Accept/reject request (owner only)
  - Body: `{ requestId: "...", action: "accept" | "reject" }`

- `DELETE /api/groups/:id/requests/:requestId` - Cancel own request

### Files
- `POST /api/files/upload` - Upload file (5MB limit)
- `GET /api/files/group/:groupId` - List group files
- `GET /api/files/:id/download` - Download file
- `DELETE /api/files/:id` - Delete file (uploader or owner)

### Dashboard
- `GET /api/dashboard/stats` - Get user statistics
  - Returns: `{ groups, files, sessions }`

### Schedule (PENDING)
- `POST /api/sessions` - Create session
- `GET /api/sessions/:groupId` - List group sessions
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### Chat (PENDING)
- Socket.io events for real-time messaging

---

## 10. Non-Functional Requirements (NFR)

| Category | Requirement |
|----------|-------------|
| Performance | API < 500ms |
| Scalability | Stateless backend |
| Availability | 99% uptime |
| Security | HTTPS only |
| Maintainability | Modular code |

---

## 11. Deployment Document

### Hosting Stack
- **VPS**: DigitalOcean Droplets (Ubuntu 22.04 LTS)
- **DNS/SSL**: Cloudflare
- **Container**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

### Backend
- Dockerized Node app
- PostgreSQL (managed or self-hosted)
- GitHub Container Registry (GHCR)

### Frontend
- Served via Vite dev server (development)
- Built static files (production)

### Environment-based configs
- `.env` - Local development
- `.env.example` - Template
- Production secrets via environment variables

---

## 12. UI/UX Guidelines

### Design Principles
- Minimal design
- Clear call-to-actions
- No clutter
- Mobile responsive
- Consistent spacing & typography

### Theme
- Dark background with glassmorphism effects
- Purple accents (#6B46C1 primary)
- Gradient backgrounds for cards
- Warning badges for pending requests (amber theme)

### Key UI Patterns
- **Tab-based navigation**: Separate "My Groups" from "Browse & Join"
- **Glass cards**: Semi-transparent backgrounds with blur
- **Hover effects**: Scale transforms on cards
- **Loading states**: Spinner animations
- **Empty states**: Helpful illustrations and prompts

---

## 13. Data Dictionary

| Field | Type | Description |
|-------|------|-------------|
| user.id | UUID | User identifier |
| group.id | UUID | Study group |
| group.inviteCode | String(6) | Unique 6-character join code |
| groupJoinRequest.status | Enum | PENDING | ACCEPTED | REJECTED |
| file.data | Bytes | File data (Phase 1: database) |
| file.url | String? | S3 URL (Phase 2: future) |
| session.date | DateTime | Study session time |

---

## 14. Git Workflow & CI/CD

### Branching
```
main
 └── dev
      └── feature/*
```

### CI Pipeline
- Lint (ESLint)
- Type check (TypeScript)
- Build Docker image
- Push to GitHub Container Registry (GHCR)

### CD Pipeline (Future)
- Deploy to DigitalOcean Droplet
- Pull latest image from GHCR
- Restart containers

---

## 15. Docker Documentation

### Dockerfile (Multi-stage)
```dockerfile
# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Production Stage
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 node
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
RUN chown -R node:nodejs /app
USER node
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/server/index.js"]
```

### Docker Compose
- **Development**: Hot reload, volume mounts
- **Production**: Pre-built image, named volumes

Services:
- API (Node.js app)
- PostgreSQL
- Prisma Studio (dev only)

---

## 16. Infrastructure Architecture

### Current Architecture
```
User
 → Cloudflare (DNS, SSL, CDN)
 → DigitalOcean Droplet (VPS)
   → Docker Container
     → Express.js API + Vite Frontend
     → PostgreSQL
     → File Storage (Database - Phase 1)
```

### Future Architecture (Phase 2: S3)
```
User
 → Cloudflare (DNS, SSL, CDN)
 → DigitalOcean Droplet (VPS)
   → Docker Container
     → Express.js API + Vite Frontend
     → PostgreSQL (metadata only)
     → AWS S3 (file storage)
```

---

## ✅ Final Advice (Important)

To avoid errors:
1. Build feature by feature
2. Dockerize after it works locally
3. Use `.env.example` as template
4. Log everything
5. Keep MVP small

### Before Starting Code
**Explore all the files and study the file structure first.**

### Environment Configuration
**See `.env.example` for all required environment variables.**

Key variables:
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - Token signing (generate with `openssl rand -base64 32`)
- `SESSION_SECRET` - Session encryption
- `POSTGRES_PASSWORD` - Database password

---

## ✅ Implemented Features Summary

### Phase 1: Authentication (COMPLETE)
- ✅ User registration
- ✅ User login with JWT
- ✅ HTTP-only cookie storage
- ✅ Protected routes
- ✅ Logout functionality

### Phase 2: Study Groups (COMPLETE)
- ✅ Group creation
- ✅ Group listing
- ✅ Group details
- ✅ Group editing (owner only)
- ✅ Group deletion (owner only)
- ✅ Member management
- ✅ Owner controls

### Phase 2.5: Group Joining System (COMPLETE)
- ✅ **Invite code generation** (6-character unique code)
- ✅ **Join by invite code** (instant, no approval)
- ✅ **Search groups by name** (case-insensitive)
- ✅ **Join request system**
- ✅ **Accept/decline requests** (owner only)
- ✅ **Cancel own requests**
- ✅ **Pending request indicators**

### Phase 3: File Sharing (COMPLETE)
- ✅ File upload (5MB limit)
- ✅ File listing by group
- ✅ File download with proper MIME type
- ✅ File deletion (uploader/owner)
- ✅ File type validation
- ✅ Database storage (Bytes)

### Dashboard (COMPLETE)
- ✅ User statistics
- ✅ Group count
- ✅ File count
- ✅ Session count

### Remaining Features
- ⏳ Study session scheduling
- ⏳ Real-time chat (Socket.io)
- ⏳ Security enhancements (rate limiting, Helmet)
- ⏳ AWS S3 migration for files
