#!/bin/sh
killall -9 -w firefox-bin
killall -9 -w firefox
firefox --display=:100 $1 &
