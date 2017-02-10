ModuleLoader.require([
	"tinymce/file/Conversions",
	"tinymce/Env"
], function(Conversions, Env) {
	var testBlobDataUri;

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
				automatic_uploads: false,
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

					Conversions.uriToBlob(testBlobDataUri).then(function() {
						QUnit.start();
					});
				}
			});
		},

		teardown: function() {
			editor.editorUpload.destroy();
			editor.settings.automatic_uploads = false;
			delete editor.settings.images_replace_blob_uris;
			delete editor.settings.images_dataimg_filter;
		}
	});

	function imageHtml(uri) {
		return tinymce.DOM.createHTML('img', {src: uri});
	}

	function assertResult(uploadedBlobInfo, result) {
		QUnit.strictEqual(result.length, 1);
		QUnit.strictEqual(result[0].status, true);
		QUnit.ok(result[0].element.src.indexOf(uploadedBlobInfo.id() + '.png') !== -1);
		QUnit.equal('<p><img src="' + uploadedBlobInfo.filename() + '" /></p>', editor.getContent());

		return result;
	}

	function hasBlobAsSource(elm) {
		return elm.src.indexOf('blob:') === 0;
	}

	asyncTest('_scanForImages', function() {
		editor.setContent(imageHtml(testBlobDataUri));

		editor._scanForImages().then(function(result) {
			var blobInfo = result[0].blobInfo;

			QUnit.equal("data:" + blobInfo.blob().type + ";base64," + blobInfo.base64(), testBlobDataUri);
			QUnit.equal(Utils.normalizeHtml(editor.getBody().innerHTML), '<p><img src="' + blobInfo.blobUri() + '" /></p>');
			QUnit.equal('<p><img src="data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64() + '" /></p>', editor.getContent());
			QUnit.strictEqual(editor.editorUpload.blobCache.get(blobInfo.id()), blobInfo);
		}).then(QUnit.start);
	});

	asyncTest('replace uploaded blob uri with result uri (copy/paste of an uploaded blob uri)', function() {
		editor.setContent(imageHtml(testBlobDataUri));

		editor.settings.images_upload_handler = function(data, success) {
			success('file.png');
		};

		editor._scanForImages().then(function(result) {
			var blobUri = result[0].blobInfo.blobUri();

			editor.uploadImages(function() {
				editor.setContent(imageHtml(blobUri));
				QUnit.strictEqual(hasBlobAsSource(editor.$('img')[0]), false);
				QUnit.strictEqual(editor.getContent(), '<p><img src="file.png" /></p>');
				QUnit.start();
			});
		});
	});

	asyncTest('don\'t replace uploaded blob uri with result uri (copy/paste of an uploaded blob uri) since blob uris are retained', function() {
		editor.settings.images_replace_blob_uris = false;
		editor.setContent(imageHtml(testBlobDataUri));

		editor.settings.images_upload_handler = function(data, success) {
			success('file.png');
		};

		editor._scanForImages().then(function(result) {
			var blobUri = result[0].blobInfo.blobUri();

			editor.uploadImages(function() {
				editor.setContent(imageHtml(blobUri));
				QUnit.strictEqual(hasBlobAsSource(editor.$('img')[0]), true);
				QUnit.strictEqual(editor.getContent(), '<p><img src="file.png" /></p>');
				QUnit.start();
			});
		});
	});

	asyncTest('uploadImages (callback)', function() {
		var uploadedBlobInfo;

		editor.setContent(imageHtml(testBlobDataUri));

		editor.settings.images_upload_handler = function(data, success) {
			uploadedBlobInfo = data;
			success(data.id() + '.png');
		};

		editor.uploadImages(function(result) {
			assertResult(uploadedBlobInfo, result);

			editor.uploadImages(function(result) {
				QUnit.strictEqual(result.length, 0);
				QUnit.start();
			});
		});
	});

	asyncTest('uploadImages (promise)', function() {
		var uploadedBlobInfo;

		editor.setContent(imageHtml(testBlobDataUri));

		editor.settings.images_upload_handler = function(data, success) {
			uploadedBlobInfo = data;
			success(data.id() + '.png');
		};

		editor.uploadImages().then(function(result) {
			assertResult(uploadedBlobInfo, result);
		}).then(function() {
			uploadedBlobInfo = null;

			return editor.uploadImages().then(function(result) {
				QUnit.strictEqual(result.length, 0);
				QUnit.strictEqual(uploadedBlobInfo, null);
				QUnit.start();
			});
		});
	});

	asyncTest('uploadImages retain blob urls after upload', function() {
		var uploadedBlobInfo;

		function assertResult(result) {
			QUnit.strictEqual(result[0].status, true);
			QUnit.ok(hasBlobAsSource(result[0].element), 'Not a blob url');
			QUnit.equal('<p><img src="' + uploadedBlobInfo.filename() + '" /></p>', editor.getContent());

			return result;
		}

		editor.setContent(imageHtml(testBlobDataUri));

		editor.settings.images_replace_blob_uris = false;
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

	asyncTest('uploadConcurrentImages', function() {
		var uploadCount = 0, callCount = 0;

		function done(result) {
			callCount++;

			if (callCount == 2) {
				QUnit.start();
				equal(uploadCount, 1, 'Should only be one upload.');
			}

			equal(editor.getContent(), '<p><img src="myimage.png" /></p>');
			equal(result[0].element, editor.$('img')[0]);
			equal(result[0].status, true);
		}

		editor.setContent(imageHtml(testBlobDataUri));

		editor.settings.images_upload_handler = function(data, success) {
			uploadCount++;

			setTimeout(function() {
				success('myimage.png');
			}, 0);
		};

		editor.uploadImages(done);
		editor.uploadImages(done);
	});

	asyncTest('uploadConcurrentImages (fail)', function() {
		var uploadCount = 0, callCount = 0;

		function done(result) {
			callCount++;

			if (callCount == 2) {
				QUnit.start();
				// This is in exact since the status of the image can be pending or failed meaing it should try again
				ok(uploadCount >= 1, 'Should at least be one.');
			}

			equal(result[0].element, editor.$('img')[0]);
			equal(result[0].status, false);
		}

		editor.setContent(imageHtml(testBlobDataUri));

		editor.settings.images_upload_handler = function(data, success, failure) {
			uploadCount++;

			setTimeout(function() {
				failure('Error');
			}, 0);
		};

		editor.uploadImages(done);
		editor.uploadImages(done);
	});

	asyncTest('Don\'t upload transparent image', function() {
		var uploadCount = 0;

		function done() {
			QUnit.start();
			equal(uploadCount, 0, 'Should not upload.');
		}

		editor.setContent(imageHtml(Env.transparentSrc));

		editor.settings.images_upload_handler = function(data, success) {
			uploadCount++;
			success('url');
		};

		editor.uploadImages(done);
	});

	asyncTest('Don\'t upload bogus image', function() {
		var uploadCount = 0;

		function done() {
			QUnit.start();
			equal(uploadCount, 0, 'Should not upload.');
		}

		editor.getBody().innerHTML = '<img src="' + testBlobDataUri + '" data-mce-bogus="1">';

		editor.settings.images_upload_handler = function(data, success) {
			uploadCount++;
			success('url');
		};

		editor.uploadImages(done);
	});

	asyncTest('Don\'t upload filtered image', function() {
		var uploadCount = 0;

		function done() {
			QUnit.start();
			equal(uploadCount, 0, 'Should not upload.');
		}

		editor.getBody().innerHTML = (
			'<img src="' + testBlobDataUri + '" data-skip="1">'
		);

		editor.settings.images_dataimg_filter = function(img) {
			return !img.hasAttribute('data-skip');
		};

		editor.settings.images_upload_handler = function(data, success) {
			uploadCount++;
			success('url');
		};

		editor.uploadImages(done);
	});

	test('Retain blobs not in blob cache', function() {
		editor.getBody().innerHTML = '<img src="blob:http%3A//host/f8d1e462-8646-485f-87c5-f9bcee5873c6">';
		QUnit.equal('<p><img src="blob:http%3A//host/f8d1e462-8646-485f-87c5-f9bcee5873c6" /></p>', editor.getContent());
	});
});
