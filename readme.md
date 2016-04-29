TinyMCE - The JavaScript Rich Text editor
==========================================

[![Build Status](https://travis-ci.org/tinymce/tinymce.png?branch=master)](https://travis-ci.org/tinymce/tinymce)

Building TinyMCE
-----------------
1. Install [Node.js](https://nodejs.org/en/) on your system.
2. Clone this repository on your system
```
$ git clone https://github.com/tinymce/tinymce.git
```
2. Open a console and go to the project directory.
```
$ cd tinymce/
```
3. Install `grunt` command line tool globally.
```
$ npm i -g grunt-cli
```
4. Install all package dependencies.
```
$ npm install
```
4. Now, build TinyMCE by using `grunt`.
```
$ grunt
```

Build tasks
------------
`grunt`
Lints, minified, unit tests and creates release packages for TinyMCE.

`grunt minify`
Minifies all JS and CSS files.

`grunt test`
Runs all qunit tests on PhantomJS.

`grunt lint`
Runs all source files through various JS linters.

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
TinyMCE is an open source software project and we encourage developers to contribute patches and code to be included in the main package of TinyMCE.

__Basic Rules__

* Contributed code will be licensed under the LGPL license but not limited to LGPL.
* Copyright notices will be changed to Ephox Corporation, contributors will get credit for their work.
* All third party code will be reviewed, tested and possibly modified before being released.
* All contributors will have to have signed the Contributor License Agreement.

These basic rules ensures that the contributed code remains open source and under the LGPL license.

__How to Contribute__

The TinyMCE source code is [hosted on Github](http://github.com/tinymce/tinymce). Through Github you can submit pull requests and log new bugs and feature requests.

When you submit a pull request, you will get a notice about signing the __Contributors License Agreement (CLA)__.
You should have a __valid email address on your GitHub account__, and you will be sent a key to verify your identity and digitally sign the agreement.
After you signed your pull request will automatically be ready for review & merge.

