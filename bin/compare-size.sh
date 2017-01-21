#!/bin/sh

echo "Building normally" &&
bolt build -i -n ephox.alloy.docs.Everything -e src/docs/js/ephox/alloy/docs/Everything.js -c config/bolt/doc.js  &&

mv scratch/main/js/inline/ephox.alloy.docs.Everything.js scratch/main/js/inline/ephox.alloy.docs.Everything.max.js &&

echo "Building with shortened module names"

bolt build -i -n ephox.alloy.docs.Everything -e src/docs/js/ephox/alloy/docs/Everything.js -c config/bolt/doc.js -a &&

echo "Minifying"

shrink scratch/main/js/inline/ephox.alloy.docs.Everything.js &&

echo "Gzipping"

gzip -k scratch/main/js/inline/ephox.alloy.docs.Everything.min.js &&

echo "Showing sizes ..." && 

ls -al scratch/main/js/inline

