@echo off
REM Math Adventure - double-click to commit + push everything to GitHub (-> math.jacobsiler.com).
setlocal
set "PS1=%~dp0scripts\ma-push.ps1"
if not exist "%PS1%" (
  echo Could not find %PS1%
  pause
  exit /b 1
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PS1%"
endlocal
