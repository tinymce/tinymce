#!/bin/sh
killall -9 -w firefox-bin
firefox $1 &
