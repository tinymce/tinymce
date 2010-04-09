#!/bin/sh
killall -9 -w firefox-bin
firefox --display=:100 -no-remote $1 &
