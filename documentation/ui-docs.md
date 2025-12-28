# StudyBuddy - UI/UX Design Documentation

> A modern, Web3-inspired design system for collaborative learning

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Components](#components)
5. [Layout & Spacing](#layout--spacing)
6. [Animations & Interactions](#animations--interactions)
7. [Dark Mode](#dark-mode)
8. [Glassmorphism Effects](#glassmorphism-effects)

---

## Design Philosophy

### Core Principles

1. **Modern & Clean** - Minimal clutter, maximum clarity
2. **Web3 Aesthetics** - Gradients, glowing effects, glassmorphism
3. **Accessibility** - High contrast, readable, keyboard navigable
4. **Performance** - Smooth animations, instant feedback
5. **Responsive** - Mobile-first approach

### Visual Style

```
 (Keywords):
- Gradient backgrounds
- Glowing borders/shadows
- Glassmorphism (frosted glass effect)
- Subtle animations
- Rounded corners (xl or 2xl)
- Floating cards
- Neon accent colors
- Dark theme dominant
```

---

## Color System

### Primary Colors

```css
/* Primary Brand Color - Purple Gradient */
--primary-start: #8B5CF6;  /* Violet 500 */
--primary-end: #6B46C1;    /* Violet 700 */
--primary-glow: rgba(139, 92, 246, 0.5);

/* Accent Colors */
--accent-cyan: #06B6D4;     /* Cyan 500 */
--accent-pink: #EC4899;     /* Pink 500 */
--accent-green: #10B981;    /* Emerald 500 */
```

### Background Colors

```css
/* Dark Theme Backgrounds */
--bg-primary: #0F0F1A;      /* Deep dark blue-black */
--bg-secondary: #1A1A2E;    /* Slightly lighter */
--bg-tertiary: #252540;     /* Card background */
--bg-elevated: #2D2D4A;     /* Hover states */

/* Light Theme (Optional) */
--bg-primary-light: #FFFFFF;
--bg-secondary-light: #F8FAFC;
```

### Text Colors

```css
--text-primary: #FFFFFF;     /* White */
--text-secondary: #A5B4FC;   /* Soft violet */
--text-tertiary: #6B7280;    /* Gray */
--text-muted: #9CA3AF;       /* Muted gray */
```

### Semantic Colors

```css
/* Success */
--success: #10B981;
--success-bg: rgba(16, 185, 129, 0.1);
--success-glow: rgba(16, 185, 129, 0.3);

/* Warning */
--warning: #F59E0B;
--warning-bg: rgba(245, 158, 11, 0.1);
--warning-glow: rgba(245, 158, 11, 0.3);

/* Error */
--error: #EF4444;
--error-bg: rgba(239, 68, 68, 0.1);
--error-glow: rgba(239, 68, 68, 0.3);

/* Info */
--info: #3B82F6;
--info-bg: rgba(59, 130, 246, 0.1);
--info-glow: rgba(59, 130, 246, 0.3);
```

### Gradient Definitions

```css
/* Primary Gradient */
--gradient-primary: linear-gradient(135deg, #8B5CF6 0%, #6B46C1 100%);

/* Accent Gradients */
--gradient-cyan: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
--gradient-pink: linear-gradient(135deg, #EC4899 0%, #DB2777 100%);
--gradient-green: linear-gradient(135deg, #10B981 0%, #059669 100%);

/* Background Gradient */
--gradient-bg: radial-gradient(ellipse at top, #1A1A2E 0%, #0F0F1A 100%);

/* Glow Effect */
--glow-purple: 0 0 20px rgba(139, 92, 246, 0.5);
--glow-cyan: 0 0 20px rgba(6, 182, 212, 0.5);
```

---

## Typography

### Font Families

```css
/* Primary Font - Inter */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace Font - JetBrains Mono */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Display Font (Optional) - Space Grotesk */
--font-display: 'Space Grotesk', sans-serif;
```

### Type Scale

```css
/* Heading Scale */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Typography Examples

```tsx
// Headings
<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
  StudyBuddy
</h1>

// Body Text
<p className="text-base text-text-secondary leading-relaxed">
  Your learning journey starts here.
</p>

// Captions
<span className="text-xs text-text-muted uppercase tracking-wider">
  Coming Soon
</span>
```

---

## Components

### 1. Buttons

#### Primary Button (Gradient + Glow)

```tsx
<button className="
  px-6 py-3
  bg-gradient-to-r from-purple-500 to-violet-600
  text-white font-semibold rounded-xl
  shadow-lg shadow-purple-500/30
  hover:shadow-xl hover:shadow-purple-500/50
  hover:scale-105
  active:scale-95
  transition-all duration-200
  border border-white/10
">
  Get Started
</button>
```

#### Secondary Button (Glassmorphism)

```tsx
<button className="
  px-6 py-3
  bg-white/5 backdrop-blur-md
  border border-white/10
  text-white font-medium rounded-xl
  hover:bg-white/10
  hover:border-white/20
  transition-all duration-200
">
  Learn More
</button>
```

#### Outline Button (Glowing Border)

```tsx
<button className="
  px-6 py-3
  bg-transparent
  border-2 border-purple-500/50
  text-purple-400 font-medium rounded-xl
  hover:bg-purple-500/10
  hover:border-purple-400
  hover:shadow-lg hover:shadow-purple-500/20
  transition-all duration-200
">
  Connect Wallet
</button>
```

#### Icon Button

```tsx
<button className="
  p-3
  bg-white/5 backdrop-blur-sm
  rounded-xl
  hover:bg-white/10
  hover:scale-110
  transition-all duration-200
">
  <Icon name="bell" className="w-5 h-5 text-white" />
</button>
```

### 2. Cards

#### Glass Card (Default)

```tsx
<div className="
  bg-white/5 backdrop-blur-lg
  border border-white/10
  rounded-2xl
  p-6
  shadow-xl
  hover:bg-white/10
  hover:border-white/20
  hover:shadow-2xl
  transition-all duration-300
">
  <h3 className="text-xl font-semibold text-white mb-2">
    Card Title
  </h3>
  <p className="text-text-secondary">
    Card content goes here.
  </p>
</div>
```

#### Gradient Card (Featured)

```tsx
<div className="
  relative
  bg-gradient-to-br from-purple-500/20 to-violet-600/20
  border border-purple-500/30
  rounded-2xl
  p-6
  overflow-hidden
  hover:border-purple-400/50
  transition-all duration-300
">
  {/* Glow effect */}
  <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-transparent blur-xl" />

  <div className="relative">
    <h3 className="text-xl font-semibold text-white mb-2">
      Featured Card
    </h3>
    <p className="text-text-secondary">
      Special content here.
    </p>
  </div>
</div>
```

#### Floating Card

```tsx
<div className="
  bg-tertiary
  rounded-2xl
  p-6
  shadow-2xl shadow-black/50
  border border-white/5
  hover:-translate-y-2
  hover:shadow-purple-500/20
  transition-all duration-300
">
  Content
</div>
```

### 3. Inputs

#### Text Input (Modern)

```tsx
<input
  type="text"
  placeholder="Enter your email..."
  className="
    w-full px-4 py-3
    bg-white/5 backdrop-blur-sm
    border border-white/10
    rounded-xl
    text-white placeholder:text-text-muted
    focus:outline-none
    focus:border-purple-500/50
    focus:ring-2 focus:ring-purple-500/20
    focus:bg-white/10
    transition-all duration-200
  "
/>
```

#### Search Input (With Icon)

```tsx
<div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
  <input
    type="text"
    placeholder="Search..."
    className="
      w-full pl-12 pr-4 py-3
      bg-white/5 backdrop-blur-sm
      border border-white/10
      rounded-xl
      text-white placeholder:text-text-muted
      focus:outline-none
      focus:border-purple-500/50
      transition-all duration-200
    "
  />
</div>
```

#### Textarea

```tsx
<textarea
  placeholder="Your message..."
  rows={4}
  className="
    w-full px-4 py-3
    bg-white/5 backdrop-blur-sm
    border border-white/10
    rounded-xl
    text-white placeholder:text-text-muted
    focus:outline-none
    focus:border-purple-500/50
    focus:ring-2 focus:ring-purple-500/20
    resize-none
    transition-all duration-200
  "
/>
```

### 4. Badges

#### Status Badge

```tsx
// Success (Green)
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
  <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
  Active
</span>

// Pending (Yellow)
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
  <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2" />
  Pending
</span>

// Error (Red)
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
  <span className="w-2 h-2 rounded-full bg-red-400 mr-2" />
  Error
</span>
```

#### Count Badge (Notification)

```tsx
<span className="relative inline-block">
  <Bell className="w-6 h-6 text-white" />
  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-full border-2 border-bg-primary">
    3
  </span>
</span>
```

### 5. Navigation

#### Navbar (Floating Glass)

```tsx
<nav className="
  fixed top-4 left-4 right-4
  bg-white/5 backdrop-blur-xl
  border border-white/10
  rounded-2xl
  shadow-2xl
  z-50
">
  <div className="flex items-center justify-between px-6 py-4">
    {/* Logo */}
    <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
      StudyBuddy
    </div>

    {/* Nav Links */}
    <div className="hidden md:flex items-center gap-6">
      <a href="#" className="text-white/70 hover:text-white transition-colors">
        Dashboard
      </a>
      <a href="#" className="text-white/70 hover:text-white transition-colors">
        Groups
      </a>
      <a href="#" className="text-white/70 hover:text-white transition-colors">
        Schedule
      </a>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-3">
      <button className="p-2 rounded-xl hover:bg-white/10 transition-colors">
        <Bell className="w-5 h-5 text-white" />
      </button>
      <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-medium rounded-xl">
        Connect
      </button>
    </div>
  </div>
</nav>
```

#### Sidebar (Collapsible)

```tsx
<aside className="
  fixed left-0 top-0 bottom-0
  w-64
  bg-bg-secondary/50 backdrop-blur-xl
  border-r border-white/10
  p-4
  z-40
">
  {/* Logo */}
  <div className="flex items-center gap-3 px-4 py-3 mb-8">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
      <BookOpen className="w-6 h-6 text-white" />
    </div>
    <span className="text-xl font-bold text-white">StudyBuddy</span>
  </div>

  {/* Navigation Items */}
  <nav className="space-y-2">
    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/10">
      <Home className="w-5 h-5" />
      <span>Dashboard</span>
    </a>
    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-white/5 hover:text-white transition-all">
      <Users className="w-5 h-5" />
      <span>My Groups</span>
    </a>
    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-white/5 hover:text-white transition-all">
      <Calendar className="w-5 h-5" />
      <span>Schedule</span>
    </a>
  </nav>
</aside>
```

### 6. Modals

#### Modal Overlay

```tsx
<div className="
  fixed inset-0
  z-50
  flex items-center justify-center
  p-4
">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

  {/* Modal Content */}
  <div className="
    relative
    w-full max-w-md
    bg-bg-tertiary
    border border-white/10
    rounded-3xl
    shadow-2xl
    p-6
    animate-in fade-in zoom-in duration-200
  ">
    <h2 className="text-2xl font-bold text-white mb-4">
      Create New Group
    </h2>
    <p className="text-text-secondary mb-6">
      Start your learning journey with friends.
    </p>
    {/* Form content */}
  </div>
</div>
```

### 7. Tables

#### Modern Table

```tsx
<div className="overflow-hidden rounded-2xl border border-white/10">
  <table className="w-full">
    <thead>
      <tr className="bg-white/5">
        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
          Name
        </th>
        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
          Status
        </th>
        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-white/5">
      <tr className="hover:bg-white/5 transition-colors">
        <td className="px-6 py-4 text-white">Study Group A</td>
        <td className="px-6 py-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
            Active
          </span>
        </td>
        <td className="px-6 py-4">
          <button className="text-purple-400 hover:text-purple-300">
            View
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### 8. Loaders & Spinners

#### Spinner (Glowing)

```tsx
<div className="flex items-center justify-center">
  <div className="
    w-12 h-12
    border-4 border-purple-500/20
    border-t-purple-500
    rounded-full
    animate-spin
  " />
</div>
```

#### Pulse Skeleton

```tsx
<div className="animate-pulse">
  <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
  <div className="h-4 bg-white/10 rounded w-1/2" />
</div>
```

---

## Layout & Spacing

### Container System

```css
/* Container Widths */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

### Spacing Scale

```css
/* Spacing Units (4px base unit) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
```

### Border Radius

```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;      /* 8px */
--radius-lg: 0.75rem;     /* 12px */
--radius-xl: 1rem;        /* 16px */
--radius-2xl: 1.5rem;     /* 24px */
--radius-3xl: 2rem;       /* 32px */
--radius-full: 9999px;
```

---

## Animations & Interactions

### Keyframe Animations

```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Slide Up */
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Pulse Glow */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(139, 92, 246, 0.8);
  }
}

/* Float */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Shimmer */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}
```

### Hover Effects

```tsx
// Card Hover (Lift + Glow)
<div className="
  group
  bg-white/5
  rounded-2xl
  p-6
  transition-all duration-300
  hover:-translate-y-2
  hover:shadow-2xl
  hover:shadow-purple-500/20
">
</div>

// Button Hover (Scale + Glow)
<button className="
  transition-all duration-200
  hover:scale-105
  hover:shadow-lg
  hover:shadow-purple-500/30
">
  Click Me
</button>

// Text Hover (Glow)
<span className="
  transition-all duration-200
  hover:text-purple-400
  hover:drop-shadow-lg
  hover:drop-shadow-purple-500/50
">
  Hover Me
</span>
```

### Loading States

```tsx
// Skeleton Loader
<div className="animate-pulse">
  <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
  <div className="h-4 bg-white/10 rounded w-full mb-2" />
  <div className="h-4 bg-white/10 rounded w-5/6" />
</div>

// Spinner with Backdrop
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
  <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
</div>
```

---

## Dark Mode

### Theme Toggle

```tsx
const [isDark, setIsDark] = useState(true);

<button
  onClick={() => setIsDark(!isDark)}
  className={`
    p-3 rounded-xl
    transition-all duration-200
    ${isDark
      ? 'bg-purple-500/20 text-yellow-400 hover:bg-purple-500/30'
      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
    }
  `}
>
  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
</button>
```

### Dark Mode Implementation

```tsx
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-primary)',
        surface: 'var(--bg-secondary)',
        primary: '#8B5CF6',
      }
    }
  }
}
```

---

## Glassmorphism Effects

### Glass Card

```tsx
<div className="
  relative
  bg-white/5
  backdrop-blur-xl
  border
  border-white/10
  rounded-2xl
  shadow-2xl
  overflow-hidden
">
  {/* Inner glow */}
  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

  <div className="relative p-6">
    Content here
  </div>
</div>
```

### Glass Navbar

```tsx
<nav className="
  fixed top-0 left-0 right-0
  bg-white/5
  backdrop-blur-xl
  border-b
  border-white/10
  z-50
">
  <div className="max-w-7xl mx-auto px-6 py-4">
    Navbar content
  </div>
</nav>
```

### Glass Modal

```tsx
<div className="
  relative
  bg-bg-tertiary/80
  backdrop-blur-2xl
  border
  border-white/20
  rounded-3xl
  shadow-2xl
  shadow-purple-500/10
">
  Modal content
</div>
```

---

## Page Templates

### Landing Page Template

```tsx
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-6">
          <h1 className="text-6xl font-bold text-white mb-6 animate-in fade-in slide-in duration-1000">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Study Together
            </span>
          </h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Collaborative learning for the modern era
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 hover:scale-105 transition-all">
              Get Started
            </button>
            <button className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
```

### Dashboard Template

```tsx
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-bg-secondary/50 backdrop-blur-xl border-r border-white/10 p-4">
        {/* Sidebar content */}
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <h3 className="text-text-secondary text-sm mb-2">Total Groups</h3>
            <p className="text-3xl font-bold text-white">12</p>
          </div>
          {/* More stats */}
        </div>

        {/* Content Area */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          {/* Main content */}
        </div>
      </main>
    </div>
  );
}
```

---

## Tailwind Configuration

### Extend Theme

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#7C3AED',
        },
        bg: {
          primary: '#0F0F1A',
          secondary: '#1A1A2E',
          tertiary: '#252540',
          elevated: '#2D2D4A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A5B4FC',
          tertiary: '#6B7280',
          muted: '#9CA3AF',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8B5CF6 0%, #6B46C1 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-glow': 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15), transparent 70%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

---

## Quick Reference

### Common Class Combinations

```tsx
// Glass Card
className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl"

// Gradient Button
className="bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30"

// Glow Effect
className="shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50"

// Text Gradient
className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"

// Hover Animation
className="transition-all duration-200 hover:scale-105 hover:-translate-y-1"

// Status Badge (Success)
className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20"
```

---

## Best Practices

### DO's
- ✅ Use high contrast colors for readability
- ✅ Add smooth transitions (200-300ms)
- ✅ Use backdrop-blur for glassmorphism
- ✅ Add subtle hover effects
- ✅ Keep consistent spacing (4px grid)
- ✅ Use semantic HTML
- ✅ Test on different screen sizes

### DON'Ts
- ❌ Don't use pure black (#000000) - use dark blues
- ❌ Don't overuse animations - keep them subtle
- ❌ Don't forget focus states for accessibility
- ❌ Don't use too many gradients - pick one per section
- ❌ Don't make text too small - minimum 14px for body
- ❌ Don't forget about loading states

---

*This UI documentation provides a modern, Web3-inspired design system. All components use the purple/violet color palette with glassmorphism effects and subtle animations.*
