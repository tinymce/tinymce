#!/bin/sh
killall -9 -w opera
opera -nosession $1 &
