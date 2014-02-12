moxie-zip
=========

This is another zip library for node js. We decided to write our own since we had issues with the current once that exists.

It's a very simple library:
```javascript
var ZipWriter = require("moxie-zip").ZipWriter;
var zip = new ZipWriter();

zip.addFile("myfile.txt", "./myfile.txt");
zip.addData("myfile.txt", "Hello world!");
zip.addDir("mydir");

zip.toBuffer(function(buf) {
});

zip.saveAs("my.zip", function() {
   console.log("zip written.");
});
```
