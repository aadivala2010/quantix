@echo off
setlocal

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not on PATH.
  echo Install Node.js, then run this file again.
  pause
  exit /b 1
)

start "" http://localhost:3000
node server.js

endlocal
