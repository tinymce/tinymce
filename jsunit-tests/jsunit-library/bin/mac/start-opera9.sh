#!/bin/sh

# Starts Opera9. Use this instead of calling the AppleScripts directly.

osascript bin/mac/stop-opera9.scpt
osascript bin/mac/start-opera9.scpt $1

