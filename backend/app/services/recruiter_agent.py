from typing import Dict, Any, List

class RecruiterAgent:
    @staticmethod
    def evaluate_candidate(profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate candidate profile through a simulated 6-agent Hiring Committee roundtable:
        - Technical Recruiter Agent
        - Engineering Manager Agent
        - Senior Engineer Agent
        - Staff Systems Architect Agent
        - Startup CTO Agent
        - HR Director Agent
        """
        github_score = profile_data.get("github_score", 70)
        ats_score = profile_data.get("ats_score", 70)
        skills = profile_data.get("skills", [])
        experience = profile_data.get("experience_years", 2)
        
        # 1. Technical Recruiter Agent
        recruiter_vote, recruiter_conf = RecruiterAgent._get_vote(ats_score * 0.95 + len(skills) * 0.5)
        recruiter_report = {
            "name": "Sarah Jenkins",
            "role": "Technical Recruiter",
            "vote": recruiter_vote,
            "confidence": recruiter_conf,
            "strengths": [
                f"Matches critical keywords like {', '.join(skills[:3]) if skills else 'Python, FastAPI'}.",
                f"Structured ATS formatting (ATS rating: {ats_score}%)."
            ],
            "risks": [
                "Lacks formal university degree if not highlighted." if ats_score < 75 else "Short tenure in previous roles."
            ],
            "recommendations": "Recommend proceeding to technical screening immediately."
        }

        # 2. Engineering Manager Agent
        em_vote, em_conf = RecruiterAgent._get_vote(github_score * 0.6 + experience * 4 + ats_score * 0.2)
        em_report = {
            "name": "Marcus Vance",
            "role": "Engineering Manager",
            "vote": em_vote,
            "confidence": em_conf,
            "strengths": [
                f"Demonstrates active GitHub presence (Score: {github_score}%).",
                f"Has {experience} years of hands-on software development experience."
            ],
            "risks": [
                "Needs to demonstrate experience mentoring junior engineers." if experience < 4 else "Commit history shows minor documentation gaps."
            ],
            "recommendations": "Assess team collaboration skills during the behavioral interview."
        }

        # 3. Senior Engineer Agent
        sen_score = github_score * 0.85 + (10 if any(s.lower() in ["python", "fastapi", "react", "next.js"] for s in skills) else 0)
        sen_vote, sen_conf = RecruiterAgent._get_vote(sen_score)
        sen_report = {
            "name": "Elena Rostova",
            "role": "Senior Software Engineer",
            "vote": sen_vote,
            "confidence": sen_conf,
            "strengths": [
                "Code shows solid familiarity with design patterns.",
                "Good utilization of asynchronous programming concepts."
            ],
            "risks": [
                "Would like to see more unit testing files in core projects." if github_score < 80 else "Some redundant imports found in repositories."
            ],
            "recommendations": "Ask them to explain garbage collection or event loops in Python/JS."
        }

        # 4. Staff Systems Architect Agent
        has_infra = any(s.lower() in ["docker", "kubernetes", "aws", "terraform", "redis", "postgres", "sql"] for s in skills)
        architect_score = github_score * 0.7 + (25 if has_infra else 5)
        architect_vote, architect_conf = RecruiterAgent._get_vote(architect_score)
        architect_report = {
            "name": "Devon Miller",
            "role": "Staff Systems Architect",
            "vote": architect_vote,
            "confidence": architect_conf,
            "strengths": [
                "Infrastructure patterns present in repository configs." if has_infra else "Code shows solid modular structuring.",
                "Uses database modeling schemas cleanly."
            ],
            "risks": [
                "Lacks Kubernetes or cloud scaling scripts in public repos." if github_score < 85 else "Few examples of distributed caching (Redis/Memcached)."
            ],
            "recommendations": "Query their knowledge of caching invalidation strategies during system design."
        }

        # 5. Startup CTO Agent
        cto_score = github_score * 0.5 + ats_score * 0.3 + experience * 3
        cto_vote, cto_conf = RecruiterAgent._get_vote(cto_score)
        cto_report = {
            "name": "Dr. Aris Thorne",
            "role": "Startup CTO",
            "vote": cto_vote,
            "confidence": cto_conf,
            "strengths": [
                "Strong alignment with modern serverless and API stacks.",
                "Public contributions show an active builder mindset."
            ],
            "risks": [
                "Need to evaluate their cost-optimization awareness."
            ],
            "recommendations": "Strong fit for our current development runway. Bring them in."
        }

        # 6. HR Director Agent
        hr_vote, hr_conf = RecruiterAgent._get_vote(ats_score * 0.7 + 20)
        hr_report = {
            "name": "Clara Higgins",
            "role": "HR Director",
            "vote": hr_vote,
            "confidence": hr_conf,
            "strengths": [
                "Structured communication layout on resume.",
                "Clear goals and track record of target certifications."
            ],
            "risks": [
                "Need to verify soft skills in cultural round."
            ],
            "recommendations": "Approved for final cultural-fit and leadership interview."
        }

        # Roundtable consensus voting
        votes = [recruiter_vote, em_vote, sen_vote, architect_vote, cto_vote, hr_vote]
        hired_count = sum(1 for v in votes if v in ["Strong Hire", "Hire"])
        reject_count = sum(1 for v in votes if v == "Reject")
        
        if hired_count >= 5:
            committee_verdict = "Strong Hire"
            probability = 0.95
        elif hired_count >= 3:
            committee_verdict = "Hire"
            probability = 0.82
        elif reject_count >= 3:
            committee_verdict = "Reject"
            probability = 0.25
        else:
            committee_verdict = "Maybe"
            probability = 0.55
            
        # Detect disagreements
        has_disagreement = (hired_count > 0 and reject_count > 0) or ("Reject" in votes and "Strong Hire" in votes)
        disagreement_notes = "Architect flagged system scalability concerns, while HR and Recruiter pushed for candidate match speed." if has_disagreement else "Committee shares clean alignment on candidate qualifications."

        return {
            "verdict": committee_verdict,
            "hiring_probability": probability,
            "overall_score": int((github_score + ats_score) / 2),
            "reasoning": f"राउंड-टेबल सहमति: {committee_verdict}. {disagreement_notes}",
            "committee": {
                "verdict": committee_verdict,
                "disagreement": has_disagreement,
                "disagreement_notes": disagreement_notes,
                "votes_summary": {
                    "strong_hire": votes.count("Strong Hire"),
                    "hire": votes.count("Hire"),
                    "maybe": votes.count("Maybe"),
                    "reject": votes.count("Reject")
                },
                "agents": {
                    "technical_recruiter": recruiter_report,
                    "engineering_manager": em_report,
                    "senior_engineer": sen_report,
                    "staff_architect": architect_report,
                    "cto": cto_report,
                    "hr_director": hr_report
                }
            },
            # Backward compatibility fields for reports/latest
            "personas": {
                "technical_recruiter": recruiter_report["recommendations"],
                "engineering_manager": em_report["recommendations"],
                "cto": cto_report["recommendations"]
            }
        }

    @staticmethod
    def _get_vote(score: float) -> tuple:
        if score >= 85:
            return "Strong Hire", int(min(98, score))
        elif score >= 70:
            return "Hire", int(min(95, score))
        elif score >= 55:
            return "Maybe", int(min(90, score))
        else:
            return "Reject", int(max(30, score))
