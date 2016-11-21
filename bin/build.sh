#!/bin/sh

OUTPUT="npm_output"
OUTPUT_JS="$OUTPUT/js"

bolt build -s src/main/js -m 
rm -rf $OUTPUT
mkdir -p $OUTPUT_JS
cp package.json $OUTPUT
cp scratch/main/js/module/*.js $OUTPUT_JS

npm publish --registry http://nexus:8081/repository/ephox-npm $OUTPUT

