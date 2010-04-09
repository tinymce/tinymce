#!/bin/sh

# Starts Firefox. Use this instead of calling the AppleScripts directly.

osascript -e 'tell application "FireFox" to quit without saving'
osascript -e "tell application \"FireFox\" to open location \"$1\""

