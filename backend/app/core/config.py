import os

# Dynamic fallback to SQLite if psycopg2 (PostgreSQL adapter) is not installed on the host system
try:
    import psycopg2
    default_db = "postgresql://postgres:postgres@localhost:5432/devscope"
except ImportError:
    default_db = "sqlite:///./devscope.db"

class Settings:
    PROJECT_NAME: str = "DevScope AI API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-development-key-change-in-production-1234567890")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", default_db)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Mock LLM API settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "mock-key")

settings = Settings()
