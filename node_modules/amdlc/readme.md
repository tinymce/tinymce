amdlc
======
This is a Node.js AMD Library Compiler. It enables you to write code in an the AMD style and compile the modules
into a standalone library file with all public modules exposed into the global namespace this is the opposite to
application specific AMD module loaders like RequireJS.

When compiling AMD projects using this compileer you get three files:
 * Inline minified file using Uglify-js
 * Inline source file
 * Development file that loads the modules synchronous (debug)

Installation
-------------
    npm install -g amdlc

Command line usage
-------------------
    Usage: amdlc [options] <input file/glob pattern> <output file>

    Options:
      --quiet              no output
      --include-root-ns    include root namespace from path resolve
      --basedir            basedir to look for modules for example src/js

Example with single file entry point
-------------------------------------
    amdlc --basedir example/src example/src/App.js example/out/App.js

Example with glob pattern
--------------------------
    amdlc --basedir example/src example/src/**/*.js example/out/App.js

Example of usage from Node.js
------------------------------
    var amdlc = require("amdlc");

    amdlc.compile({
        from: "src/**/*.js",
    	baseDir: "src",
    	compress: true,
    	expose: "public",
    	excludeRootNamespaceFromPath: true,
    	verbose: true,
    	outputSource: "out/lib.js",
    	outputMinified: "out/lib.min.js",
    	outputDev: "out/lib.dev.js"
    });

Todo
-----
 * Implement anonymous modules.
 * Implement support for relative modules like ./MyModule
