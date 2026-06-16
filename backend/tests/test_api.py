import os
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.main import app, get_db
from backend.app.core.database import Base
from backend.app.services.ml_engine import MLEngine
from backend.app.services.github_agent import GithubAgent
from backend.app.services.resume_agent import ResumeAgent

# 1. Database Setup for Testing (SQLite InMemory for isolation)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test.db"):
        os.remove("./test.db")

@pytest.fixture(scope="module")
def auth_headers():
    """
    Fixture to create a unique test user and return authorization headers.
    """
    client = TestClient(app)
    unique_email = f"user_{uuid.uuid4().hex}@example.com"
    password = "securepassword123"
    
    # Register user
    signup_resp = client.post(
        "/api/v1/auth/signup",
        json={"email": unique_email, "password": password, "full_name": "Test User"}
    )
    assert signup_resp.status_code == 201
    
    # Fetch token
    login_resp = client.post(
        "/api/v1/auth/token",
        data={"username": unique_email, "password": password}
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

client = TestClient(app)

# ----------------- UNIT TESTS -----------------

def test_github_agent_mock():
    res = GithubAgent.analyze_profile("testuser")
    assert res["username"] == "testuser"
    assert "repositories" in res
    assert len(res["repositories"]) > 0
    assert res["github_score"] > 0

def test_resume_agent_mock(tmp_path):
    resume_file = tmp_path / "resume.txt"
    resume_file.write_text("Resume of Alice. Skills: Python, FastAPI, Docker, PostgreSQL.")
    
    res = ResumeAgent.parse_resume(str(resume_file))
    assert res["ats_score"] > 60
    assert "Python" in res["structured_data"]["extracted_skills"]
    assert "FastAPI" in res["structured_data"]["extracted_skills"]

def test_ml_engine():
    prob = MLEngine.predict_hiring_probability(85, 90, 3, 0.8)
    assert 0.0 <= prob <= 1.0
    
    salary = MLEngine.predict_salary(5, 80, 85, 6)
    assert salary > 50000

# ----------------- INTEGRATION TESTS -----------------

def test_signup_and_login():
    unique_email = f"user_{uuid.uuid4().hex}@example.com"
    password = "securepassword123"
    
    signup_resp = client.post(
        "/api/v1/auth/signup",
        json={"email": unique_email, "password": password, "full_name": "New User"}
    )
    assert signup_resp.status_code == 201

    login_resp = client.post(
        "/api/v1/auth/token",
        data={"username": unique_email, "password": password}
    )
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

def test_github_scan(auth_headers):
    resp = client.post(
        "/api/v1/github/scan",
        json={"username": "testdeveloper"},
        headers=auth_headers
    )
    assert resp.status_code == 200
    assert resp.json()["username"] == "testdeveloper"
    assert resp.json()["github_score"] > 0

def test_latest_report(auth_headers):
    # Scan Github first to populate data
    client.post("/api/v1/github/scan", json={"username": "testdeveloper"}, headers=auth_headers)
    
    resp = client.get("/api/v1/reports/latest", headers=auth_headers)
    assert resp.status_code == 200
    assert "overall_score" in resp.json()
    assert "predicted_salary" in resp.json()
    assert "roadmap" in resp.json()

def test_mock_interview(auth_headers):
    start_resp = client.post(
        "/api/v1/interview/start",
        json={"type": "Technical"},
        headers=auth_headers
    )
    assert start_resp.status_code == 200
    assert "interview_id" in start_resp.json()
    assert not start_resp.json()["finished"]
    
    interview_id = start_resp.json()["interview_id"]
    
    resp = client.post(
        "/api/v1/interview/respond",
        json={"interview_id": interview_id, "user_response": "FastAPI runs asynchronously using ASGI servers like Uvicorn."},
        headers=auth_headers
    )
    assert resp.status_code == 200
    assert not resp.json()["finished"]
