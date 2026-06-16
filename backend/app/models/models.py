import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, JSON, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.core.database import Base

# Helper function to generate UUIDs in a DB-agnostic manner
def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    target_role = Column(String(100), default="Full Stack Engineer")
    current_experience_years = Column(Integer, default=0)
    skills_list = Column(JSON, default=list) # List of strings
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="profile")
    github_account = relationship("GithubAccount", back_populates="profile", uselist=False, cascade="all, delete-orphan")
    resume = relationship("Resume", back_populates="profile", uselist=False, cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="profile", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="profile", cascade="all, delete-orphan")

class GithubAccount(Base):
    __tablename__ = "github_accounts"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    username = Column(String(100), nullable=False, index=True)
    avatar_url = Column(String(500), nullable=True)
    public_repos = Column(Integer, default=0)
    followers = Column(Integer, default=0)
    following = Column(Integer, default=0)
    github_score = Column(Integer, default=0)
    last_scanned = Column(DateTime, nullable=True)
    
    profile = relationship("Profile", back_populates="github_account")
    repositories = relationship("Repository", back_populates="github_account", cascade="all, delete-orphan")

class Repository(Base):
    __tablename__ = "repositories"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    github_account_id = Column(String(36), ForeignKey("github_accounts.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    html_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    stargazers_count = Column(Integer, default=0)
    forks_count = Column(Integer, default=0)
    primary_language = Column(String(50), nullable=True)
    
    # Detailed scoring components
    code_quality_score = Column(Integer, default=0)
    documentation_score = Column(Integer, default=0)
    architecture_score = Column(Integer, default=0)
    security_score = Column(Integer, default=0)
    
    github_account = relationship("GithubAccount", back_populates="repositories")

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    file_path = Column(String(500), nullable=False)
    ats_score = Column(Integer, default=0)
    resume_quality_score = Column(Integer, default=0)
    extracted_text = Column(Text, nullable=True)
    structured_data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    profile = relationship("Profile", back_populates="resume")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    overall_score = Column(Integer, nullable=False, default=0)
    hiring_probability = Column(Float, nullable=False, default=0.0)
    predicted_salary = Column(Numeric(12, 2), nullable=True)
    strengths = Column(JSON, default=list) # List of strings
    weaknesses = Column(JSON, default=list) # List of strings
    roadmap = Column(JSON, default=dict) # Roadmap steps config
    created_at = Column(DateTime, default=datetime.utcnow)
    
    profile = relationship("Profile", back_populates="reports")

class Interview(Base):
    __tablename__ = "interviews"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(100), default="General Technical") # e.g. HR, Technical, System Design
    transcript = Column(JSON, default=list) # List of Q&A dicts: [{"speaker": "interviewer"/"user", "text": "..."}]
    score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    profile = relationship("Profile", back_populates="interviews")
