@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Instale Node.js LTS em https://nodejs.org/ e execute novamente.
 pause
 exit /b 1
)
if not exist .env (
 copy .env.example .env >nul
 echo.
 echo O arquivo .env foi criado. Configure suas credenciais reais do MySQL e do Mercado Pago.
 notepad .env
 echo Depois de salvar, execute novamente este arquivo.
 pause
 exit /b 0
)
echo Instalando dependencias...
call npm ci
if errorlevel 1 (echo Falha na instalacao. & pause & exit /b 1)
echo Verificando configuracao...
call npm run check:env
if errorlevel 1 (echo Corrija a configuracao indicada antes de iniciar. & pause & exit /b 1)
echo Compilando arquivos...
call npm run build
if errorlevel 1 (echo Falha na compilacao. & pause & exit /b 1)
echo Iniciando em http://localhost:3001
echo O banco de dados deve estar configurado e acessivel.
call npm start
pause
