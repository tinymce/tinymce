@echo off
set jsfiles=jscripts\tiny_mce\classes
jsdoc.pl --package-naming --directory docs\tinymce_api %jsfiles%
