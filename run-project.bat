@echo off
echo.
echo --- STARTING GRAD PROJECT AUTH SYSTEM ---
echo.

echo [1/2] Launching Backend (NestJS)...
start /d "grad project draft back" cmd /k "npm run start:dev"

echo [2/2] Launching Frontend (Electron)...
start /d "grad project draft front" cmd /k "npm run electron:manual"

echo.
echo ✅ Both windows are now opening!
echo Backend logs are in the first window. 
echo Frontend logs are in the second window.
echo.
pause
