#!/bin/sh
killall -9 -w firefox-bin
killall -9 -w firefox
xvfb-run --server-num 99 firefox $1 &
