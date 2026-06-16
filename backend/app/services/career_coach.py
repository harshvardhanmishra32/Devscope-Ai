from typing import Dict, Any, List

class CareerCoach:
    ROLE_EXPECTATIONS = {
        "Backend Engineer": ["Python", "FastAPI", "SQLAlchemy", "PostgreSQL", "Redis", "Docker", "CI/CD", "Celery"],
        "Frontend Engineer": ["React", "Next.js", "TypeScript", "Tailwind CSS", "Zustand", "Redux", "Jest", "ESLint"],
        "Full Stack Engineer": ["Python", "FastAPI", "React", "Next.js", "TypeScript", "PostgreSQL", "Docker", "Tailwind CSS"],
        "DevOps Engineer": ["Docker", "Kubernetes", "Terraform", "AWS", "CI/CD", "GitHub Actions", "Prometheus", "Linux"],
        "AI Engineer": ["Python", "PyTorch", "LangChain", "Vector Databases", "ChromaDB", "Transformers", "Pandas", "Scikit-Learn"]
    }

    @staticmethod
    def analyze_skill_gap(skills: List[str], target_role: str) -> Dict[str, Any]:
        """
        Evaluate user skills against expected industry standards.
        Returns missing skills and customized growth timelines.
        """
        role = target_role if target_role in CareerCoach.ROLE_EXPECTATIONS else "Backend Engineer"
        expected_skills = CareerCoach.ROLE_EXPECTATIONS[role]
        
        user_skills_lower = [s.lower() for s in skills]
        missing_skills = []
        matching_skills = []
        
        for s in expected_skills:
            if s.lower() in user_skills_lower:
                matching_skills.append(s)
            else:
                missing_skills.append(s)
                
        # Handle cases where user has zero skills matched
        if not missing_skills:
            missing_skills = ["Advanced System Design", "Microservices Optimization", "Performance Benchmarking"]
            
        # Build roadmap milestones
        roadmap = {
            "plan_30_days": [
                f"Master core fundamentals of: {', '.join(missing_skills[:2])}.",
                "Build a micro-project implementing these skills and push to GitHub."
            ],
            "plan_90_days": [
                f"Learn intermediate architectural patterns of: {', '.join(missing_skills[2:4]) if len(missing_skills) > 2 else 'System scaling'}.",
                "Integrate continuous testing, linting, and Docker containerization into your repository."
            ],
            "plan_365_days": [
                f"Transition your full project infrastructure to cloud architectures using {expected_skills[-1] if expected_skills else 'modern deployment patterns'}.",
                f"Acquire target certifications related to {role} and start contributing to relevant open-source libraries."
            ]
        }
        
        return {
            "target_role": role,
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "roadmap": roadmap
        }
