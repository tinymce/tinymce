# README

This is a customized version of the TinyMCE editor.

Instructions to update TinyMCE to the lastest:

1. Ensure you have upstream pointing to the tinymce Github repo.

   > git remote -v
   > git remote add upstream https://github.com/tinymce/tinymce.git

2. Fetch the latest from upstream

3. Merge upstream master into the origin master and choose the "fast-forward" option.

4. At the head of the origin master add a new branch "teamup-customizations-{version}",
   where _version_ is the last version of the master branch. For example, "teamup-customizations-5.8.1".

5. Apply our modifications to TinyMCE step by step to the feature branch. We cannot just rebased our
   past changes because some of the changes need to be updated. For example, we need to fetch the
   latest version of the language files, etc.

6. Install dependencies:

   > npm install

7. Build:

   > yarn tinymce-grunt

8. Build custom version for Teamup

   > gulp tinymce:minify

9. Commit all changes

10. In repo TeamupCom/teamup:
- File package.json: Update dependeny on tinymce to the latest commit.

9. Update dependency of Teamup Calendar on tinymce
   > npm update tinymce
   > npm shrinkwrap
   Then commit changes.

10. Build Teamup Calendar with latest TinyMCE instance
    > composer publish

11. Inform other users to update to dependency on tinymce:
    > npm install tinymce

Update "teamuplinknewtab" plugin
--------------------------------

1. Install the Yeoman plugin generator

`npm install --global yo generator-tinymce`

2. Run Yeoman plugin generator

`yo tinymce`

You will then be guided through these questions:

*   Plugin name: The name of the plugin.
*   Plugin description (optional): An optional description of the plugin.
*   Initialize git repo? Here you can skip the creation of a new repository for the plugin.
*   What’s your name? For license.
*   Your email (optional): For license.
*   Your website (optional): For license.
*   Which license do you want to use? Choose the license for the plugin.

3. Ensure you are in plugin directory: c/tinymce/teamuplinknewtab

4. Run "npm start" to start the autoreloading development server. Apply changes to source file: /src/main/ts/Plugin.ts

5. Create distribution build: run "yarn build". A dist directory will be created, containing a sub-directory with
   the same name as the plugin. The sub-directory will contain the following files:
- plugin.js - unminified plugin bundle
- plugin.min.js - minified and uglified plugin bundle
- CHANGELOG.txt - the text file containing your changes
- LICENSE - the text file containing you license
- version.txt - the text file containing the version of your plugin


Create an icon pack
--------------------------------
1. Clone repository
   `git clone https://github.com/tinymce/oxide-icon-pack-template.git`

2. Open a terminal or command prompt, navigate to the oxide-icon-pack-template directory

3. Install the project dependencies

`npm install`

4. Enter a name for the icon pack

5. Place the svg files in /src/svg. All svgs will be converted to an icon. The file names of the SVG files
   are used to set the icon identifier used by TinyMCE
   https://www.tiny.cloud/docs/advanced/creating-an-icon-pack/


Useful
---------------------------------------
1. Create or update editor icon
> https://www.tiny.cloud/docs/advanced/creating-an-icon-pack/

2. Create new plugin:
> https://www.tiny.cloud/docs/advanced/creating-a-plugin/

3. Download languages
> https://www.tiny.cloud/get-tiny/language-packages/
