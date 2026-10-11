@echo off
echo ===========================================================================
echo Starting Aurora Classroom Development Environment
echo ===========================================================================

echo Starting Backend Server on http://localhost:8000 ...
start "Aurora Classroom Backend" cmd /k "cd backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo Starting Frontend Server on http://localhost:3001 ...
start "Aurora Classroom Frontend" cmd /k "cd frontend && npm run dev -- -p 3001"

timeout /t 3 >nul
start http://localhost:3001

echo.
echo Both servers are launching:
echo - Frontend: http://localhost:3001
echo - Backend API Docs: http://localhost:8000/api/v1/docs
