@echo off
cd frontend
set PORT=3023
set DANGEROUSLY_DISABLE_HOST_CHECK=true
set SKIP_PREFLIGHT_CHECK=true
npm start