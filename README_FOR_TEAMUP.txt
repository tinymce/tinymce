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

   
   
   