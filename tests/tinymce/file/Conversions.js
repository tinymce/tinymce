ModuleLoader.require(["tinymce/file/Conversions"], function(Conversions) {
	module("tinymce.file.Conversions");

	if (!tinymce.Env.fileApi) {
		test("File API not supported by browser.", function() {
			QUnit.ok(true);
		});

		return;
	}

	QUnit.asyncTest("uriToBlob", function() {
		Conversions.uriToBlob("data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D").then(Conversions.blobToDataUri).then(function(dataUri) {
			QUnit.equal(dataUri, "data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==");
		}).then(QUnit.start);
	});


	QUnit.asyncTest("uriToBlob", function () {
		var invalidBlobUriSrc = "blob:70BE8432-BA4D-4787-9AB9-86563351FBF7";

		Conversions.uriToBlob(invalidBlobUriSrc).then(function () {
			equal(true, false, "Conversion should fail.");
			QUnit.start();
		})['catch'](function (error) {
			equal(typeof error, 'string');
			equal(error.indexOf(invalidBlobUriSrc) !== -1, true);
			QUnit.start();
		});
	});
});