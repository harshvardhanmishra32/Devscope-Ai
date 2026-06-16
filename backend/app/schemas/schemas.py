from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool
    is_superuser: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Profile Schemas ---
class ProfileBase(BaseModel):
    target_role: str = "Full Stack Engineer"
    current_experience_years: int = 0
    skills_list: List[str] = []

class ProfileCreate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- GitHub Schemas ---
class GithubScanRequest(BaseModel):
    username: str

class RepositoryResponse(BaseModel):
    id: str
    name: str
    html_url: Optional[str] = None
    description: Optional[str] = None
    stargazers_count: int
    forks_count: int
    primary_language: Optional[str] = None
    code_quality_score: int
    documentation_score: int
    architecture_score: int
    security_score: int

    class Config:
        from_attributes = True

class GithubAccountResponse(BaseModel):
    id: str
    username: str
    avatar_url: Optional[str] = None
    public_repos: int
    followers: int
    following: int
    github_score: int
    last_scanned: Optional[datetime] = None
    repositories: List[RepositoryResponse] = []

    class Config:
        from_attributes = True

# --- Resume Schemas ---
class ResumeResponse(BaseModel):
    id: str
    file_path: str
    ats_score: int
    resume_quality_score: int
    extracted_text: Optional[str] = None
    structured_data: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True

# --- Report Schemas ---
class ReportResponse(BaseModel):
    id: str
    overall_score: int
    hiring_probability: float
    predicted_salary: Optional[float] = None
    strengths: List[str] = []
    weaknesses: List[str] = []
    roadmap: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True

# --- Interview Schemas ---
class InterviewStartRequest(BaseModel):
    type: str = "General Technical"

class InterviewResponse(BaseModel):
    interview_id: str
    question: str
    finished: bool = False

class InterviewSubmitAnswer(BaseModel):
    interview_id: str
    user_response: str
