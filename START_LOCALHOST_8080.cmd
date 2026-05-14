@echo off
setlocal
cd /d "%~dp0"
set PORT=8080
npm.cmd run local
pause
