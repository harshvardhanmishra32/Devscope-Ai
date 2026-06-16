# API Design Specification — DevScope AI

All API endpoints follow REST conventions and communicate over HTTPS. Input and output bodies are formatted in JSON. Async requests return standard Task IDs to query status.

---

## 1. Authentication & Session Management

### POST `/api/v1/auth/signup`
Creates a new user account.
* **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword123!",
    "full_name": "John Doe"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "id": "e8a71d79-24cc-4043-bc02-18d2de0ab8bf",
    "email": "user@example.com",
    "full_name": "John Doe",
    "is_active": true
  }
  ```

### POST `/api/v1/auth/token`
Generates a JWT access token.
* **Request (Form Data)**:
  * `username`: `user@example.com`
  * `password`: `StrongPassword123!`
* **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
  ```

---

## 2. Resume Upload & Processing

### POST `/api/v1/resume/upload`
Uploads a developer resume (PDF/DOCX). Begins async evaluation task.
* **Request**: Multipart Form Data with file.
* **Headers**: `Authorization: Bearer <token>`
* **Response (202 Accepted)**:
  ```json
  {
    "task_id": "resume-task-99b823e2",
    "status": "PENDING",
    "message": "Resume file uploaded successfully. Parsing started."
  }
  ```

### GET `/api/v1/resume/status/{task_id}`
Checks the execution progress of the background resume parser.
* **Response (200 OK)**:
  ```json
  {
    "task_id": "resume-task-99b823e2",
    "status": "SUCCESS",
    "progress": 100,
    "result": {
      "ats_score": 88,
      "skills_extracted": ["Python", "FastAPI", "Docker", "React"],
      "missing_keywords": ["CI/CD", "Kubernetes"],
      "formatting_quality": "High"
    }
  }
  ```

---

## 3. GitHub Scanning Engine

### POST `/api/v1/github/scan`
Triggers full repository scanning and metadata analysis.
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "username": "octocat"
  }
  ```
* **Response (202 Accepted)**:
  ```json
  {
    "task_id": "github-task-f4a21199",
    "status": "PROCESSING",
    "message": "GitHub repository scanning initiated."
  }
  ```

### GET `/api/v1/github/result/{username}`
Returns cached scanning metrics, documentation score, and star metrics.
* **Response (200 OK)**:
  ```json
  {
    "username": "octocat",
    "github_score": 85,
    "repository_count": 12,
    "commit_frequency_monthly": 42,
    "scores": {
      "code_quality": 82,
      "documentation": 90,
      "architecture": 78,
      "collaboration": 88
    }
  }
  ```

---

## 4. Recruiter decisions and Career Roadmap

### GET `/api/v1/recruiter/verdict`
Runs AI recruiter simulation (EM, Recruiter, CTO personas) and predicts hiring probability.
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "verdict": "Strong Hire",
    "hiring_probability": 0.92,
    "predicted_salary_range": {
      "min": 120000,
      "max": 145000,
      "currency": "USD"
    },
    "personas": {
      "technical_recruiter": "Great resume structure. Immediate skill matches.",
      "engineering_manager": "Excellent GitHub testing practices. High code quality.",
      "cto": "Shows startup compatibility and open source drive. Strong architectural skills."
    }
  }
  ```

### GET `/api/v1/career/roadmap`
Computes skill gaps and displays personalized career progression timelines.
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "target_role": "AI Engineer",
    "current_skills": ["Python", "Pandas"],
    "missing_skills": ["LangChain", "Vector Databases", "PyTorch"],
    "plan_30_days": [
      "Learn basic vector math and embeddings.",
      "Integrate ChromaDB into an existing repository."
    ],
    "plan_90_days": [
      "Build a multi-agent workflow using LangGraph.",
      "Familiarize with PyTorch tensor workflows."
    ],
    "plan_365_days": [
      "Publish an open-source library or tool in the LLM ecosystem.",
      "Transition into a production AI Engineering role."
    ]
  }
  ```

---

## 5. Mock Interview Simulator

### POST `/api/v1/interview/start`
Initializes a new interactive interview session.
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "type": "System Design",
    "role": "Backend Engineer"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "interview_id": "interview-cd012",
    "question": "How would you design a rate limiter that supports millions of requests per second for a SaaS API gateway?"
  }
  ```

### POST `/api/v1/interview/respond`
Submits user reply and fetches follow-up questions from the interviewer agent.
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "interview_id": "interview-cd012",
    "user_response": "I would use a Redis cluster using a token bucket algorithm to rate limit users globally."
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "interviewer_response": "Good choice. How do you handle synchronization issues across redis shards when multiple requests hit concurrently?",
    "finished": false
  }
  ```
