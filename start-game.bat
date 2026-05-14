@echo off
cd /d "%~dp0"
start "Paco's Blaster Server" /min node server.js
start "" "http://127.0.0.1:4173/"
