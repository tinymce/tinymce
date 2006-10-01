@echo off
moxiedoc.exe --verbose --recursive --project-name "TinyMCE" -d docs/tinymce_api -t docs/moxiedoc_template jscripts/tiny_mce/classes
:pause
