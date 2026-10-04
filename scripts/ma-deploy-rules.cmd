@echo off
REM Publishes firebase\database.rules.json to the homeschool-math Realtime Database.
REM YOU run this (it changes security rules). First time only: it opens a browser to sign in to Firebase.
REM Needs Node.js (npx). The current rules (default test rules that expired 2026-03-23) are REPLACED.
setlocal
cd /d "%~dp0..\firebase"
echo.
echo This will publish these rules to Firebase project homeschool-math (Realtime Database):
echo.
type database.rules.json
echo.
set /p OK=Type YES to publish, anything else cancels: 
if /i not "%OK%"=="YES" (
  echo Cancelled. Nothing was changed.
  pause
  exit /b 0
)
call npx --yes firebase-tools@latest deploy --only database --project homeschool-math
echo.
echo Done. If you saw "Deploy complete" the rules are live.
pause
endlocal
