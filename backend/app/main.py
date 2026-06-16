import os
import uuid
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from backend.app.core.config import settings
from backend.app.core.database import engine, Base, get_db
from backend.app.core.auth import get_password_hash, verify_password, create_access_token, get_current_user
from backend.app.models.models import User, Profile, GithubAccount, Repository, Resume, Report, Interview
from backend.app.schemas import schemas
from backend.app.services.github_agent import GithubAgent
from backend.app.services.resume_agent import ResumeAgent
from backend.app.services.recruiter_agent import RecruiterAgent
from backend.app.services.career_coach import CareerCoach
from backend.app.services.ml_engine import MLEngine
from backend.app.services.match_engine import MatchEngine
from backend.app.services.career_twin import CareerTwin

# Initialize database tables on startup (especially helpful for SQLite fallback)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0")

# CORS Setup for Next.js frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory to save uploaded resumes
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ----------------- AUTH ENDPOINTS -----------------

@app.post(f"{settings.API_V1_STR}/auth/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        is_active=True,
        is_superuser=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Initialize blank profile for the user
    profile = Profile(user_id=user.id, target_role="Full Stack Engineer", current_experience_years=2, skills_list=[])
    db.add(profile)
    db.commit()
    
    return user

@app.post(f"{settings.API_V1_STR}/auth/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# Schema for Google login payloads
class GoogleLoginRequest(BaseModel):
    email: str
    name: Optional[str] = None
    token: Optional[str] = None

@app.post(f"{settings.API_V1_STR}/auth/google-login", response_model=schemas.Token)
def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Invalid email payload")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Create user with a random password since authentication is managed by Google
        random_pwd = uuid.uuid4().hex
        hashed_password = get_password_hash(random_pwd)
        user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=payload.name or "Google User",
            is_active=True,
            is_superuser=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Provision profile
        profile = Profile(user_id=user.id, target_role="Full Stack Engineer", current_experience_years=2, skills_list=[])
        db.add(profile)
        db.commit()
        
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# ----------------- RESUME PARSER ENDPOINTS -----------------

@app.post(f"{settings.API_V1_STR}/resume/upload", response_model=schemas.ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")
        
    # Save file to upload directory
    file_ext = os.path.splitext(file.filename)[1]
    saved_filename = f"{profile.id}_{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, saved_filename)
    
    with open(file_path, "wb") as f:
        f.write(await file.read())
        
    # Process resume via agent
    analysis = ResumeAgent.parse_resume(file_path)
    
    # Save/Update Resume record
    resume = db.query(Resume).filter(Resume.profile_id == profile.id).first()
    if not resume:
        resume = Resume(profile_id=profile.id, file_path=file_path)
        db.add(resume)
        
    resume.ats_score = analysis["ats_score"]
    resume.resume_quality_score = analysis["resume_quality_score"]
    resume.extracted_text = analysis["extracted_text"]
    resume.structured_data = analysis["structured_data"]
    
    # Update profile skills from resume extraction
    skills = analysis["structured_data"].get("extracted_skills", [])
    profile.skills_list = skills
    if len(skills) > 0:
        profile.target_role = "Full Stack Engineer" # Default target role
        
    db.commit()
    db.refresh(resume)
    return resume

# ----------------- GITHUB SCANNERS -----------------

@app.post(f"{settings.API_V1_STR}/github/scan", response_model=schemas.GithubAccountResponse)
def scan_github(
    payload: schemas.GithubScanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")
        
    # Trigger GitHub agent parsing
    analysis = GithubAgent.analyze_profile(payload.username)
    
    # Save GitHub Account details
    github_acct = db.query(GithubAccount).filter(GithubAccount.profile_id == profile.id).first()
    if not github_acct:
        github_acct = GithubAccount(profile_id=profile.id, username=payload.username)
        db.add(github_acct)
        
    github_acct.username = payload.username
    github_acct.avatar_url = analysis["avatar_url"]
    github_acct.public_repos = analysis["public_repos"]
    github_acct.followers = analysis["followers"]
    github_acct.following = analysis["following"]
    github_acct.github_score = analysis["github_score"]
    github_acct.last_scanned = datetime.utcnow()
    
    db.commit()
    db.refresh(github_acct)
    
    # Clear old repositories and insert newly scanned repositories
    db.query(Repository).filter(Repository.github_account_id == github_acct.id).delete()
    for r in analysis["repositories"]:
        repo = Repository(
            github_account_id=github_acct.id,
            name=r["name"],
            html_url=r["html_url"],
            description=r["description"],
            stargazers_count=r["stargazers_count"],
            forks_count=r["forks_count"],
            primary_language=r["primary_language"],
            code_quality_score=r["code_quality_score"],
            documentation_score=r["documentation_score"],
            architecture_score=r["architecture_score"],
            security_score=r["security_score"]
        )
        db.add(repo)
        
    db.commit()
    db.refresh(github_acct)
    return github_acct

@app.get(f"{settings.API_V1_STR}/github/result/{{username}}", response_model=schemas.GithubAccountResponse)
def get_github_result(username: str, db: Session = Depends(get_db)):
    github_acct = db.query(GithubAccount).filter(GithubAccount.username == username).first()
    if not github_acct:
        raise HTTPException(status_code=404, detail="GitHub profile not found. Please scan it first.")
    return github_acct

# ----------------- REVIEWS, ROADS, AND ML REPORTS -----------------

@app.get(f"{settings.API_V1_STR}/reports/latest", response_model=schemas.ReportResponse)
def get_latest_report(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    github_acct = db.query(GithubAccount).filter(GithubAccount.profile_id == profile.id).first()
    resume = db.query(Resume).filter(Resume.profile_id == profile.id).first()
    
    github_score = github_acct.github_score if github_acct else 75
    ats_score = resume.ats_score if resume else 70
    skills = profile.skills_list if profile.skills_list else ["Python", "FastAPI"]
    
    # Calculate ML features
    overall_score = int((github_score + ats_score) / 2)
    skill_match_ratio = len([s for s in skills if s in ["Python", "React", "Docker", "FastAPI"]]) / 4.0
    if skill_match_ratio == 0:
        skill_match_ratio = 0.5
        
    # Execute ML inferences
    hiring_prob = MLEngine.predict_hiring_probability(
        github_score=github_score,
        resume_score=ats_score,
        experience_years=profile.current_experience_years,
        skill_match_ratio=skill_match_ratio
    )
    
    predicted_salary = MLEngine.predict_salary(
        experience_years=profile.current_experience_years,
        github_score=github_score,
        resume_score=ats_score,
        skill_count=len(skills)
    )
    
    # Execute Recruiter evaluation simulation
    recruiter_eval = RecruiterAgent.evaluate_candidate({
        "github_score": github_score,
        "ats_score": ats_score,
        "skills": skills,
        "experience_years": profile.current_experience_years
    })
    
    # Skill Gap & Roadmaps
    coach_roadmap = CareerCoach.analyze_skill_gap(skills, profile.target_role)
    
    # Strengths and Weaknesses derived from recruiter personas
    strengths = [
        "Strong Github engineering practices." if github_score >= 80 else "Regular repository commit cadence.",
        "ATS resume contains high-demand keyword matches." if ats_score >= 80 else "Solid education background."
    ]
    weaknesses = coach_roadmap["missing_skills"][:2]
    
    # Update or Create Report
    report = db.query(Report).filter(Report.profile_id == profile.id).order_by(Report.created_at.desc()).first()
    if not report:
        report = Report(profile_id=profile.id)
        db.add(report)
        
    report.overall_score = overall_score
    report.hiring_probability = hiring_prob
    report.predicted_salary = predicted_salary
    report.strengths = strengths
    report.weaknesses = weaknesses
    report.roadmap = {
        "verdict": recruiter_eval["verdict"],
        "personas": recruiter_eval["personas"],
        "plan_30_days": coach_roadmap["roadmap"]["plan_30_days"],
        "plan_90_days": coach_roadmap["roadmap"]["plan_90_days"],
        "plan_365_days": coach_roadmap["roadmap"]["plan_365_days"],
        "committee": recruiter_eval.get("committee", {})
    }
    
    db.commit()
    db.refresh(report)
    return report

# ----------------- INTERACTIVE INTERVIEW SIMULATOR -----------------

@app.post(f"{settings.API_V1_STR}/interview/start", response_model=schemas.InterviewResponse)
def start_interview(
    payload: schemas.InterviewStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    first_questions = {
        "HR": "Welcome! Tell me about yourself. What motivated you to transition into technology, and what kind of roles are you currently aiming for?",
        "Technical": "Let's dive in. Explain the difference between thread-safe processes and asynchronous tasks. How does FastAPI achieve asynchronous request handling?",
        "System Design": "Describe how you would design an API rate limiter capable of supporting 500,000 requests per second. What backend datastores and algorithms would you use?"
    }
    
    question = first_questions.get(payload.type, first_questions["Technical"])
    
    interview = Interview(
        profile_id=profile.id,
        type=payload.type,
        transcript=[{"role": "interviewer", "text": question}],
        score=0
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)
    
    return {
        "interview_id": interview.id,
        "question": question,
        "finished": False
    }

@app.post(f"{settings.API_V1_STR}/interview/respond", response_model=schemas.InterviewResponse)
def respond_interview(
    payload: schemas.InterviewSubmitAnswer,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == payload.interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found")
        
    # Append user response to transcript
    transcript = list(interview.transcript)
    transcript.append({"role": "user", "text": payload.user_response})
    
    user_replies_count = len([m for m in transcript if m["role"] == "user"])
    
    # Multi-turn check (finish after 3 responses)
    if user_replies_count >= 3:
        # Score the transcript based on keyword content and length density
        keywords_map = {
            "Technical": ["asgi", "wsgi", "async", "await", "concurrency", "thread", "process", "loop", "uvicorn", "starlette"],
            "System Design": ["redis", "token", "bucket", "limiter", "scale", "balancer", "database", "cache", "shard", "hashing", "cdn"],
            "HR": ["transition", "role", "growth", "learn", "collaborate", "team", "engineer", "culture"]
        }
        
        target_kws = keywords_map.get(interview.type, keywords_map["Technical"])
        user_responses = [m["text"].lower() for m in transcript if m["role"] == "user"]
        all_user_text = " ".join(user_responses)
        
        # 1. Detect negative phrasing and ignorance
        ignorance_phrases = [
            "i don't know", "i do not know", "no idea", "not sure", "don't understand", 
            "do not understand", "dunno", "can't explain", "cannot explain", "skip", 
            "pass", "forgot", "have no clue", "no clue", "don't recall"
        ]
        ignorance_count = sum(1 for phrase in ignorance_phrases if phrase in all_user_text)
        
        # 2. Count positive matched keywords (only if they aren't negated in context)
        matched_count = 0
        for kw in target_kws:
            if kw in all_user_text:
                kw_idx = all_user_text.find(kw)
                preceding_text = all_user_text[max(0, kw_idx - 30):kw_idx]
                negations = ["not", "don't", "dont", "no", "never", "can't", "cant", "unable", "without"]
                if any(neg in preceding_text for neg in negations):
                    continue
                matched_count += 1
                
        # 3. Base Score and Penalties
        base_score = 30
        if ignorance_count > 0:
            base_score -= 15 * ignorance_count
            
        score = base_score + (matched_count * 8)
        
        # Add length bonus only if ignorance count is 0 and they actually matched some keywords
        if ignorance_count == 0 and matched_count > 0:
            len_bonus = min(15, len(all_user_text.split()) // 10)
            score += len_bonus
        else:
            score -= min(10, len(all_user_text.split()) // 15)
            
        # Final clamping
        score = min(98, max(10, score))
        
        # If answers are extremely brief (under 12 words total)
        if len(all_user_text.split()) < 12:
            score = min(score, 35)
        
        transcript.append({
            "role": "interviewer",
            "text": f"Thank you for completing this mock interview. I've compiled your evaluation. Your score is {score}%."
        })
        interview.transcript = transcript
        interview.score = score
        db.commit()
        
        return {
            "interview_id": interview.id,
            "question": f"Interview complete! Final evaluation score: {score}%. Feel free to start a new session.",
            "finished": True
        }
        
    # Generate follow-up question
    follow_ups = [
        "That's a solid point. How would you handle database lock contentions under high load using that architecture?",
        "Interesting. How do you approach testing this setup? What is your strategy for writing robust integration tests?",
        "Understood. If you had to deploy this to production tomorrow, what observability metrics would you set up first?"
    ]
    next_question = follow_ups[user_replies_count - 1]
    
    transcript.append({"role": "interviewer", "text": next_question})
    interview.transcript = transcript
    db.commit()
    
    return {
        "interview_id": interview.id,
        "question": next_question,
        "finished": False
    }

# Schema for Job Match payloads
class JobMatchRequest(BaseModel):
    job_description: str

@app.get(f"{settings.API_V1_STR}/profile/public/{{username}}")
def get_public_profile(username: str, db: Session = Depends(get_db)):
    github_acct = db.query(GithubAccount).filter(GithubAccount.username == username).first()
    if not github_acct:
        # Dynamic fallback so that any username searched gets a valid mock public profile
        mock_res = GithubAgent._build_mock_result(username)
        # Create user / profile mock details
        mock_skills = ["Python", "FastAPI", "React", "Docker", "Redis"]
        recruiter_eval = RecruiterAgent.evaluate_candidate({
            "github_score": mock_res["github_score"],
            "ats_score": 88,
            "skills": mock_skills,
            "experience_years": 3
        })
        return {
            "username": username,
            "full_name": username.title(),
            "profile": {
                "target_role": "Full Stack Engineer",
                "experience_years": 3,
                "skills": mock_skills
            },
            "github": mock_res,
            "report": {
                "overall_score": 88,
                "hiring_probability": 0.88,
                "predicted_salary": 125000,
                "strengths": [
                    "Solid GitHub repository maturity score (Level 4/5).",
                    "Strong familiarity with asynchronous backend routers."
                ],
                "weaknesses": ["Kubernetes", "Terraform"],
                "committee": recruiter_eval.get("committee", {}),
                "roadmap": recruiter_eval
            },
            "career_twins": CareerTwin.simulate_all_tracks(mock_skills)
        }
        
    profile = db.query(Profile).filter(Profile.id == github_acct.profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile associated with GitHub handle not found.")
        
    # Get latest report, or generate if none exists
    report = db.query(Report).filter(Report.profile_id == profile.id).order_by(Report.created_at.desc()).first()
    if not report:
        # Generate default report
        resume = db.query(Resume).filter(Resume.profile_id == profile.id).first()
        github_score = github_acct.github_score or 75
        ats_score = resume.ats_score if resume else 70
        skills = profile.skills_list or ["Python", "FastAPI"]
        
        # Recruiter roundtable evaluation
        recruiter_eval = RecruiterAgent.evaluate_candidate({
            "github_score": github_score,
            "ats_score": ats_score,
            "skills": skills,
            "experience_years": profile.current_experience_years
        })
        
        # Skill gaps roadmap
        coach_roadmap = CareerCoach.analyze_skill_gap(skills, profile.target_role)
        
        overall_score = int((github_score + ats_score) / 2)
        hiring_prob = recruiter_eval["hiring_probability"]
        predicted_salary = 60000 + (profile.current_experience_years * 5000) + (overall_score * 400)
        
        report = Report(
            profile_id=profile.id,
            overall_score=overall_score,
            hiring_probability=hiring_prob,
            predicted_salary=predicted_salary,
            strengths=[
                "Strong Github engineering practices." if github_score >= 80 else "Regular repository commit cadence.",
                "ATS resume contains high-demand keyword matches." if ats_score >= 80 else "Solid education background."
            ],
            weaknesses=coach_roadmap["missing_skills"][:2],
            roadmap=recruiter_eval
        )
        db.add(report)
        db.commit()
        db.refresh(report)

    # Gather repository metrics
    repos = db.query(Repository).filter(Repository.github_account_id == github_acct.id).all()
    repos_data = []
    
    for idx, r in enumerate(repos):
        base_score = 70 + min(20, r.stargazers_count * 2 + r.forks_count * 3)
        maturity_level, explanation = GithubAgent._get_maturity_details(idx, base_score)
        assessment = GithubAgent._get_assessment_scores(base_score, maturity_level)
        reviewer = GithubAgent._get_reviewer_feedback(r.name, r.primary_language, maturity_level)
        
        repos_data.append({
            "name": r.name,
            "html_url": r.html_url,
            "description": r.description,
            "stargazers_count": r.stargazers_count,
            "forks_count": r.forks_count,
            "primary_language": r.primary_language,
            "code_quality_score": r.code_quality_score,
            "documentation_score": r.documentation_score,
            "architecture_score": r.architecture_score,
            "security_score": r.security_score,
            "maturity_level": maturity_level,
            "maturity_explanation": explanation,
            "assessment": assessment,
            "reviewer": reviewer
        })
        
    github_data = {
        "username": github_acct.username,
        "avatar_url": github_acct.avatar_url,
        "public_repos": github_acct.public_repos,
        "followers": github_acct.followers,
        "following": github_acct.following,
        "github_score": github_acct.github_score,
        "engineering_score": min(98, int(github_acct.github_score * 0.98)),
        "architecture_score": min(98, int(github_acct.github_score * 0.95)),
        "code_quality_score": min(98, int(github_acct.github_score * 0.96)),
        "collaboration_score": min(98, int(github_acct.github_score * 0.92)),
        "open_source_impact_score": min(98, int(github_acct.github_score * 0.88)),
        "repositories": repos_data,
        "open_source": {
            "reputation_score": min(98, int(github_acct.github_score * 0.87)),
            "community_impact_score": min(98, int(github_acct.github_score * 0.85)),
            "contributor_reliability_score": min(98, int(github_acct.github_score * 0.94)),
            "leadership_score": min(98, int(github_acct.github_score * 0.78)),
            "merged_pull_requests": 14,
            "issues_resolved": 32
        }
    }

    # Recruiter roundtable evaluation
    recruiter_eval = RecruiterAgent.evaluate_candidate({
        "github_score": github_acct.github_score,
        "ats_score": report.overall_score * 2 - github_acct.github_score,
        "skills": profile.skills_list,
        "experience_years": profile.current_experience_years
    })

    # Prepare public response payload
    return {
        "username": username,
        "full_name": profile.user.full_name if profile.user else username,
        "profile": {
            "target_role": profile.target_role,
            "experience_years": profile.current_experience_years,
            "skills": profile.skills_list
        },
        "github": github_data,
        "report": {
            "overall_score": report.overall_score,
            "hiring_probability": report.hiring_probability,
            "predicted_salary": float(report.predicted_salary) if report.predicted_salary else 95000,
            "strengths": report.strengths,
            "weaknesses": report.weaknesses,
            "committee": recruiter_eval.get("committee", {}),
            "roadmap": report.roadmap
        },
        "career_twins": CareerTwin.simulate_all_tracks(profile.skills_list)
    }

@app.post(f"{settings.API_V1_STR}/match/job-description")
def match_job_description(
    payload: JobMatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")
        
    resume = db.query(Resume).filter(Resume.profile_id == profile.id).first()
    resume_text = resume.extracted_text if resume else ""
    
    match_results = MatchEngine.compare_job(
        skills=profile.skills_list,
        experience=profile.current_experience_years,
        resume_text=resume_text,
        job_desc=payload.job_description
    )
    return match_results

@app.get(f"{settings.API_V1_STR}/recruiter/candidates")
def list_candidates(db: Session = Depends(get_db)):
    github_accounts = db.query(GithubAccount).all()
    candidates = []
    
    for acct in github_accounts:
        profile = db.query(Profile).filter(Profile.id == acct.profile_id).first()
        if not profile:
            continue
            
        report = db.query(Report).filter(Report.profile_id == profile.id).order_by(Report.created_at.desc()).first()
        overall_score = report.overall_score if report else acct.github_score
        hiring_prob = report.hiring_probability if report else 0.75
        
        # Resolve verdict
        verdict = "Maybe"
        if report and isinstance(report.roadmap, dict) and "verdict" in report.roadmap:
            verdict = report.roadmap["verdict"]
        elif report and isinstance(report.roadmap, dict) and "committee" in report.roadmap and "verdict" in report.roadmap["committee"]:
            verdict = report.roadmap["committee"]["verdict"]
            
        candidates.append({
            "username": acct.username,
            "full_name": profile.user.full_name if profile.user else acct.username,
            "email": profile.user.email if profile.user else "",
            "github_score": acct.github_score,
            "overall_score": overall_score,
            "hiring_probability": hiring_prob,
            "verdict": verdict,
            "skills": profile.skills_list
        })
        
    # If database is empty, add some premium mock candidates so the Recruiter Dashboard is fully active
    if not candidates:
        mock_names = [
            ("jane_dev", "Jane Doe", "jane.doe@gmail.com", 91, 92, 0.94, "Strong Hire", ["Python", "FastAPI", "React", "Docker", "AWS"]),
            ("bob_sys", "Bob Architect", "bob.systems@gmail.com", 88, 87, 0.85, "Hire", ["Go", "Kubernetes", "Docker", "Terraform", "CI/CD"]),
            ("alice_ml", "Alice Vance", "alice.ml@gmail.com", 94, 93, 0.95, "Strong Hire", ["Python", "PyTorch", "Transformers", "Scikit-Learn"])
        ]
        for username, full_name, email, github_score, overall_score, hiring_prob, verdict, skills in mock_names:
            candidates.append({
                "username": username,
                "full_name": full_name,
                "email": email,
                "github_score": github_score,
                "overall_score": overall_score,
                "hiring_probability": hiring_prob,
                "verdict": verdict,
                "skills": skills
            })
            
    return candidates
