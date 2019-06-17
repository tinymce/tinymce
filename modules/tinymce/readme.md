TinyMCE - JavaScript Library for Rich Text Editing
===================================================

Building TinyMCE
-----------------
See the monorepo root readme file for installation instructions.

Now, build TinyMCE by using `grunt`. If you don't have `grunt-cli` installed globally, prefix with `yarn` to execute the local grunt.
```
$ yarn grunt
```

Build tasks
------------
`grunt`
Lints, compiles, minifies and creates release packages for TinyMCE. This will produce the production ready packages.

`grunt start`
Starts a webpack-dev-server that compiles the core, themes, plugins and all demos. Go to `localhost:3000` for a list of links to all the demo pages.

`grunt dev`
Runs tsc, webpack and less. This will only produce the bare essentials for a development build and is a lot faster.

`grunt test`
Runs all tests on PhantomJS.

`grunt bedrock-manual`
Runs all tests manually in a browser.

`grunt bedrock-auto:<browser>`
Runs all tests through selenium browsers supported are chrome, firefox, ie, MicrosoftEdge, chrome-headless and phantomjs.

`grunt webpack:core`
Builds the demo js files for the core part of tinymce this is required to get the core demos working.

`grunt webpack:plugins`
Builds the demo js files for the plugins part of tinymce this is required to get the plugins demos working.

`grunt webpack:themes`
Builds the demo js files for the themes part of tinymce this is required to get the themes demos working.

`grunt webpack:<name>-plugin`
Builds the demo js files for the specific plugin.

`grunt webpack:<name>-theme`
Builds the demo js files for the specific theme.

`grunt --help`
Displays the various build tasks.

Bundle themes and plugins into a single file
---------------------------------------------
`grunt bundle --themes=silver --plugins=table,paste`

Minifies the core, adds the silver theme and adds the table and paste plugin into tinymce.min.js.

Contributing to the TinyMCE project
------------------------------------
TinyMCE is an open source software project and we encourage developers to contribute patches and code to be included in the main package of TinyMCE.

__Basic Rules__

* Contributed code will be licensed under the LGPL license but not limited to LGPL
* Copyright notices will be changed to Ephox Corporation, contributors will get credit for their work
* All third party code will be reviewed, tested and possibly modified before being released
* All contributors will have to have signed the Contributor License Agreement

These basic rules ensures that the contributed code remains open source and under the LGPL license.

__How to Contribute to the Code__

The TinyMCE source code is [hosted on Github](https://github.com/tinymce/tinymce). Through Github you can submit pull requests and log new bugs and feature requests.

When you submit a pull request, you will get a notice about signing the __Contributors License Agreement (CLA)__.
You should have a __valid email address on your GitHub account__, and you will be sent a key to verify your identity and digitally sign the agreement.

After you signed your pull request will automatically be ready for review & merge.

__How to Contribute to the Docs__

Docs are hosted on Github in the [tinymce-docs](https://github.com/tinymce/tinymce-docs) repo.

[How to contribute](https://www.tiny.cloud/docs/advanced/contributing-docs/) to the docs, including a style guide, can be found on the TinyMCE website.

[Documentation](https://www.tiny.cloud/docs/)

[Log feedback](https://github.com/tinymce/tinymce/labels/5.x)
