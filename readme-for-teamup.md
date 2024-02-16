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

   > grunt
8. Build custom version for Teamup

   > grunt bundle -themes=modern -plugins=autolink,contextmenu,lists,image,nonbreaking,tabfocus,visualchars,paste,charmap,emoticons,link,code,teamuplinknewtab
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

1. Ensure you are in plugin directory: c/tinymce/src/plugins/teamuplinknewtab

2. Run "npm start" to start the autoreloading development server. Apply changes to source file: /src/index.js

3. Create distribution build: run "npm run build". A dist directory will be created with a directory in it named the same as your plugin containing three files
  - plugin.js - unminified plugin bundle
  - plugin.min.js - minified and uglified plugin bundle
  - LICENSE - the text file containing you license

4. Build Tinymce by running "grunt" in root directory

5. Run "grunt bundle -themes=modern -plugins=autolink,contextmenu,lists,image,nonbreaking,tabfocus,visualchars,paste,charmap,emoticons,link,code,teamuplinknewtab"
   Minifies the core, adds the modern theme and adds the "teamuplinknewtab" plugin into tinymce.full.min.js.


Create new plugin:
https://www.tinymce.com/docs/advanced/yeoman-generator/
