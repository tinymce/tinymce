(function() {
	var testBlob, testBlobDataUri;

	if (!tinymce.Env.fileApi) {
		return;
	}

	module("tinymce.EditorUpload", {
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
		},

		teardown: function() {
			editor.editorUpload.destroy();
		}
	});

	function imageHtml(uri) {
		return tinymce.DOM.createHTML('img', {src: uri});
	}

	asyncTest('_scanForImages', function() {
		editor.setContent(imageHtml(testBlobDataUri));

		editor._scanForImages().then(function(result) {
			var blobInfo = result[0].blobInfo;

			QUnit.equal("data:" + blobInfo.blob().type + ";base64," + blobInfo.base64(), testBlobDataUri);
			QUnit.equal('<p><img src="' + blobInfo.blobUri() + '" alt=""></p>', editor.getBody().innerHTML);
			QUnit.equal('<p><img src="data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64() + '" alt="" /></p>', editor.getContent());
			QUnit.strictEqual(editor.editorUpload.blobCache.get(blobInfo.id()), blobInfo);
		}).then(QUnit.start);
	});

	asyncTest('uploadImages', function() {
		var uploadedBlobInfo;

		function assertResult(result) {
			QUnit.strictEqual(result[0].status, true);
			QUnit.ok(result[0].element.src.indexOf(uploadedBlobInfo.id() + '.png') !== -1);
			QUnit.equal('<p><img src="' + uploadedBlobInfo.filename() + '" alt="" /></p>', editor.getContent());

			return result;
		}

		editor.setContent(imageHtml(testBlobDataUri));

		editor.settings.images_upload_handler = function(data, success) {
			uploadedBlobInfo = data;
			success(data.id() + '.png');
		};

		editor.uploadImages(assertResult).then(assertResult).then(function() {
			uploadedBlobInfo = null;

			return editor.uploadImages(function() {}).then(function(result) {
				QUnit.strictEqual(result.length, 0);
				QUnit.strictEqual(uploadedBlobInfo, null);
			});
		}).then(QUnit.start);
	});
})();
