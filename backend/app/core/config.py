import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Database Configuration
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./auroraclassroom.db")
    
    # JWT Configuration
    jwt_secret: str = os.getenv("SECRET_KEY", "development-only-change-this-secret-before-deploying")
    
    # Token Configuration
    access_token_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # CORS Configuration
    cors_origins: str = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001")
    
    # Demo Mode
    demo_mode: bool = os.getenv("NEXT_PUBLIC_DEMO_MODE", "false").lower() == "true"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
