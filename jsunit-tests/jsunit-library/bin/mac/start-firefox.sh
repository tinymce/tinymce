#!/bin/sh

# Starts Firefox. Use this instead of calling the AppleScripts directly.

osascript bin/mac/stop-firefox.scpt
osascript bin/mac/start-firefox.scpt $1

