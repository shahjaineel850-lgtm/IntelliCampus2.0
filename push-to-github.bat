@echo off
setlocal
echo ===========================================================================
echo Pushing Aurora Academic Platform to GitHub
echo Repository: https://github.com/shahjaineel850-lgtm/aurora-academic-platform
echo ===========================================================================

REM Add Git and GitHub CLI to PATH for this session
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Microsoft\WinGet\Packages\GitHub.cli_Microsoft.Winget.Source_8wekyb3d8bbwe\bin;%LOCALAPPDATA%\Microsoft\WinGet\Links;%PATH%"

echo.
echo [1/3] Verifying Git and GitHub CLI...
git --version
gh --version

echo.
echo [2/3] Checking GitHub authentication...
gh auth status >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Please log in to GitHub. You can choose 'GitHub.com' -> 'HTTPS' -> 'Login with a web browser':
    gh auth login -h github.com -p https -w
)

echo.
echo Configuring Git credentials with GitHub CLI...
gh auth setup-git

echo.
echo [3/3] Pushing to GitHub (main branch)...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/shahjaineel850-lgtm/aurora-academic-platform.git
git push -u origin main

echo.
echo ===========================================================================
echo Done! Visit: https://github.com/shahjaineel850-lgtm/aurora-academic-platform
echo ===========================================================================
pause
