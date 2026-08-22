@echo off
setlocal enabledelayedexpansion

rem Locate ffmpeg installed via winget
set "FFBIN="
for /f "delims=" %%i in ('dir /s /b "%LOCALAPPDATA%\Microsoft\WinGet\Packages\*ffmpeg.exe" 2^>nul') do (
  set "FFBIN=%%~dpi"
)
if not defined FFBIN (
  echo ffmpeg not found
  exit /b 1
)
set "FFMPEG=%FFBIN%ffmpeg.exe"
set "FFPROBE=%FFBIN%ffprobe.exe"
echo using %FFMPEG%

set "SRC=%~dp0..\Video\Backround.mp4"
set "OUTDIR=%~dp0..\public\media"
if not exist "%OUTDIR%" mkdir "%OUTDIR%"

rem Probe duration
for /f "delims=" %%d in ('"%FFPROBE%" -v error -show_entries format^=duration -of csv^=p^=0 "%SRC%"') do set "DUR=%%d"
echo duration: %DUR%

rem Boomerang loop: forward + reversed with 1s crossfade, then compress
rem offset = duration - 1
for /f %%o in ('powershell -nologo -command "[math]::Round([double]%DUR% - 1, 2)"') do set "OFFSET=%%o"
echo xfade offset: %OFFSET%

"%FFMPEG%" -y -i "%SRC%" -filter_complex "[0:v]reverse[r];[0:v][r]xfade=transition=fade:duration=1:offset=%OFFSET%[v]" -map "[v]" -an -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart "%OUTDIR%\hero-loop.mp4"

if errorlevel 1 (
  echo ffmpeg failed
  exit /b 1
)

rem Poster: first frame as webp
"%FFMPEG%" -y -i "%SRC%" -frames:v 1 -q:v 4 "%OUTDIR%\hero-poster.webp"

echo done
dir /b "%OUTDIR%"
