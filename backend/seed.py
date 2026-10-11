"""Create development-only demo accounts and scenario data."""
from app.main import seed_if_demo
from app.core.config import settings
if not settings.demo_mode: raise SystemExit("Set DEMO_MODE=true in .env to seed development data.")
seed_if_demo()
print("Seed command completed. Demo credentials are documented in README.md.")
