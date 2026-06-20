<div align="center">

# 🧠 DevScope AI

### The Intelligent Developer Analytics & Career Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)](https://docker.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-FF6B6B?style=for-the-badge)](https://langchain.com)

**DevScope AI is a premium portfolio analyzer and multi-agent AI dashboard designed to evaluate developer profiles (GitHub, Resume, and Interview Skills) and simulate a real-world hiring committee's deliberations.**

[🚀 Try Live Demo](https://devscope-ai-self.vercel.app/) · [✉️ Contact Creator](mailto:harshvardhanmishra31@gmail.com) · [📁 Local Setup](#%EF%B8%8F-technical-setup-developer-instructions)

</div>

---

## 🎯 What is DevScope AI?

When recruiters or engineering managers look at candidate profiles, they ask several core questions. DevScope AI answers them automatically using a state-of-the-art multi-agent AI system:

* **Hiring Verdict**: Computes a dynamic hiring verdict (**Strong Hire / Hire / Potential Hire**) with a confidence probability percentage.
* **Explainable AI Deliberations**: Simulates and displays candidate reviews written by a **Technical Recruiter**, **Engineering Manager**, and **CTO**.
* **ATS & Skills Gap Audit**: Scores formatting, layouts, and scans for keyword optimization compared to industry standards.
* **AI Mock Interviews**: Simulates realistic developer screens (System Design, Frontend, Backend) with interactive follow-up questions and scores answers.
* **Growth Roadmaps**: Automatically drafts a custom 30/90/365-day developer career acceleration plan.

---

## 🚀 How to Try the App Instantly (For Recruiters)

No setup or registration is required to experience the platform:

1. Open the [Live Demo Link](https://devscope-ai-self.vercel.app/).
2. Click **Sign In** in the top right corner.
3. Select **Continue with Google** — we have built a **Google OAuth Simulator** as a fallback. You can type in any mock username or email address and gain immediate access.
4. Navigate to the **GitHub Scanner**, enter a profile username (e.g. `harshvardhanmishra`), and run a scan.
5. Visit the **Dashboard** to see the AI Hiring Committee evaluate the candidate based on live data!

---

## ✨ Key Features

### 🤖 Multi-Agent AI System (LangGraph)
* **GitHub Agent** — Scans repository structure, languages, code density, commit history, and highlights technical strengths.
* **Resume Agent** — Performs ATS keyword matching, layout analysis, and skill density grading.
* **Interview Agent** — Moderates live coding or system design interviews and grades semantic responses.
* **Career Coach Agent** — Suggests actionable growth roadmaps to bridge identified skill gaps.

### 🎨 Premium Glassmorphic UI/UX
* Apple Vision Pro-inspired glassmorphism styles with smooth parallax layers.
* Dynamic dashboard telemetry: displays an elegant **"Demo Mode"** (Telemetry Offline) state if no scans have been performed yet, inviting users to run scans.
* Beautiful animated SVG progress score rings and staggered Framer Motion transitions.

### 🔐 Auth & Security
* Full standard email/password authentication + Google OAuth Integration.
* Secure JWT session token management and complete user-session data isolation.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Framer Motion, Vanilla CSS |
| **Backend** | FastAPI (Python 3.12), LangGraph, LangChain |
| **Database & Cache** | PostgreSQL, Redis (queues & caching) |
| **Task Queue** | Celery (async worker pipelines) |
| **DevOps** | Docker, Docker Compose |

---

## 👨‍💻 About the Creator

**Harshvardhan Mishra**  
*Computer Science Student & AI Engineer*  

Passionate about Artificial Intelligence, Multi-Agent Networks, and high-fidelity product design. DevScope AI is my flagship project demonstrating full-stack engineering competency, distributed background processing, and explainable AI scoring architectures.

* 📧 **harshvardhanmishra31@gmail.com**
* 🐙 **[GitHub Profile](https://github.com/harshvardhanmishra32)**

---

<details>
<summary>🛠️ <b>Technical Setup & Developer Instructions (Local Run)</b></summary>

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 1. Clone the repository
```bash
git clone https://github.com/harshvardhanmishra32/Devscope-Ai.git
cd Devscope-Ai
```

### 2. Configure Environment
```bash
# Copy env templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```
Open `backend/.env` and configure your API Keys:
* `OPENAI_API_KEY`: Your OpenAI key.
* `SECRET_KEY`: A random string for secure JWT tokens.

### 3. Build & Run Stack
```bash
docker-compose up --build -d
```

### 4. Port Mapping
* 🌐 **Frontend URL**: http://localhost:3000
* ⚙️ **Backend URL**: http://localhost:8000
* 📖 **Swagger API Docs**: http://localhost:8000/docs

</details>

<details>
<summary>📂 <b>Folder Structure</b></summary>

```
Devscope-Ai/
├── frontend/                   # Next.js 14 App Router application
│   ├── src/
│   │   ├── app/                # Pages (Dashboard, GitHub, Resume, Interview, About)
│   │   ├── components/         # Glassmorphic components & Auth overlays
│   │   └── hooks/              # Auth guarding & route locks
│   └── Dockerfile
│
├── backend/                    # FastAPI python application
│   ├── app/
│   │   ├── api/v1/             # Endpoints (Auth, GitHub scanner, Resume ATS, Interview)
│   │   ├── agents/             # LangGraph multi-agent orchestrations
│   │   ├── models/             # SQLAlchemy ORM database models
│   │   └── core/               # App configuration, security, database sessions
│   └── Dockerfile
│
├── docker-compose.yml          # Container orchestration
└── README.md
```

</details>

<details>
<summary>🌐 <b>REST API Endpoints</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/signup` | Register a new user |
| `POST` | `/api/v1/auth/token` | Retrieve a secure JWT session token |
| `POST` | `/api/v1/auth/google-login` | Authenticate using Google OAuth |
| `GET` | `/api/v1/reports/latest` | Fetch user's active dashboard evaluation |
| `POST` | `/api/v1/github/analyze` | Start async GitHub analysis |
| `POST` | `/api/v1/resume/upload` | Parse resume and generate ATS scores |
| `POST` | `/api/v1/interview/start` | Start an interactive AI interview screen |
| `POST` | `/api/v1/interview/respond` | Grade a response and fetch follow-up question |

</details>

---

<div align="center">
  Built with ❤️ by <strong>Harshvardhan Mishra</strong>
  <br/>
  <sub>DevScope AI — Visualizing developer intelligence.</sub>
</div>
