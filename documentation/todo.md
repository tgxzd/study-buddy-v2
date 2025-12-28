# TODO List

> This is a TODO list for tracking features and tasks to add. If any features or tasks need to be added, add them here.

> ## Deployment & Tech Stack Preferences
> - **Hosting**: DigitalOcean Droplets (NOT AWS EC2)
> - **DNS/SSL**: Cloudflare (NOT AWS Route 53)
> - **File Storage**: Database storage (Phase 1) → AWS S3 (future Phase 2 upgrade)
> - **Framework**: TanStack Router with Express.js backend

---

# StudyBuddy - Feature Roadmap

## ✅ Phase 1: Authentication & User Management (COMPLETE)

### Backend Tasks

#### Database & Models
- [x] **User Model Setup**
  - [x] Define User schema (id, email, password, name, createdAt, updatedAt)
  - [x] Add unique constraint on email
  - [x] Create Prisma migration

#### Authentication Service
- [x] **Password Management**
  - [x] Implement password hashing (bcryptjs, salt rounds: 10)
  - [x] Implement password verification function

- [x] **JWT Configuration**
  - [x] Setup JWT secret from environment variable
  - [x] Configure token expiration (7 days)
  - [x] Create token generation function
  - [x] Create token verification function

- [x] **Auth Service**
  - [x] `register(email, password, name)` - Create new user
  - [x] `login(email, password)` - Validate credentials, return token
  - [x] `getUserById(id)` - Fetch user by ID
  - [x] `getUserByEmail(email)` - Fetch user by email

#### API Endpoints
- [x] **POST /auth/register** - User registration
  - [x] Validate input (email format, password strength)
  - [x] Hash password before storing
  - [x] Return user data (excluding password)

- [x] **POST /auth/login** - User login
  - [x] Validate credentials
  - [x] Generate JWT token
  - [x] Set HTTP-only cookie (7 days expiration)

- [x] **POST /auth/logout** - User logout
  - [x] Clear HTTP-only cookie

- [x] **GET /auth/me** - Get current user
  - [x] Verify JWT from cookie
  - [x] Return user data

#### Middleware & Protection
- [x] **Authentication Middleware**
  - [x] Verify JWT token
  - [x] Attach user to request context
  - [x] Return 401 for invalid tokens

### Frontend Tasks

#### UI Components
- [x] **Reusable Components**
  - [x] Button component (variants: primary, secondary, danger)
  - [x] Input component (with error state)
  - [x] Card component (container with consistent styling)
  - [x] Form validation feedback

#### Pages & Routes
- [x] **Landing Page** (`/` or `/index`)
  - [x] Hero section with app description
  - [x] Call-to-action buttons (Register, Login)
  - [x] Feature highlights

- [x] **Register Page** (`/register`)
  - [x] Form with: name, email, password, confirm password
  - [x] Client-side validation
  - [x] Error message display
  - [x] Success redirect to dashboard

- [x] **Login Page** (`/login`)
  - [x] Form with: email, password
  - [x] Remember me checkbox
  - [x] Error message display
  - [x] Success redirect to dashboard

- [x] **Dashboard Page** (`/dashboard`)
  - [x] Protected route (require authentication)
  - [x] Welcome message with user name
  - [x] Quick stats cards
  - [x] Navigation to other features

#### Navigation
- [x] **Navbar Component**
  - [x] Fixed position at top
  - [x] Dark theme (#1f2937 background)
  - [x] Logo/brand name
  - [x] Navigation links (Dashboard, Groups, etc.)
  - [x] Auth state display (Login/Logout or user menu)
  - [x] Mobile responsive (hamburger menu)

### Configuration
- [x] **Environment Variables**
  - [x] `JWT_SECRET` - Secret for signing tokens
  - [x] `JWT_EXPIRES_IN` - Token expiration (7d)
  - [x] `SESSION_SECRET` - Additional session security
  - [x] `DATABASE_URL` - PostgreSQL connection string

---

## ✅ Phase 2: Study Groups (COMPLETE)

### Backend Tasks

#### Database & Models
- [x] **StudyGroup Model**
  - [x] Define schema (id, name, description, ownerId, createdAt, updatedAt)
  - [x] Add unique invite code field
  - [x] Create relation to User (owner/members)
  - [x] Create migration

- [x] **GroupMember Model**
  - [x] Define schema (id, groupId, userId, joinedAt)
  - [x] Unique constraint on groupId + userId
  - [x] Create migration

#### Group Service
- [x] **Core Operations**
  - [x] `createGroup(name, description, ownerId)` - Create new group with invite code
  - [x] `getGroupById(id)` - Fetch group with members
  - [x] `listGroups()` - List user's groups
  - [x] `listUserGroups(userId)` - List groups user is member of
  - [x] `updateGroup(id, data)` - Update group details (owner only)
  - [x] `deleteGroup(id)` - Delete group (owner only)

- [x] **Invite Code System**
  - [x] `generateInviteCode()` - Generate unique 6-character code
  - [x] `getGroupByInviteCode(code)` - Fetch group by invite code
  - [x] Exclude ambiguous characters (I, 1, O, 0)

- [x] **Membership Operations**
  - [x] `joinGroup(groupId, userId)` - Add user to group
  - [x] `leaveGroup(groupId, userId)` - Remove user from group
  - [x] `isMember(groupId, userId)` - Check membership status
  - [x] `getGroupMembers(groupId)` - List all members

#### API Endpoints
- [x] **POST /groups** - Create group
  - [x] Require authentication
  - [x] Validate input
  - [x] Auto-assign creator as owner
  - [x] Generate unique invite code
  - [x] Auto-add owner as first member

- [x] **GET /groups** - List user's groups
  - [x] Return user's groups
  - [x] Include member count, file count, session count

- [x] **GET /groups/:id** - Get group details
  - [x] Return group info
  - [x] Return member list
  - [x] Check membership status
  - [x] Include invite code (for owner)

- [x] **PATCH /groups/:id** - Update group
  - [x] Validate permissions (owner only)
  - [x] Return updated group

- [x] **DELETE /groups/:id** - Delete group
  - [x] Validate permissions (owner only)
  - [x] Delete group and all related data

### Frontend Tasks

#### Pages & Routes
- [x] **Groups List Page** (`/groups`)
  - [x] Grid/list of user's groups
  - [x] **Tab-based interface** ("My Groups" vs "Browse & Join")
  - [x] Show group name, description, member count
  - [x] "Create Group" button
  - [x] Owner badge display

- [x] **Create Group Page** (`/groups/create`)
  - [x] Form with: name, description
  - [x] Character limits (name: 100, description: 500)
  - [x] Submit button
  - [x] Redirect to group after creation

- [x] **Group Detail Page** (`/groups/:id`)
  - [x] Group name and description
  - [x] **Invite code display** (owner only, with copy button)
  - [x] Member list with avatars
  - [x] Owner actions: Edit, Delete
  - [x] Breadcrumb navigation
  - [x] Stats display (members, files, sessions, pending requests)

#### UI Features
- [x] **Group Card**
  - [x] Display group info
  - [x] Show member count
  - [x] Show owner badge
  - [x] Hover effects

- [x] **Invite Code Display**
  - [x] Display 6-character code (owner only)
  - [x] Copy to clipboard button
  - [x] Success feedback
  - [x] Glass card styling

- [x] **Join by Code Input**
  - [x] Input field for code (6 characters, auto-uppercase)
  - [x] Join button
  - [x] Error handling for invalid code
  - [x] Auto-redirect after joining

---

## ✅ Phase 2.5: Dual Group Joining System (COMPLETE)

### Method 1: Join by Invite Code (Instant Join)

#### Backend Tasks
- [x] **Invite Code Generation**
  - [x] Generate unique 6-character codes
  - [x] Exclude ambiguous characters (I, 1, O, 0)
  - [x] Ensure uniqueness on creation

- [x] **Join by Code Endpoint**
  - [x] `POST /groups/join-by-code` - Join with code
  - [x] Validate invite code
  - [x] Check if already member
  - [x] Auto-add user (no approval needed)
  - [x] Return success with group ID

#### Frontend Tasks
- [x] **My Groups Tab**
  - [x] Invite code input field
  - [x] Auto-uppercase input
  - [x] 6-character limit
  - [x] Join button with loading state
  - [x] Success message and redirect

### Method 2: Search & Request (Approval-Based)

#### Backend Tasks
- [x] **Group Search Endpoint**
  - [x] `GET /groups/search?q=query` - Search by name
  - [x] Case-insensitive search
  - [x] Return up to 20 results
  - [x] Include owner name and member count

#### Join Request System (Already Complete)
- [x] **JoinRequest Model**
  - [x] Define schema (id, groupId, userId, status, createdAt, updatedAt)
  - [x] Status enum: PENDING, ACCEPTED, REJECTED
  - [x] Unique constraint on groupId + userId

- [x] **Join Request Service**
  - [x] `createRequest(groupId, userId)` - Create join request
  - [x] `acceptRequest(requestId)` - Accept and add to group
  - [x] `rejectRequest(requestId)` - Reject request
  - [x] `cancelRequest(requestId, userId)` - User cancels their request
  - [x] `getPendingRequests(groupId)` - List pending (owner only)

- [x] **API Endpoints**
  - [x] `POST /groups/:id/join` - Request to join
  - [x] `GET /groups/:id/requests` - Get pending requests (owner only)
  - [x] `POST /groups/:id/requests/handle` - Accept/reject request (owner only)
  - [x] `DELETE /groups/:id/requests/:requestId` - Cancel request

#### Frontend Tasks

##### Browse & Join Tab
- [x] **Search Interface**
  - [x] Search input with icon
  - [x] Search button with loading state
  - [x] Enter key to search
  - [x] Empty state illustration

- [x] **Search Results**
  - [x] Group cards with search results
  - [x] "Request to Join" buttons
  - [x] Owner name display
  - [x] Member count display
  - [x] No results state

- [x] **Join Request Flow**
  - [x] Confirmation dialog before sending request
  - [x] Success message after request sent
  - [x] Error handling

##### Owner Features
- [x] **Pending Request Indicators**
  - [x] Badge with pending count on group detail stats
  - [x] Warning color (amber/red)
  - [x] UserPlus icon

- [x] **Join Request Management Page** (`/groups/:id/requests`)
  - [x] List of pending requests
  - [x] User info display (name, email, request date)
  - [x] Accept/Decline buttons
  - [x] Empty state when no requests

---

## ✅ Phase 3: File Sharing (COMPLETE)

### Backend Tasks

#### Database & Models
- [x] **File Model**
  - [x] Define schema (id, filename, data, size, mimeType, groupId, uploaderId, createdAt)
  - [x] Store file data as `Bytes` type in database (Base64 encoding)
  - [x] Add file validation constraints
  - [x] Add index on groupId for faster queries
  - [x] Create migration

#### File Storage (Database Storage - Phase 1)
- [x] **Current Implementation** - Store in database
  - [x] Convert file to Base64 before storing
  - [x] Store binary data in `Bytes` column
  - [x] Set size limit: 5MB per file (database limitation)
  - [x] Allowed types: pdf, docx, doc, jpg, jpeg, png, txt

- [x] **Future Upgrade** - Move to AWS S3 (Phase 2)
  - [x] AWS S3 integration (future implementation)
  - [x] Store S3 URL in database instead of file data
  - [x] Generate presigned URLs for secure access
  - [x] Keep database model compatible for migration

#### File Service
- [x] **Core Operations**
  - [x] `uploadFile(file, groupId, uploaderId)` - Upload and create record
  - [x] `listGroupFiles(groupId)` - List all files in group
  - [x] `deleteFile(fileId, userId)` - Delete file (uploader/owner only)
  - [x] `getFileById(fileId)` - Get file data for download
  - [x] `convertToBase64(file)` - Helper to encode file data

#### Validation & Security
- [x] **File Upload Rules**
  - [x] Size limit: 5MB max (database storage limitation)
  - [x] Allowed types: pdf, docx, doc, jpg, jpeg, png, txt
  - [x] Validate MIME type on upload
  - [x] Sanitize filename

#### API Endpoints
- [x] **POST /files/upload** - Upload file
  - [x] Require authentication
  - [x] Validate file size (max 5MB) and type
  - [x] Check group membership
  - [x] Convert to Base64 and store in database
  - [x] Return file metadata

- [x] **GET /files/group/:groupId** - List group files
  - [x] Require group membership
  - [x] Return paginated list (without file data)

- [x] **GET /files/:id/download** - Download file
  - [x] Require group membership
  - [x] Return file data with proper MIME type
  - [x] Set Content-Disposition header

- [x] **DELETE /files/:id** - Delete file
  - [x] Uploader or group owner only
  - [x] Remove from database

### Frontend Tasks

#### Components
- [x] **File Upload Component**
  - [x] File picker button
  - [x] File type icons
  - [x] Size display
  - [x] Upload progress/loading state

#### Group Files Page
- [x] **Files Section** (`/groups/:id/files`)
  - [x] List of uploaded files
  - [x] File name, size, uploader, upload date
  - [x] Download button
  - [x] Delete button (if owner/uploader)
  - [x] Empty state with upload prompt
  - [x] Upload button (with validation)

---

## ⏳ Phase 4: Study Sessions (PENDING)

### Backend Tasks

#### Database & Models
- [ ] **StudySession Model**
  - [ ] Define schema (id, title, description, date, time, link, groupId, createdBy, createdAt, updatedAt)
  - [ ] Add timezone support
  - [ ] Create migration

#### Session Service
- [ ] **Core Operations**
  - [ ] `createSession(data)` - Create new session
  - [ ] `getSessionsByGroup(groupId)` - List all sessions for group
  - [ ] `getSessionById(id)` - Get session details
  - [ ] `updateSession(id, data)` - Update session (creator only)
  - [ ] `deleteSession(id)` - Delete session (creator/owner only)
  - [ ] `getUpcomingSessions(groupId)` - Get future sessions

#### API Endpoints
- [ ] **POST /sessions** - Create session
  - [ ] Require group membership
  - [ ] Validate date/time
  - [ ] Validate meeting link format

- [ ] **GET /sessions/group/:groupId** - List group sessions
  - [ ] Require group membership
  - [ ] Support filtering (past/upcoming)

- [ ] **PUT /sessions/:id** - Update session
  - [ ] Creator or group owner only

- [ ] **DELETE /sessions/:id** - Delete session
  - [ ] Creator or group owner only

### Frontend Tasks

#### Components
- [ ] **Session Form**
  - [ ] Title input
  - [ ] Description textarea
  - [ ] Date picker
  - [ ] Time picker
  - [ ] Meeting link input
  - [ ] Submit button

- [ ] **Session Card**
  - [ ] Title and description
  - [ ] Date and time display
  - [ ] Countdown for upcoming sessions
  - [ ] Join meeting button
  - [ ] Edit/delete buttons (if creator)

- [ ] **Calendar View** (Optional)
  - [ ] Monthly calendar
  - [ ] Session markers
  - [ ] Click to view details

#### Group Sessions Page
- [ ] **Sessions Section** (`/groups/:id/sessions`)
  - [ ] List of upcoming sessions
  - [ ] "Create Session" button (members)
  - [ ] Past sessions toggle
  - [ ] Empty state with prompt to create

---

## ⏳ Phase 5: Real-time Chat (PENDING)

### Backend Tasks

#### Database & Models
- [ ] **ChatMessage Model**
  - [ ] Define schema (id, content, userId, groupId, createdAt, updatedAt)
  - [ ] Add message read status (optional)

#### WebSocket Setup
- [ ] **Socket.io Configuration**
  - [ ] Install socket.io dependencies
  - [ ] Configure CORS
  - [ ] Setup authentication middleware
  - [ ] Initialize socket server

#### Chat Service
- [ ] **Socket Events**
  - [ ] `join:room` - User joins group chat
  - [ ] `leave:room` - User leaves group chat
  - [ ] `send:message` - Send message to group
  - [ ] `receive:message` - Broadcast message to group
  - [ ] `typing:start` - User is typing
  - [ ] `typing:stop` - User stopped typing

- [ ] **Message Persistence**
  - [ ] Save messages to database
  - [ ] Load recent messages (last 50)
  - [ ] Load messages by date range

#### API Endpoints
- [ ] **GET /chat/:groupId/history** - Get message history
  - [ ] Require group membership
  - [ ] Support pagination

### Frontend Tasks

#### Components
- [ ] **Chat Component**
  - [ ] Message list container
  - [ ] Auto-scroll to bottom
  - [ ] Message input field
  - [ ] Send button
  - [ ] Emoji picker (optional)

- [ ] **Message Bubble**
  - [ ] Sender name/avatar
  - [ ] Message content
  - [ ] Timestamp
  - [ ] Different style for own messages
  - [ ] Read receipt (optional)

- [ ] **Typing Indicator**
  - [ ] Show "X is typing..." message
  - [ ] Debounce display

#### Group Chat Section
- [ ] **Chat Panel** (`/groups/:id/chat`)
  - [ ] Embedded chat component
  - [ ] Collapsible panel
  - [ ] Unread message count
  - [ ] Sound notification (optional)

---

## ⏳ Phase 6: Security & Polish (PENDING)

### Security Enhancements
- [ ] **Rate Limiting**
  - [ ] Implement rate limit on auth endpoints
  - [ ] Implement rate limit on API endpoints
  - [ ] Configure limits (100 req/15min per user)

- [ ] **Input Sanitization**
  - [ ] Sanitize all user inputs
  - [ ] Prevent XSS attacks
  - [ ] Prevent SQL injection

- [ ] **CSRF Protection**
  - [ ] Implement CSRF tokens
  - [ ] Validate on state-changing requests

- [ ] **Content Security Policy**
  - [ ] Configure CSP headers
  - [ ] Restrict script sources

### UI/UX Improvements
- [ ] **Loading States**
  - [ ] Skeleton screens
  - [ ] Spinners for async operations
  - [ ] Progress bars for uploads

- [ ] **Error Handling**
  - [ ] User-friendly error messages
  - [ ] Error boundaries
  - [ ] Toast notifications

- [ ] **Accessibility**
  - [ ] ARIA labels
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] Focus management

- [ ] **Responsive Design**
  - [ ] Mobile breakpoints
  - [ ] Touch-friendly targets
  - [ ] Hamburger menu for mobile

### Testing
- [ ] **Unit Tests**
  - [ ] Test services (auth, group, etc.)
  - [ ] Test utilities
  - [ ] Aim for 80% coverage

- [ ] **Integration Tests**
  - [ ] Test API endpoints
  - [ ] Test database operations

- [ ] **E2E Tests**
  - [ ] Test critical user flows
  - [ ] Test authentication flow
  - [ ] Test group creation
  - [ ] Test dual joining system

---

## ⏳ Phase 7: Deployment (DevOps) (PARTIAL)

### Docker Setup
- [x] **Dockerfile**
  - [x] Multi-stage build (builder + runner)
  - [x] Use Node 20 Alpine
  - [x] Non-root user for security
  - [x] Health check endpoint

- [x] **Docker Compose - Development**
  - [x] Application service with hot reload
  - [x] PostgreSQL service
  - [x] Volume mounts for code
  - [x] Environment variables

- [ ] **Docker Compose - Production**
  - [ ] Pre-built image from GHCR
  - [ ] PostgreSQL service
  - [ ] Named volumes for data persistence
  - [ ] Restart policy

- [ ] **Shell Scripts**
  - [x] `0-init.sh` - Database initialization
  - [x] `1-start-dev.sh` - Development startup
  - [x] `2-start-prod.sh` - Production startup

- [x] **Configuration**
  - [x] `.dockerignore` - Optimize build context
  - [x] `.env.example` - Environment template
  - [x] README for Docker usage

### CI/CD Pipeline
- [ ] **GitHub Actions - CI**
  - [x] Lint (ESLint)
  - [x] Type check (TypeScript)
  - [ ] Build (production build)
  - [ ] Run on push to main/dev

- [ ] **GitHub Actions - Docker**
  - [ ] Build Docker image
  - [ ] Push to GitHub Container Registry (GHCR)
  - [ ] Tag with commit SHA and version
  - [ ] Run on push to main branch

- [ ] **Git Workflow**
  - [x] Define branching strategy (main, dev, feature/*)
  - [ ] Require PR for merging
  - [ ] Automated testing on PRs

### DigitalOcean Deployment
- [ ] **Droplet Setup**
  - [ ] Create droplet (Ubuntu 22.04 LTS)
  - [ ] Choose appropriate size ($6-12/month to start)
  - [ ] Enable SSH key authentication
  - [ ] Setup firewall (UFW)
  - [ ] Install Docker and Docker Compose
  - [ ] Setup fail2ban for SSH protection

- [ ] **Application Deployment**
  - [ ] Clone repository
  - [ ] Configure environment variables
  - [ ] Pull Docker image from GHCR
  - [ ] Start containers with docker-compose
  - [ ] Setup nginx reverse proxy (optional)
  - [ ] Configure log rotation

- [ ] **Database Setup**
  - [ ] Managed PostgreSQL (DigitalOcean) or self-hosted
  - [ ] Configure backups
  - [ ] Setup connection pooling

### Cloudflare Setup
- [ ] **DNS Configuration**
  - [ ] Add domain to Cloudflare
  - [ ] Point A record to Droplet IP
  - [ ] Configure DNS records (www, api, etc.)

- [ ] **SSL/TLS**
  - [ ] Enable Full SSL mode
  - [ ] Setup automatic SSL certificate
  - [ ] Configure HTTPS redirects

- [ ] **Security Features**
  - [ ] Enable Cloudflare CDN
  - [ ] Enable DDoS protection
  - [ ] Configure Web Application Firewall (WAF)
  - [ ] Enable bot fight mode (optional)

- [ ] **Performance**
  - [ ] Enable caching for static assets
  - [ ] Configure cache rules
  - [ ] Enable auto-minify
  - [ ] Enable Brotli compression

---

## Progress Summary

| Phase | Status |
|-------|--------|
| Phase 1: Authentication | ✅ COMPLETE |
| Phase 2: Study Groups | ✅ COMPLETE |
| Phase 2.5: Dual Joining System | ✅ COMPLETE |
| Phase 3: File Sharing | ✅ COMPLETE |
| Phase 4: Study Sessions | ⏳ PENDING |
| Phase 5: Real-time Chat | ⏳ PENDING |
| Phase 6: Security & Polish | ⏳ PENDING |
| Phase 7: Deployment | ⏳ IN PROGRESS (Docker complete, CI/CD pending) |

### Completed Features

**Authentication System:**
- ✅ User registration with email validation
- ✅ User login with JWT
- ✅ HTTP-only cookie storage (7 days)
- ✅ Protected routes with middleware
- ✅ Logout functionality

**Study Groups:**
- ✅ Group creation with unique invite code
- ✅ Group listing (user's groups)
- ✅ Group details page
- ✅ Group editing (owner only)
- ✅ Group deletion (owner only)
- ✅ Member management
- ✅ Owner controls

**Dual Joining System (Key Innovation):**

**Method 1 - Invite Code (Instant Join):**
- ✅ 6-character unique code generation
- ✅ Excludes ambiguous characters (I, 1, O, 0)
- ✅ Code only visible to group owner
- ✅ Copy to clipboard functionality
- ✅ Instant join - no approval needed
- ✅ Auto-redirect to group page

**Method 2 - Search & Request (Approval-Based):**
- ✅ Case-insensitive group name search
- ✅ Up to 20 search results
- ✅ Send join request functionality
- ✅ Pending request tracking
- ✅ Owner approval/decline system
- ✅ Cancel own requests

**File Sharing:**
- ✅ File upload (5MB limit)
- ✅ File type validation (pdf, docx, jpg, png, txt)
- ✅ Database storage (PostgreSQL Bytes)
- ✅ File listing by group
- ✅ File download with proper MIME type
- ✅ File deletion (uploader/owner)
- ✅ File size and type display

**Dashboard:**
- ✅ User statistics (groups, files, sessions)
- ✅ Quick action buttons
- ✅ Getting started guide
- ✅ Real-time stats fetching

**Docker Configuration:**
- ✅ Multi-stage Dockerfile
- ✅ Development docker-compose
- ✅ Shell scripts for initialization
- ✅ Environment configuration templates

### Remaining Tasks

**Study Sessions:**
- ⏳ Session CRUD operations
- ⏳ Calendar view
- ⏳ Session reminders

**Real-time Chat:**
- ⏳ Socket.io integration
- ⏳ Message persistence
- ⏳ Typing indicators

**Security:**
- ⏳ Rate limiting
- ⏳ Helmet middleware
- ⏳ Content Security Policy
- ⏳ CSRF protection

**Production Deployment:**
- ⏳ DigitalOcean setup
- ⏳ Cloudflare configuration
- ⏳ CI/CD pipeline automation
- ⏳ nginx reverse proxy

---

## Notes

### Environment Variables Format
- Database URL: `postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public`
- Generate secrets with: `openssl rand -base64 32`

### Key Design Decisions
- **JWT Expiration**: 7 days
- **Cookie Max-Age**: 7 days (604800 seconds)
- **Invite Codes**: 6-character alphanumeric (no I, 1, O, 0)
- **Dual Joining System**: Separate instant (invite code) and approval-based (search) methods
- **Theme**: Dark navbar (#1f2937), purple accent (#6B46C1)
- **Deployment**: DigitalOcean + Cloudflare (NOT AWS)

### File Storage Roadmap
- **Phase 1 (Current)**: Database storage (5MB limit)
- **Phase 2 (Future)**: AWS S3 migration with presigned URLs
