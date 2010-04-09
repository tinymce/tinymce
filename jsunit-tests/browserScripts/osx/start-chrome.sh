#!/bin/sh

# Starts Safari. Use this instead of calling the AppleScripts directly.

osascript -e 'tell application "Chrome" to quit without saving'
osascript -e "tell application \"Chrome\" to open location \"$1\""
