(function() {
	var testBlob, testBlobDataUri;

	module("tinymce.Editor.uploadImages", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				add_unload_trigger: false,
				disable_nodechange: true,
				skin: false,
				entities: 'raw',
				indent: false,
				init_instance_callback: function(ed) {
					var canvas, context;

					window.editor = ed;

					canvas = document.createElement("canvas");
					canvas.width = 320;
					canvas.height = 200;

					context = canvas.getContext("2d");
					context.fillStyle = "#ff0000";
					context.fillRect(0, 0, 160, 100);
					context.fillStyle = "#00ff00";
					context.fillRect(160, 0, 160, 100);
					context.fillStyle = "#0000ff";
					context.fillRect(0, 100, 160, 100);
					context.fillStyle = "#ff00ff";
					context.fillRect(160, 100, 160, 100);

					testBlobDataUri = canvas.toDataURL();

					tinymce.file.Conversions.uriToBlob(testBlobDataUri).then(function(blob) {
						testBlob = blob;
						QUnit.start();
					});
				}
			});
		}
	});

	function imageHtml(uri) {
		return tinymce.DOM.createHTML('img', {src: uri});
	}

	if (!tinymce.Env.fileApi) {
		test("File API not supported by browser.", function() {
			QUnit.ok(true);
		});

		return;
	}

	asyncTest('_scanForImages', function() {
		editor.setContent(imageHtml(testBlobDataUri));

		editor._scanForImages().then(function(result) {
			var blobInfo = result[0].blobInfo;

			QUnit.equal("data:" + blobInfo.blob().type + ";base64," + blobInfo.base64(), testBlobDataUri);
			QUnit.equal('<p><img src="' + blobInfo.blobUri() + '" alt=""></p>', editor.getBody().innerHTML);
			QUnit.strictEqual(editor.blobCache.get(blobInfo.id()), blobInfo);
		}).then(QUnit.start);
	});
})();
