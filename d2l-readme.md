TinyMCE - The JavaScript Rich Text editor
==========================================

Building TinyMCE fork for d2l-html-editor
-----------------
1. Install Node.
2. Open a console and go to the project directory
3. Write "npm i -g grunt-cli" to install the grunt command line tool globally.
4. Write "npm i" to install all package dependencies.
4. Build TinyMCE by writing "grunt" (there are some unit test errors which can be ignored)
5. Build the distribution package by writing "grunt moxiezip"
6. Extract the contents of the zip file 'tmp/tinymce_4.3.x_component.zip' to your tinymce-dist checkout folder overwriting any files that have changed
7. Update the version number in the generated tinymce-dist/bower.json
8. Tag the build with the new version number
9. Push the tinymce fork and the tinymce-dist packages
