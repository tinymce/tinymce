ModuleLoader.require([
	"tinymce/file/ImageScanner",
	"tinymce/file/UploadStatus",
	"tinymce/file/BlobCache",
	"tinymce/file/Conversions",
	"tinymce/Env"
], function(ImageScanner, UploadStatus, BlobCache, Conversions, Env) {
	if (!tinymce.Env.fileApi) {
		return;
	}

	QUnit.config.autostart = false;

	module("tinymce.file.ImageScanner");

	var base64Src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAAAAAAALAAAAAABAAEAAAICTAEAOw==';
	var blobUriSrc;

	Conversions.uriToBlob(base64Src).then(function(blob) {
		blobUriSrc = URL.createObjectURL(blob);
		QUnit.start();
	});

	QUnit.asyncTest("findAll", function() {
		var imageScanner = new ImageScanner(new UploadStatus(), new BlobCache());

		document.getElementById('view').innerHTML = (
			'<img src="' + base64Src + '">' +
			'<img src="' + blobUriSrc + '">' +
			'<img src="' + Env.transparentSrc + '">' +
			'<img src="' + base64Src + '" data-mce-bogus="1">' +
			'<img src="' + base64Src + '" data-mce-placeholder="1">'
		);

		imageScanner.findAll(document.getElementById('view')).then(function(result) {
			QUnit.start();
			var blobInfo = result[0].blobInfo;
			equal(result.length, 2);
			equal('data:image/gif;base64,' + blobInfo.base64(), base64Src);
			strictEqual(result[0].image, document.getElementById('view').firstChild);
		});
	});

	QUnit.asyncTest("findAll (filtered)", function() {
		var imageScanner = new ImageScanner(new UploadStatus(), new BlobCache());

		function predicate(img) {
			return !img.hasAttribute('data-skip');
		}

		document.getElementById('view').innerHTML = (
			'<img src="' + base64Src + '">' +
			'<img src="' + base64Src + '" data-skip="1">'
		);

		imageScanner.findAll(document.getElementById('view'), predicate).then(function(result) {
			QUnit.start();
			equal(result.length, 1);
			equal('data:image/gif;base64,' + result[0].blobInfo.base64(), base64Src);
			strictEqual(result[0].image, document.getElementById('view').firstChild);
		});
	});
});