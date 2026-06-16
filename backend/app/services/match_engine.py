from typing import Dict, Any, List

class MatchEngine:
    @staticmethod
    def compare_job(skills: List[str], experience: int, resume_text: str, job_desc: str) -> Dict[str, Any]:
        """
        Compare user skills and profile against pasted Job Description (JD).
        Returns Match Score, ATS Match Score, Technical Match Score, Skill Gap Score,
        Hiring/Interview Probability, Missing Skills, and an AI Rejection Diagnosis.
        """
        if not job_desc:
            return {
                "match_score": 0,
                "ats_match_score": 0,
                "technical_match_score": 0,
                "skill_gap_score": 0,
                "hiring_probability": 0.0,
                "interview_probability": 0.0,
                "missing_skills": [],
                "roadmap": {},
                "diagnosis": {}
            }

        job_desc_lower = job_desc.lower()
        
        # Standard high-demand technology terms to search in JD
        tech_terms = [
            "python", "javascript", "typescript", "rust", "go", "fastapi", "react", "next.js", "nextjs",
            "vue", "angular", "django", "flask", "postgresql", "postgres", "mysql", "mongodb", "redis",
            "docker", "kubernetes", "k8s", "aws", "gcp", "azure", "terraform", "ci/cd", "github actions",
            "prometheus", "grafana", "sentry", "celery", "graphql", "rest api", "testing", "pytest", "jest"
        ]
        
        # Identify expected tech stack required by JD
        required_tech = [term for term in tech_terms if term in job_desc_lower]
        if not required_tech:
            # Fallback expected stack if JD is vague
            required_tech = ["python", "fastapi", "docker", "postgresql"]
            
        user_skills_lower = [s.lower() for s in skills]
        
        # Calculate matches and gaps
        matching_tech = [tech for tech in required_tech if tech in user_skills_lower]
        missing_tech = [tech for tech in required_tech if tech not in user_skills_lower]
        
        # Match scores
        match_count = len(matching_tech)
        total_req_count = len(required_tech)
        
        ratio = match_count / total_req_count if total_req_count > 0 else 0.5
        
        # Compute scores out of 100
        ats_score = int(60 + (ratio * 30) + (10 if experience >= 3 else 5))
        ats_score = min(98, max(45, ats_score))
        
        tech_score = int(50 + (ratio * 40) + (8 if len(skills) > 5 else 4))
        tech_score = min(98, max(40, tech_score))
        
        overall_match = int((ats_score + tech_score) / 2)
        skill_gap_score = int(100 - (ratio * 100))
        
        hiring_prob = round(float(overall_match / 100.0) * 0.95, 2)
        interview_prob = round(float(ats_score / 100.0) * 0.90, 2)
        
        # Capitalize technologies for clean presentation
        missing_tech_display = [t.title() if t not in ["k8s", "aws", "gcp", "saas", "api"] else t.upper() for t in missing_tech]
        
        # Personalized 30-60-90 Day improvement roadmap
        roadmap = {
            "plan_30_days": [
                f"Obtain foundational proficiency in: {', '.join(missing_tech_display[:2]) if missing_tech_display else 'Advanced Architecture'}.",
                "Build a small, clean repository demonstrating implementation of these tools."
            ],
            "plan_90_days": [
                f"Integrate {missing_tech_display[2] if len(missing_tech_display) > 2 else 'CI/CD workflows'} into your existing codebases.",
                "Configure end-to-end unit testing scripts and create containerization setups."
            ],
            "plan_365_days": [
                "Deploy a multi-stage production environment on cloud services (AWS/GCP).",
                "Apply for target engineering roles and highlight your restructured projects on your resume."
            ]
        }
        
        # Rejection Diagnosis ("Why You Are Not Getting Interviews")
        rejection_reasons = []
        action_plan = []
        
        if len(missing_tech) > 0:
            rejection_reasons.append(f"Missing core technology requirements: {', '.join(missing_tech_display[:3])} are required by the target job description but absent from your skills list.")
            action_plan.append(f"Add projects utilizing {missing_tech_display[0]} to your GitHub profile and update your resume skills section.")
            
        if experience < 3:
            rejection_reasons.append("Years of experience is below preferred range. Automated ATS filters may flag profiles with under 3 years of experience.")
            action_plan.append("Tailor your resume to reflect impact metrics and project complexity rather than focusing solely on timeline durations.")
            
        if "pytest" not in user_skills_lower and "testing" not in user_skills_lower:
            rejection_reasons.append("No automated testing coverage found. Senior recruiters search for 'Pytest', 'Jest', or 'Testing' to verify production readiness.")
            action_plan.append("Add unit tests to your distributed repositories using Pytest/Jest and showcase code coverage statistics in README files.")
            
        if "docker" not in user_skills_lower and "kubernetes" not in user_skills_lower:
            rejection_reasons.append("Lacks deployment/containerization experience. Many tech scale-ups filter out backend candidates without Docker skills.")
            action_plan.append("Write a Multi-Stage Dockerfile for your main backend APIs and push it to your repository.")

        # Default fallback reasons if they are perfect
        if not rejection_reasons:
            rejection_reasons = [
                "ATS formatting issues: Some automated parsers fail to extract text from multi-column PDF layouts.",
                "Lack of active community open source contribution cadences on your GitHub profile."
            ]
            action_plan = [
                "Export your resume in a clean single-column structure.",
                "Submit pull requests to popular repositories or build open source toolkits."
            ]
            
        diagnosis = {
            "rejection_reasons": rejection_reasons,
            "action_plan": action_plan,
            "rejection_probability": round(1.0 - hiring_prob, 2),
            "recommends_revision": bool(overall_match < 80)
        }
        
        return {
            "match_score": overall_match,
            "ats_match_score": ats_score,
            "technical_match_score": tech_score,
            "skill_gap_score": skill_gap_score,
            "hiring_probability": hiring_prob,
            "interview_probability": interview_prob,
            "missing_skills": missing_tech_display,
            "roadmap": roadmap,
            "diagnosis": diagnosis
        }
