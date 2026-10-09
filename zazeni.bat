@echo off
title Montaza Skerjanec Digital
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js ni namescen. Namesti ga z https://nodejs.org ^(gumb LTS^), nato znova zazeni to datoteko.
  start https://nodejs.org
  pause
  exit /b 1
)
if not exist node_modules (
  echo Prvi zagon: namescam potrebne knjiznice, pocakaj minuto ...
  call npm install --omit=dev --no-audit --no-fund
  if errorlevel 1 ( echo Namestitev ni uspela. & pause & exit /b 1 )
)
set PORT=8080
set MSD_DATA=%~dp0data
if "%1"=="preizkus" (
  set MSD_DEV=1
  set MSD_DATA=%~dp0data-preizkus
)
echo.
echo Aplikacija tece na http://localhost:8080  - to okno pusti odprto. Za konec zapri okno.
echo.
start "" http://localhost:8080
node --disable-warning=ExperimentalWarning server/index.js
pause
