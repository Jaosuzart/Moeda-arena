@echo off
setlocal
cd /d "%~dp0"
if exist "%~dp0.cache\node-v24.19.0-win-x64\node.exe" set "PATH=%~dp0.cache\node-v24.19.0-win-x64;%PATH%"
where node.exe >nul 2>nul
if not errorlevel 1 goto iniciar
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
where node.exe >nul 2>nul
if not errorlevel 1 goto iniciar
if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "PATH=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%"
where node.exe >nul 2>nul
if not errorlevel 1 goto iniciar
echo Node.js ausente. Instale Node.js LTS: https://nodejs.org/
exit /b 1
:iniciar
node server.js
exit /b %errorlevel%
