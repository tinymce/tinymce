ModuleLoader.require([
	"tinymce/file/ImageScanner",
	"tinymce/file/BlobCache",
	"tinymce/Env"
], function(ImageScanner, BlobCache, Env) {
	if (!tinymce.Env.fileApi) {
		return;
	}

	module("tinymce.file.ImageScanner");

	var base64Src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAAAAAAALAAAAAABAAEAAAICTAEAOw==';

	QUnit.asyncTest("findAll", function() {
		var imageScanner = new ImageScanner(new BlobCache());

		document.getElementById('view').innerHTML = (
			'<img src="' + base64Src + '">' +
			'<img src="' + Env.transparentSrc + '">' +
			'<img src="' + base64Src + '" data-mce-bogus="1">' +
			'<img src="' + base64Src + '" data-mce-placeholder="1">'
		);

		imageScanner.findAll(document.getElementById('view')).then(function(result) {
			QUnit.start();
			equal(result.length, 1);
			equal('data:image/gif;base64,' + result[0].blobInfo.base64(), base64Src);
			strictEqual(result[0].image, document.getElementById('view').firstChild);
		});
	});
});