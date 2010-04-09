#!/bin/sh
killall -9 -w firefox-bin
killall -9 -w firefox
xvfb-run firefox $1 &
