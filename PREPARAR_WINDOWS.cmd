@echo off
setlocal
cd /d "%~dp0"
where npm >nul 2>nul
if errorlevel 1 (
 echo Instale Node.js LTS, reabra o terminal e tente novamente.
 pause
 exit /b 1
)
call npm ci
if errorlevel 1 goto falha
call npm run build
if errorlevel 1 goto falha
call npm test
if errorlevel 1 goto falha
if not exist .env copy .env.example .env >nul
echo.
echo Preparacao concluida. Configure o .env com seu banco e suas credenciais.
echo Depois execute npm start. Para visualizar: npm run preview.
pause
exit /b 0
:falha
echo A preparacao encontrou um erro. Confira a mensagem acima.
pause
exit /b 1
