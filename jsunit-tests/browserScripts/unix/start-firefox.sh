#!/bin/sh
echo "DISPLAY is set to: $DISPLAY"
killall -9 -w firefox-bin
killall -9 -w firefox
/usr/bin/firefox $1 &
