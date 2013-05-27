TinyMCE - The JavaScript Rich Text editor
==========================================

Building TinyMCE
-----------------
1. Install Node.js
2. Open a console and go to the project directory
3. Write "npm install" to install all Node.js modules needed
4. Build TinyMCE by writing "jake"

Build tasks
------------
`jake`
Runs the minifyjs, less, jshint build tasks.

`jake -T`
List all build tasks.

`jake minify`
Compiles the core classes, plugins and themes into minified versions.

`jake less`
Compiles all LESS based skins into css files that can be included in the browser.

`jake jshint`
Runs all js code though jshint.

`jake release`
Builds release packages with the version specified in changelog.txt.

`jake bundle[themes:*]`
Bundles all themes into the tinymce core js files.

`jake bundle[plugins:*]`
Bundles all plugins into the tinymce core js files.

Bundle themes and plugins into core example
-------------------------------------------
`jake minify bundle[themes:modern,plugins:table,paste]`
Minifies the core, adds the modern theme and adds the table and paste plugin into tinymce.min.js.

Contributing to the TinyMCE project
------------------------------------
You can read more about how to contribute to this project at [http://www.tinymce.com/develop/contributing.php](http://www.tinymce.com/develop/contributing.php)
