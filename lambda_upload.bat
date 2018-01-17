@echo off
echo Alexa custom skill start Batch File start!

rem TODO change
rem 7zip path
set sevenZipPath="C:\Program Files\7-Zip"
rem zip file name
set zipName=skill-smarthome-light
rem AWS Lambda function name
set functionName=system-light-handler


if exist alexa-custom-skill-light.zip (
  rem file exist, delete file
  del %zipName%.zip
) else (
  rem file doesn't exist
)

rem path setting
set currentPath="%cd%"
set archievePath=%currentPath%/*

rem archieve this project to zip
%sevenZipPath%\7z.exe a %zipName%.zip %archievePath%

rem upload zip file to aws lambda
echo Now lambda uploading
aws lambda update-function-code --function-name %functionName% --zip-file fileb://%currentPath%/%zipName%.zip


pause

rem exit
