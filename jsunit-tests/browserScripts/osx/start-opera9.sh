#!/bin/sh

# Starts Opera9. Use this instead of calling the AppleScripts directly.

osascript -e 'tell application "Opera" to quit without saving'
osascript -e "tell application \"Opera\" to open location \"$1\""
