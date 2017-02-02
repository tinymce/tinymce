asynctest('browser.tinymce.core.noname', [
	'ephox.mcagar.api.LegacyUnit',
	'ephox.agar.api.Pipeline',
	"tinymce/file/Conversions"
], function (LegacyUnit, Pipeline, Conversions) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];
	var suite = LegacyUnit.createSuite();

	if (!tinymce.Env.fileApi) {
		suite.test("File API not supported by browser.", function () {
			QUnit.ok(true);
		});

		return;
	}

	QUnit.asyncTest("uriToBlob", function () {
		Conversions.uriToBlob("data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D").then(Conversions.blobToDataUri).then(function (dataUri) {
			QUnit.equal(dataUri, "data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==");
		}).then(QUnit.start);
	});

	Pipeline.async({}, suite.toSteps({}), function () {
		success();
	}, failure);
});