@echo off
cd /d "D:\gym app\vendor_repos"
call :c hasaneyldrm/exercises-dataset
call :c CodeWithCJ/SparkyFitness
call :c perpetio/fitness
call :c rahulmaddineni/Stayfit
call :c BenjaminCanape/RunFlutterRun
call :c chrisdoc/hevy-mcp
call :c chathushkaimasara/My-Workouts
call :c skulptapp/skulpt
call :c nikitavovch/claude-gym-coach
call :c soham-1801/gym-mentor-ai
call :c khaoss85/arvo-mcp
call :c rishabhrawat35/diet-workout-plan-as-if-you-were-an-athlete
call :c ashwinr93/workout
call :c muelea/shapy
call :c DavidBoja/SMPL-Anthropometry
echo ALLDONE
exit /b 0

:c
set N=%~1
if exist "%N%\.git" (echo SKIP %N% & exit /b 0)
echo CLONE %N%
git clone --depth 1 https://github.com/%N%.git "%N%" >nul 2>&1
if exist "%N%" (echo OK %N%) else (echo FAIL %N%)
exit /b 0
