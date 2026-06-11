@echo off
cd /d "%~dp0"

echo --- git status ---
git status

echo.
set /p MSG="Commit message (leave blank for default): "
if "%MSG%"=="" set MSG=update quiz files

git add .
git commit -m "%MSG%"
git push origin main

echo.
echo Done.
pause
