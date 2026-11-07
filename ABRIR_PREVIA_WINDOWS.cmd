@echo off
title Moeda Arena - Previa do site
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale o Node.js LTS e abra este arquivo novamente.
  pause
  exit /b 1
)
node scripts\preview.cjs
pause
