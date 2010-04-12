#!/bin/sh
killall -9 -w firefox-bin
killall -9 -w firefox
/usr/bin/xvfb-run --server-num 99 /usr/bin/firefox $1 &
