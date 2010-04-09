#!/bin/sh
killall -9 -w mozilla-bin
mozilla $1 &
