from typing import Dict, Any, List

class CareerTwin:
    TRACK_EXPECTATIONS = {
        "Backend Engineer": {
            "skills": ["Python", "FastAPI", "SQLAlchemy", "PostgreSQL", "Redis", "Docker", "CI/CD", "Celery", "System Design"],
            "projects": ["Distributed Task Runner with Redis", "API Gateway & Rate Limiter", "Relational Database Clustering"],
            "certifications": ["AWS Certified Developer - Associate", "PostgreSQL Professional Cert"]
        },
        "AI Engineer": {
            "skills": ["Python", "PyTorch", "LangChain", "Vector Databases", "ChromaDB", "Transformers", "Pandas", "Scikit-Learn", "LLM Fine-Tuning"],
            "projects": ["RAG QA System over PDF documents", "Fine-tuned Llama Text Classification", "Predictive Analytics pipeline"],
            "certifications": ["TensorFlow Developer Certificate", "Google Cloud Professional Machine Learning Engineer"]
        },
        "DevOps Engineer": {
            "skills": ["Docker", "Kubernetes", "Terraform", "AWS", "CI/CD", "GitHub Actions", "Prometheus", "Grafana", "Linux", "Shell Scripting"],
            "projects": ["Auto-scaling K8s Microservice Deployments", "Infrastructure-as-code deployment via Terraform", "Centralized Grafana Observability Dashboard"],
            "certifications": ["Certified Kubernetes Administrator (CKA)", "AWS Certified DevOps Engineer - Professional"]
        }
    }

    @staticmethod
    def simulate_transition(skills: List[str], target_track: str) -> Dict[str, Any]:
        """
        Simulate a career transition for a developer profile into target track.
        Returns missing skills, recommended projects/certs, time duration, and success probability.
        """
        track = target_track if target_track in CareerTwin.TRACK_EXPECTATIONS else "Backend Engineer"
        config = CareerTwin.TRACK_EXPECTATIONS[track]
        
        user_skills_lower = [s.lower() for s in skills]
        
        missing_skills = []
        matching_skills = []
        for s in config["skills"]:
            if s.lower() in user_skills_lower:
                matching_skills.append(s)
            else:
                missing_skills.append(s)
                
        # Calculate transition time (e.g. 4 weeks per missing skill, base 4 weeks)
        missing_count = len(missing_skills)
        time_required_weeks = max(4, missing_count * 4)
        
        # Calculate transition success probability
        success_prob = 0.95 - (missing_count * 0.06)
        success_prob = round(max(0.35, min(0.95, success_prob)), 2)
        
        return {
            "track_name": track,
            "target_skills": config["skills"],
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "time_required_weeks": time_required_weeks,
            "required_projects": config["projects"],
            "required_certifications": config["certifications"],
            "success_probability": success_prob
        }

    @staticmethod
    def simulate_all_tracks(skills: List[str]) -> Dict[str, Any]:
        """
        Return transition stats for all tracks.
        """
        return {
            "backend": CareerTwin.simulate_transition(skills, "Backend Engineer"),
            "ai": CareerTwin.simulate_transition(skills, "AI Engineer"),
            "devops": CareerTwin.simulate_transition(skills, "DevOps Engineer")
        }
