ModuleLoader.require([
	"tinymce/file/UploadStatus"
], function(UploadStatus) {
	module("tinymce.file.UploadStatus");

	QUnit.test("hasBlobUri/markPending", function() {
		var status = new UploadStatus();

		strictEqual(status.hasBlobUri("nonexisting_uri"), false);
		status.markPending("existing_uri");
		strictEqual(status.hasBlobUri("existing_uri"), true);
		status.markUploaded("existing_uri", "uri");
		strictEqual(status.getResultUri("existing_uri"), "uri");
		status.markUploaded("existing_uri2", "uri2");
		strictEqual(status.getResultUri("existing_uri2"), "uri2");
	});
});