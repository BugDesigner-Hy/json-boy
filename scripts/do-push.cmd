@echo off
setlocal
cd /d "d:\workspace\myProject\web\json-boy"
echo === STATUS ===
git status --short
echo === BRANCH ===
git branch -vv
echo === REMOTE ===
git remote -v
echo === LOG ===
git log -1 --oneline
echo === ADD ===
git add -A
echo === STATUS AFTER ADD ===
git status --short
echo === COMMIT ===
git commit -m "Add Animal Island UI JSON parser web app and browser extension."
echo COMMIT_EXIT=%ERRORLEVEL%
echo === PUSH ===
git push -u origin HEAD
echo PUSH_EXIT=%ERRORLEVEL%
echo === DONE ===
git status -sb
endlocal
