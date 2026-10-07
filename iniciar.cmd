@echo off
setlocal
cd /d "%~dp0"
set "PATH=%~dp0.local-tools\node-v24.21.0-win-x64;%PATH%"
if not exist "%~dp0.local-tools\node-v24.21.0-win-x64\node.exe" (
  echo Node local ausente. Instale Node.js LTS: https://nodejs.org/
  exit /b 1
)
call npm.cmd start
