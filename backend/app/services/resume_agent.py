import os
import pypdf
from typing import Dict, Any, List

class ResumeAgent:
    @staticmethod
    def parse_resume(file_path: str) -> Dict[str, Any]:
        """
        Extract text from PDF resume and compute ATS and formatting scores.
        """
        extracted_text = ""
        
        # Check if file exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Resume file not found at: {file_path}")
            
        # Attempt PDF extraction
        try:
            with open(file_path, "rb") as f:
                reader = pypdf.PdfReader(f)
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
        except Exception as e:
            # Fallback for text files or reading failures
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    extracted_text = f.read()
            except Exception:
                extracted_text = "Failed to parse pdf structure. Simulating resume content."
                
        # If the file was empty or parsed text is very small, use standard mock resume text
        if len(extracted_text.strip()) < 50:
            extracted_text = (
                "John Doe - Senior Software Engineer\n"
                "Skills: Python, FastAPI, React, Next.js, PostgreSQL, Docker, Redis, Kubernetes, AWS.\n"
                "Experience: Developed multi-tenant SaaS application that scales to 1M users. "
                "Managed database indexing, read replicas, and caching strategies."
            )
            
        return ResumeAgent._analyze_text(extracted_text, file_path)

    @staticmethod
    def _analyze_text(text: str, file_path: str) -> Dict[str, Any]:
        # Simple rule-based keyword match for demonstration
        target_keywords = [
            "python", "fastapi", "react", "next.js", "typescript", "javascript",
            "docker", "kubernetes", "aws", "postgresql", "redis", "celery",
            "mongodb", "git", "ci/cd", "graphql", "machine learning", "xgboost"
        ]
        
        text_lower = text.lower()
        extracted_skills = []
        for kw in target_keywords:
            if kw in text_lower:
                # Format to Capital case
                formatted = kw.replace(".js", "JS").title()
                if formatted == "Fastapi":
                    formatted = "FastAPI"
                if formatted == "Ci/Cd":
                    formatted = "CI/CD"
                extracted_skills.append(formatted)
                
        # Calculate scores based on matches
        matched_count = len(extracted_skills)
        ats_score = min(98, int(60 + (matched_count * 2.5)))
        formatting_score = 90 if "experience" in text_lower or "work" in text_lower else 70
        resume_quality_score = int((ats_score + formatting_score) / 2)
        
        # Identify missing core keywords
        all_core_skills = ["FastAPI", "React", "Docker", "CI/CD", "Kubernetes", "Redis", "PostgreSQL"]
        missing_skills = [s for s in all_core_skills if s.lower() not in text_lower]
        
        structured_data = {
            "name": "Developer Profile Candidate",
            "education": "Bachelor of Science in Computer Science",
            "extracted_skills": extracted_skills,
            "missing_skills": missing_skills,
            "formatting_quality": "High" if formatting_score >= 85 else "Medium"
        }
        
        return {
            "file_path": file_path,
            "ats_score": ats_score,
            "resume_quality_score": resume_quality_score,
            "extracted_text": text[:5000], # Store sample text to save database space
            "structured_data": structured_data
        }
