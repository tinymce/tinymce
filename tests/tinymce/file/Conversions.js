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
});