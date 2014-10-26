TinyMCE - The JavaScript Rich Text editor
==========================================

Building TinyMCE
-----------------
1. Install Node.js
2. Open a console and go to the project directory
3. Write "npm i -g grunt-cli" to install the grunt command line tool globally.
4. Write "npm i" to install all package dependencies.
4. Build TinyMCE by writing "grunt"

Build tasks
------------
`grunt`
Lints, minified, unit tests and creates release packages for TinyMCE.

`grunt minify`
Minifies all JS and CSS files.

`grunt test`
Runs all qunit tests on PhantomJS.

`grunt lint`
Runs all source files though various JS linters.

`grunt sc-test`
Runs all qunit tests on Saucelabs.

`grunt watch`
Watches for source code changes and triggers rebuilds and linting.

`grunt --help`
Displays the various build tasks.

Bundle themes and plugins into a single file
---------------------------------------------
`grunt bundle --themes modern --plugins table,paste`
Minifies the core, adds the modern theme and adds the table and paste plugin into tinymce.min.js.

Contributing to the TinyMCE project
------------------------------------
You can read more about how to contribute to this project at [http://www.tinymce.com/develop/contributing.php](http://www.tinymce.com/develop/contributing.php)

[![Build Status](https://travis-ci.org/tinymce/tinymce.png?branch=master)](https://travis-ci.org/tinymce/tinymce)
