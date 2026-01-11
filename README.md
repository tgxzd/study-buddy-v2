<div align="center">

  ![StudyBuddy Logo](public/logo192.png)

  # StudyBuddy

  **Your Collaborative Learning Companion**

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-24-339933)](https://nodejs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
  [![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

  [Features](#features) • [Quick Start](#quick-start) • [Demo](#demo) • [Tech Stack](#tech-stack) • [Contributing](#contributing)

</div>

---

## 📖 About

StudyBuddy is a modern web application designed to help students collaborate effectively. Create study groups, share resources, schedule sessions, and learn together with friends and classmates.

---

## ✨ Features

### 🔐 Authentication
- Secure user registration and login
- JWT-based session management
- Persistent sessions with "Remember Me" option

### 👥 Study Groups
- Create and manage study groups
- Browse and join existing groups
- Invite code system for easy group sharing
- Member management (add/remove members)

### 📁 File Sharing
- Upload and share study materials
- Organize files by group
- Download resources anytime

### 📅 Session Scheduling
- Plan and organize study sessions
- Set dates, times, and locations
- Add meeting links for virtual sessions

### 📊 Dashboard
- Personalized overview of activity
- Quick access to groups, files, and sessions
- Statistics and insights

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 24+
- **PostgreSQL** 16+
- **Yarn** package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/tgxzd/study-buddy-v2.git
cd study-buddy-v2

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/studybuddy"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-secret-key"

# Session Secret
SESSION_SECRET="your-session-secret"

# Server
PORT=3000
NODE_ENV=development
```

### Database Setup

```bash
# Generate Prisma Client
yarn prisma generate

# Run migrations
yarn prisma migrate deploy

# (Optional) Seed database
yarn prisma db seed
```

### Run the Application

```bash
# Development mode
yarn dev

# Production build
yarn build
yarn start
```

Visit `http://localhost:3000` to see the application.

---

## 🎬 Demo

### Homepage & Authentication

![Homepage](public/homepage-pic.png)

*Clean, modern interface with gradient backgrounds and smooth animations*

### Dashboard

![Dashboard](public/dashboard-pic.png)

*Your personalized hub for all activities*

### Study Groups

![Groups](public/group-pic.png)

*Manage all your study groups in one place*

### Create Group

![Create Group](public/create-group-pic.png)

*Easily create new study groups with descriptions*

### Browse Groups

![Browse Groups](public/browse-group-pic.png)

*Discover and join existing study groups*

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool |
| **TanStack Router** | File-based Routing |
| **Tailwind CSS 4** | Styling |
| **Lucide React** | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js 24** | Runtime Environment |
| **Express** | Web Framework |
| **TypeScript** | Type Safety |
| **Prisma** | ORM |
| **PostgreSQL** | Database |
| **JWT** | Authentication |
| **bcryptjs** | Password Hashing |

### DevOps
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container Orchestration |
| **GitHub Actions** | CI/CD Pipeline |

---

## 📁 Project Structure

```
study-buddy-v2/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React contexts (Auth, etc.)
│   ├── lib/                # Utilities and API client
│   ├── routes/             # TanStack Router file-based routes
│   │   ├── auth/          # Authentication pages
│   │   ├── dashboard.tsx  # Dashboard page
│   │   └── groups/        # Group management pages
│   ├── server/            # Express backend
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Server utilities
│   └── main.tsx           # Application entry point
├── prisma/                # Database schema and migrations
├── .container/            # Docker configuration
│   ├── docker-compose.yml
│   └── .env.example
├── Dockerfile             # Docker image definition
└── package.json           # Dependencies and scripts
```

---

## 🔧 Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Build for production |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn format` | Format code with Prettier |
| `yarn prisma generate` | Generate Prisma Client |
| `yarn prisma migrate dev` | Create and apply migrations |
| `yarn prisma studio` | Open Prisma Studio (database GUI) |

### Adding New Routes

TanStack Router uses file-based routing. Add a new route by creating a file in `src/routes/`:

```tsx
// src/routes/about.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return <div>About Page</div>
}
```

### Database Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `yarn prisma migrate dev --name your_migration`
3. The migration file will be created in `prisma/migrations/`

---

## 🐳 Docker Deployment

StudyBuddy includes Docker configuration for easy deployment.

```bash
# Build and start all services
cd .container
docker compose up -d --build

# View logs
docker compose logs -f

# Stop services
docker compose down
```

**Services:**
- `studybuddy-app` - Main application (port 3000)
- `studybuddy-db` - PostgreSQL database (port 5433)

---

## 🔄 CI/CD

Automated deployment is configured via GitHub Actions:

- **CI Pipeline** - Runs tests on every push
- **CD Pipeline** - Auto-deploys to VPS on push to `main` branch

See `.github/workflows/` for configuration details.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---


## 🙏 Acknowledgments

- Built with [TanStack Router](https://tanstack.com/router)
- UI styled with [Tailwind CSS](https://tailwindcss.com/)
- Database managed with [Prisma](https://www.prisma.io/)
- Icons provided by [Lucide](https://lucide.dev/)

---


