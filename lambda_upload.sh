#!/bin/bash

echo "AWS Lambda shell script file start!"

# TODO change
# zip file name
ZIP_FILE_NAME=skill-smarthome-light
# AWS Lambda function name
FUNCTION_NAME=system-light-handler

CURRENT_PATH=$PWD

# archive this project to zip file
echo "Archiving this project"
zip -r "$ZIP_FILE_NAME.zip" *

# Upload zip file to AWS Lambda
echo "Now uploading AWS lambda"
aws lambda update-function-code --function-name $FUNCTION_NAME --zip-file fileb://$CURRENT_PATH/$ZIP_FILE_NAME.zip
