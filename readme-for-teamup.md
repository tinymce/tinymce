README 

This is a customized version of the TinyMCE editor.

Instructions to update TinyMCE to the lastest:

1. Ensure you have upstream pointing to the tinymce Github repo.
  
   > git remote -v
   > git remote add upstream https://github.com/tinymce/tinymce.git

2. Fetch the latest for upstream

3. Rebase to head of upstream

4. Reset local master to the last commit on upstream master

5. Apply our modifications to TinyMCE step by step as needed. We can just commit our rebased
   changes because some of the changes need to be updated. For example, we need to fetch the
   latest version of the language files.
   
6. Install dependencies: 
   > npm install

7. Build: 
   > grunt

8. Build custom version for Teamup
   > grunt bundle -themes=modern -plugins=autolink,contextmenu,lists,image,nonbreaking,tabfocus,visualchars,paste,charmap,emoticons,link,code,teamuplinknewtab

9. Commit all changes.

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
-------------------------------------------------------------------------------------