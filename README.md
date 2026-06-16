<div align="center">

# 🧠 DevScope AI

### AI-Powered Developer Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)](https://docker.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-FF6B6B?style=for-the-badge)](https://langchain.com)

**The moment a recruiter opens DevScope AI, they immediately think:**
> *"This was built by a serious AI Engineer and Software Engineer."*

[🚀 Live Demo](#) · [📖 Docs](./docs) · [🐳 Docker Setup](#-quick-start)

</div>

---

## 🎯 What is DevScope AI?

DevScope AI is a **Developer Intelligence Platform** that acts as an AI recruiter, engineering mentor, career coach, and portfolio evaluator — all in one system.

It answers the questions every hiring manager asks:

| Question | DevScope AI's Answer |
|---|---|
| Would I hire this developer? | **Hire / Strong Hire / No Hire** verdict with probability % |
| What are their strengths? | Explainable AI reasoning with per-signal breakdown |
| What skills are missing? | ATS gap analysis vs. industry benchmarks |
| What is their future potential? | 30 / 90 / 365-day career acceleration roadmap |
| How do they compare to others? | ML-based salary prediction + percentile ranking |

---

## ✨ Key Features

### 🤖 Multi-Agent AI System (LangGraph)
- **Recruiter Agent** — Simulates a technical recruiter, engineering manager, and startup CTO
- **Resume Agent** — ATS scoring, keyword extraction, formatting quality analysis
- **GitHub Agent** — Repository analysis, code quality, documentation depth, commit cadence
- **Interview Agent** — AI-powered mock interviews (Technical / System Design / HR tracks)
- **Career Coach Agent** — Personalized 30/90/365-day growth roadmap

### 📊 Developer Intelligence Dashboard
- Animated SVG circular progress rings (count from 0 → score)
- Explainable AI pipeline visualization showing how each signal feeds the final score
- Colour-coded hiring verdict banner with probability and salary prediction
- AI Hiring Committee deliberation cards (TR / EM / CTO)
- Career acceleration timeline

### 🔐 Authentication System
- Email / Password sign up & sign in
- Google OAuth (real + simulator mode)
- JWT-based session management
- Individual data isolation per user
- Protected routes with auth guard

### 🎨 Premium UI/UX
- Apple Vision Pro–inspired glassmorphism
- Framer Motion animations with staggered reveals
- Animated nav with active page indicator (sliding underline glow)
- Mobile-responsive hamburger menu
- Scroll-aware frosted glass header

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      DEVSCOPE AI                            │
├──────────────────┬──────────────────────────────────────────┤
│   Frontend       │   Backend                                 │
│   Next.js 14     │   FastAPI + LangGraph                    │
│   TypeScript     │   Python 3.11                            │
│   Framer Motion  │   PostgreSQL + Redis                     │
│   Three.js       │   Celery (async tasks)                   │
│   TailwindCSS    │   JWT Auth                               │
└──────────────────┴──────────────────────────────────────────┘
         │                        │
         └──────────┬─────────────┘
                    │
            Docker Compose
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, TypeScript, Framer Motion, Vanilla CSS |
| **Backend** | FastAPI, Python 3.11, LangGraph, LangChain |
| **Database** | PostgreSQL, Redis (caching + queues) |
| **AI/ML** | LangGraph multi-agent, OpenAI GPT-4, ML salary prediction |
| **Auth** | JWT tokens, Google OAuth 2.0, bcrypt |
| **DevOps** | Docker, Docker Compose, Celery workers |

---

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1. Clone the repository
```bash
git clone https://github.com/harshvardhanmishra/DevscopeAI.git
cd DevscopeAI
```

### 2. Configure environment
```bash
# Copy the example env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit backend/.env and add your API keys:
# OPENAI_API_KEY=sk-...
# SECRET_KEY=your-secret-key
# GOOGLE_CLIENT_ID=your-google-client-id (optional)
```

### 3. Run with Docker Compose
```bash
docker-compose up --build -d
```

### 4. Access the platform
| Service | URL |
|---|---|
| 🌐 Frontend | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:8000 |
| 📖 API Docs | http://localhost:8000/docs |

---

## 📁 Project Structure

```
DevscopeAI/
├── frontend/                   # Next.js 14 application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── page.tsx        # Landing page + auth gate
│   │   │   ├── dashboard/      # Intelligence OS dashboard
│   │   │   ├── github/         # GitHub scanner
│   │   │   ├── resume/         # ATS resume scorer
│   │   │   ├── interview/      # AI interview simulator
│   │   │   └── about/          # About & creator
│   │   ├── components/
│   │   │   ├── auth/           # AuthOverlay (sign in / sign up)
│   │   │   └── layout/         # NavBar
│   │   └── hooks/
│   │       └── useAuthGuard.ts # Route protection hook
│   └── Dockerfile
│
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── api/v1/             # REST API routes
│   │   │   ├── auth.py         # JWT + Google OAuth
│   │   │   ├── reports.py      # Intelligence reports
│   │   │   ├── github.py       # GitHub analysis
│   │   │   ├── resume.py       # Resume processing
│   │   │   └── interview.py    # AI interviewer
│   │   ├── agents/             # LangGraph multi-agent system
│   │   ├── models/             # SQLAlchemy ORM models
│   │   └── core/               # Config, security, database
│   └── Dockerfile
│
├── docker-compose.yml          # Full stack orchestration
└── README.md
```

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/signup` | Create account |
| `POST` | `/api/v1/auth/token` | Sign in (get JWT) |
| `POST` | `/api/v1/auth/google-login` | Google OAuth |
| `GET` | `/api/v1/reports/latest` | Get latest analysis |
| `POST` | `/api/v1/github/analyze` | Analyze GitHub profile |
| `POST` | `/api/v1/resume/upload` | Upload & score resume |
| `POST` | `/api/v1/interview/start` | Start AI interview |
| `POST` | `/api/v1/interview/respond` | Submit answer |

Full interactive docs: **http://localhost:8000/docs**

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
# Database
DATABASE_URL=postgresql://devscope:devscope@db:5432/devscope

# Security
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# AI
OPENAI_API_KEY=sk-your-openai-key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id

# Redis
REDIS_URL=redis://redis:6379
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 👨‍💻 About the Creator

**Harshvardhan Mishra** — Computer Science Student & AI Engineer

Passionate about Artificial Intelligence, Software Engineering, System Design, and building impactful developer tools. DevScope AI is my flagship project combining AI engineering, developer analytics, and career intelligence into one platform.

📧 **harshvardhanmishra31@gmail.com**
🐙 **[@HarshvardhanMishra](https://github.com/harshvardhanmishra)**

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">
  Built with ❤️ by <strong>Harshvardhan Mishra</strong>
  <br/>
  <sub>DevScope AI — Making developers visible to the world.</sub>
</div>
