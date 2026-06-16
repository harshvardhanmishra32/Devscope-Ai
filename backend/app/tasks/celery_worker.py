import os
from celery import Celery
from backend.app.core.config import settings

# Initialize Celery app instance
celery_app = Celery(
    "devscope_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Example Celery task signature
@celery_app.task(name="tasks.scan_github_async")
def scan_github_async(username: str, profile_id: str):
    """
    Asynchronous task to run the GitHub Scout Agent.
    Offloads heavy network and text parsing operations to background workers.
    """
    from backend.app.services.github_agent import GithubAgent
    from backend.app.core.database import SessionLocal
    from backend.app.models.models import GithubAccount, Repository
    
    db = SessionLocal()
    try:
        # Run agent analysis
        analysis = GithubAgent.analyze_profile(username)
        
        # Save results to DB
        github_acct = db.query(GithubAccount).filter(GithubAccount.profile_id == profile_id).first()
        if not github_acct:
            github_acct = GithubAccount(profile_id=profile_id, username=username)
            db.add(github_acct)
            db.commit()
            db.refresh(github_acct)
            
        github_acct.github_score = analysis["github_score"]
        github_acct.avatar_url = analysis["avatar_url"]
        
        # Save repo details
        db.query(Repository).filter(Repository.github_account_id == github_acct.id).delete()
        for r in analysis["repositories"]:
            repo = Repository(
                github_account_id=github_acct.id,
                name=r["name"],
                html_url=r["html_url"],
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
        return {"status": "SUCCESS", "username": username}
    except Exception as e:
        db.rollback()
        return {"status": "FAILED", "error": str(e)}
    finally:
        db.close()
