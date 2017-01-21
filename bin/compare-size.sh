#!/bin/sh

# Usage bin/compare-size.sh ${CONFIG} ${NAMESPACE} ${LOCATION}

CONFIG=$1
NAMESPACE=$2
LOCATION=$3

echo "Building normally" &&
bolt build -i -n $NAMESPACE -e $LOCATION -c $CONFIG  &&

mv scratch/main/js/inline/$NAMESPACE.js scratch/main/js/inline/$NAMESPACE.max.js &&

echo "Building with shortened module names"

bolt build -i -n $NAMESPACE -e $LOCATION -c $CONFIG -a &&

echo "Minifying"

shrink scratch/main/js/inline/$NAMESPACE.js &&

echo "Gzipping"

# -f overwrite file, -k keep the min.js file as well
gzip -f -k scratch/main/js/inline/$NAMESPACE.min.js &&

echo "Showing sizes ..." && 

ls -al scratch/main/js/inline

