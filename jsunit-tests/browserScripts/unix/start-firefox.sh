#!/bin/sh
killall -9 -w firefox-bin
killall -9 -w firefox
/usr/bin/firefox $1 &
