@echo off
echo 正在清理微信开发者工具缓存...

REM 清理可能的缓存目录
rd /s /q "%APPDATA%\微信web开发者工具\Default\File System" 2>nul
rd /s /q "%APPDATA%\微信web开发者工具\Default\IndexedDB" 2>nul
rd /s /q "%APPDATA%\微信web开发者工具\Default\Local Storage" 2>nul
rd /s /q "%USERPROFILE%\AppData\Local\微信web开发者工具" 2>nul

REM 清理项目目录中的可能缓存
cd /d "%~dp0"
rd /s /q ".tea" 2>nul
rd /s /q "node_modules\.cache" 2>nul

echo 缓存清理完成
echo 请重新打开微信开发者工具并重新编译项目

pause