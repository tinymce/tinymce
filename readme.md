TinyMCE - The JavaScript Rich Text editor
==========================================

What you need to build TinyMCE
-------------------------------
* Install the Java JDK or JRE packages you can find it at: [http://java.sun.com/javase/downloads/index.jsp](http://java.sun.com/javase/downloads/index.jsp)
* Install Apache Ant you can find it at: [http://ant.apache.org/](http://ant.apache.org/)
* Add Apache Ant to your systems path environment variable, this is not required but makes it easier to issue commands to Ant without having to type the full path for it.

How to build TinyMCE
---------------------

In the root directory of TinyMCE where the build.xml file is you can run ant against different targets.

`ant`

Will combine, preprocess and minify the TinyMCE classes into tiny_mce.js and tiny_mce_src.js and it's jQuery variant.

`ant moxiedoc`

Will generate API Documentation for the project using the Moxiedoc tool. The docs will be generated to the docs/api directory.

`ant release`

Will produce an release package of the current repository code. The release packages will be placed in the tmp directory.

Contributing to the TinyMCE project
------------------------------------
You can read more about how to contribute to this project at [http://tinymce.moxiecode.com/contributing](http://tinymce.moxiecode.com/contributing)
