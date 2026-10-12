#!/usr/bin/env python3
"""
Database Initialization Script
Runs migrations and seeds demo data on deployment
"""

import os
import sys
import logging
from sqlalchemy import text, create_engine
from sqlalchemy.orm import sessionmaker

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./auroraclassroom.db")
SYNC_DATABASE_URL = os.getenv("SYNC_DATABASE_URL", "sqlite:///./auroraclassroom.db")

def wait_for_db():
    """Wait for database to be available"""
    import time
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            engine = create_engine(SYNC_DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in SYNC_DATABASE_URL else {})
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
                logger.info("✅ Database connection successful")
                return True
        except Exception as e:
            retry_count += 1
            logger.info(f"⏳ Waiting for database... ({retry_count}/{max_retries})")
            time.sleep(2)
    
    logger.error("❌ Failed to connect to database after retries")
    return False

def create_tables():
    """Create all database tables"""
    try:
        from app.db import Base, engine
        
        logger.info("📋 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Error creating tables: {e}")
        return False

def seed_database():
    """Seed the database with demo data"""
    try:
        logger.info("🌱 Seeding database with demo data...")
        
        # Import and run seed_demo
        from seed_demo import seed_demo_data
        seed_demo_data()
        
        logger.info("✅ Database seeded successfully")
        return True
    except Exception as e:
        logger.warning(f"⚠️  Demo seeding skipped or failed: {e}")
        # Continue even if seeding fails
        return True

def main():
    """Initialize database for deployment"""
    logger.info("🚀 Starting database initialization...")
    
    # Step 1: Wait for database
    if not wait_for_db():
        logger.error("Failed to connect to database")
        sys.exit(1)
    
    # Step 2: Create tables
    if not create_tables():
        logger.error("Failed to create tables")
        sys.exit(1)
    
    # Step 3: Seed data (optional, can fail gracefully)
    seed_database()
    
    logger.info("✅ Database initialization complete!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
