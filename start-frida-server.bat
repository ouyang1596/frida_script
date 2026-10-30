@echo off
chcp 936 >nul
setlocal
set DEVICE=emulator-5554
set FRIDA=/data/local/tmp/frida-server

adb -s %DEVICE% get-state >nul 2>&1
if errorlevel 1 (
  echo [%DEVICE%] 未连接
  goto end
)

adb -s %DEVICE% shell "pidof frida-server" 2>nul | findstr /r "[0-9]" >nul
if not errorlevel 1 (
  echo frida-server 已在运行
  goto end
)

echo 正在启动 frida-server ...
adb -s %DEVICE% shell "su 0 sh -c '%FRIDA% >/dev/null 2>&1 &'"
ping -n 2 127.0.0.1 >nul

adb -s %DEVICE% shell "pidof frida-server" 2>nul | findstr /r "[0-9]" >nul
if errorlevel 1 (
  echo 启动失败，请检查 root 与 %FRIDA% 是否存在
  goto end
)

echo frida-server 已启动

:end
echo.
pause
endlocal
