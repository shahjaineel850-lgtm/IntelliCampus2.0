@echo off
echo ===========================================================================
echo Running Full Test Suite: Aurora Classroom (Backend + Frontend)
echo ===========================================================================

echo.
echo [1/2] Running Backend Tests (pytest)...
cd backend
call .\venv\Scripts\python.exe -m pytest -v
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend tests failed!
    cd ..
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo [2/2] Running Frontend Tests (tsx)...
cd frontend
call npm test
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend tests failed!
    cd ..
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo ===========================================================================
echo ALL TESTS PASSED SUCCESSFULLY! (15 backend tests + 21 frontend tests)
echo ===========================================================================
