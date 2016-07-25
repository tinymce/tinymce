TinyMCE - The JavaScript Rich Text editor
==========================================

This is a fork of TinyMCE for the sole purpose of building a TinyMCE skin which is used by the d2l-html-editor
https://github.com/Brightspace/d2l-html-editor

For the purposes of the skin, we are required to change much more than just the variables.less file made available by TinyMCE for skinning purposes.
We have changed a number of the underlying TinyMCE LESS source files, prior to using TinyMCE's build to build the minified CSS.
This fork makes it much easier to manage updates to TinyMCE and ensure that they can be easily merged into our updated files.

d2l-html-editor is currently using the 4.3.7 version of TinyMCE available on the CDN.
This changes in this fork were therefore applied on top of the 4.3.7 tagged version of the master TinyMCE github repo.

Whenever we upgrade to a new version of TinyMCE on the CDN, we should pull the newer version of TinyMCE and merge those changes into this fork, resolving any merge conflicts as they arise.

Building TinyMCE skin for d2l-html-editor
-----------------
1. Install Node.
2. Open a console and go to the project directory
3. Write "npm i -g grunt-cli" to install the grunt command line tool globally.
4. Write "npm i" to install all package dependencies.
4. Build TinyMCE by writing "grunt" (there are some unit test errors which can be ignored - they exist because of our skin changes)
5. Build the distribution package by writing "grunt moxiezip"
6. Extract the contents of the 'tmp/tinymce_4.3.x_component.zip' skins/lightgray folder to your d2l-html-editor skin-x.x.x folder overwriting any files that have changed
