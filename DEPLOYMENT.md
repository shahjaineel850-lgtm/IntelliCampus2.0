# IntelliCampus 2.0 Deployment Guide

## Deployment Platforms

### Option 1: Vercel (Recommended for Frontend + Backend)

#### Prerequisites
- Vercel account
- GitHub repository connected
- PostgreSQL database (Vercel Postgres, Supabase, AWS RDS, or similar)

#### Step 1: Set Up PostgreSQL Database

**Option A: Vercel Postgres**
```bash
vercel postgres create
```

**Option B: Supabase (Free tier available)**
- Go to https://supabase.com
- Create a new project
- Copy connection string

**Option C: AWS RDS / Self-hosted**
- Provision PostgreSQL 16 instance
- Create database `auroraclassroom`
- Create user `aurora` with password

#### Step 2: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
DATABASE_URL=postgresql://user:password@host:5432/auroraclassroom
SYNC_DATABASE_URL=postgresql://user:password@host:5432/auroraclassroom
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440
BACKEND_CORS_ORIGINS=["https://yourdomain.vercel.app","https://yourdomain.com"]
```

#### Step 3: Deploy

```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys on push
# Or manually:
vercel deploy --prod
```

**Database Initialization:**
- The app automatically runs `init_db.py` on startup
- Tables are created using SQLAlchemy ORM
- Demo data is seeded on first deployment

---

### Option 2: Docker Compose (Local/Self-Hosted)

#### Prerequisites
- Docker & Docker Compose installed
- 2GB RAM, 10GB storage minimum

#### Deployment Steps

```bash
# 1. Clone repository
git clone https://github.com/shahjaineel850-lgtm/IntelliCampus2.0.git
cd IntelliCampus2.0

# 2. Configure environment
cp .env.example .env

# Edit .env for production
# Change SECRET_KEY, POSTGRES_PASSWORD, CORS origins
nano .env

# 3. Start services
docker-compose up -d

# 4. Verify deployment
docker-compose ps
docker-compose logs -f backend

# 5. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

#### Health Checks
```bash
# Check database
docker exec aurora_postgres pg_isready -U aurora

# Check backend
curl http://localhost:8000/api/v1/health

# Check frontend
curl http://localhost:3000
```

---

### Option 3: AWS (ECS + RDS)

#### Step 1: Create RDS PostgreSQL Instance
```bash
aws rds create-db-instance \
  --db-instance-identifier auroraclassroom \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.1 \
  --allocated-storage 20 \
  --master-username aurora \
  --master-user-password YOUR_SECURE_PASSWORD
```

#### Step 2: Build and Push Docker Image
```bash
# Build
docker build -t intellicampus:latest ./backend

# Push to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin YOUR_ECR_URL

docker tag intellicampus:latest YOUR_ECR_URL/intellicampus:latest
docker push YOUR_ECR_URL/intellicampus:latest
```

#### Step 3: Create ECS Task Definition
```json
{
  "family": "intellicampus",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "YOUR_ECR_URL/intellicampus:latest",
      "portMappings": [{"containerPort": 8000}],
      "environment": [
        {"name": "DATABASE_URL", "value": "postgresql://..."},
        {"name": "SECRET_KEY", "value": "your-secret-key"}
      ]
    }
  ]
}
```

#### Step 4: Create ECS Service
```bash
aws ecs create-service \
  --cluster default \
  --service-name intellicampus \
  --task-definition intellicampus \
  --desired-count 1
```

---

### Option 4: Heroku (Legacy - Phased Out)

Heroku no longer offers free tier. Use Vercel or Railway instead.

---

## Database Migration to Production

### Option A: Direct Import (SQL dump)
```bash
# Export local database
pg_dump -U aurora auroraclassroom > backup.sql

# Import to production
psql -h production-host -U aurora -d auroraclassroom < backup.sql
```

### Option B: Using SQLAlchemy Migrations (Alembic)
```bash
# Connect to production database
export DATABASE_URL="postgresql://user:pass@host/auroraclassroom"

# Run migrations
cd backend
alembic upgrade head
```

### Option C: Automatic (init_db.py)
- App automatically creates tables on startup
- Runs via Dockerfile CMD

---

## Database Backup Strategy

### Automated Backups (Vercel Postgres)
- Automatic daily backups included
- 30-day retention
- Restore from dashboard

### Manual Backups
```bash
# Daily backup script (cron)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump postgresql://user:pass@host/db > /backups/db_$DATE.sql
gzip /backups/db_$DATE.sql

# Upload to S3/Cloud Storage
aws s3 cp /backups/db_$DATE.sql.gz s3://your-backup-bucket/
```

### Restore from Backup
```bash
gunzip db_backup.sql.gz
psql postgresql://user:pass@host/db < db_backup.sql
```

---

## Monitoring & Logging

### Vercel Dashboard
- View logs: https://vercel.com/dashboard → Logs
- Monitor functions: Real-time performance metrics
- Alerts: Configure email notifications

### Docker Compose Logs
```bash
# Backend logs
docker-compose logs -f backend

# Database logs
docker-compose logs -f db

# Frontend logs
docker-compose logs -f frontend
```

### Application Monitoring
```bash
# Check API health
curl https://your-domain/api/v1/health

# Check database connection
python check_db.py

# Monitor with New Relic (optional)
export NEW_RELIC_CONFIG_FILE=newrelic.ini
newrelic-admin run-program uvicorn app.main:app
```

---

## Security Checklist

- [ ] Change default database password
- [ ] Set strong JWT SECRET_KEY (min 32 characters)
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall rules (database port 5432 closed to public)
- [ ] Set up API rate limiting
- [ ] Enable CORS only for trusted domains
- [ ] Use environment variables for all secrets
- [ ] Enable database backups
- [ ] Set up monitoring and alerts
- [ ] Review and restrict database user permissions

---

## Troubleshooting Deployment

### Database Connection Fails
```bash
# Check connection string format
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Verify credentials
psql -h hostname -U username -d database_name
```

### Tables Not Created
```bash
# Manually run migrations
python init_db.py

# Or using Alembic
alembic upgrade head
```

### Performance Issues
- Check database query logs: `EXPLAIN ANALYZE SELECT ...`
- Monitor slow queries: PostgreSQL pg_stat_statements
- Add indexes to frequently queried columns
- Use connection pooling (pgBouncer)

---

## Scaling Recommendations

| Component | Small | Medium | Large |
|-----------|-------|--------|-------|
| Database | db.t3.micro | db.t3.small | db.t3.medium |
| Backend Instances | 1 | 2-3 | 4+ (auto-scale) |
| Frontend Servers | 1 | 2 | 3+ (CDN) |
| Storage | 20GB | 100GB | 500GB+ |

---

## Support & Documentation

- **Database**: See [DATABASE.md](./DATABASE.md)
- **API**: Visit `/api/v1/docs` (Swagger UI)
- **GitHub Issues**: https://github.com/shahjaineel850-lgtm/IntelliCampus2.0/issues
- **Environment Variables**: See [.env.example](./.env.example)
