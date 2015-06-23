define("tinymce/imagetoolsplugin/Plugin", [
	"tinymce/PluginManager",
	"tinymce/Env",
	"tinymce/util/Promise",
	"tinymce/imagetoolsplugin/ImageTools",
	"tinymce/imagetoolsplugin/Conversions",
	"tinymce/imagetoolsplugin/Dialog"
], function(PluginManager, Env, Promise, ImageTools, Conversions, Dialog) {
	PluginManager.add('imagetools', function(editor) {
		var count = 0;

		if (!Env.fileApi) {
			return;
		}

		/*
		function startCrop() {
			var imageRect, viewPortRect;

			imageRect = getSelectedImage().getBoundingClientRect();

			imageRect = {
				x: imageRect.left,
				y: imageRect.top,
				w: imageRect.width,
				h: imageRect.height
			};

			viewPortRect = {
				x: 0,
				y: 0,
				w: editor.getBody().scrollWidth,
				h: editor.getBody().scrollHeight
			};

			cropRect = new CropRect(imageRect, viewPortRect, imageRect, editor.getBody());
			cropRect.toggleVisibility(true);

			editor.selection.getSel().removeAllRanges();
			editor.nodeChanged();
		}

		function stopCrop() {
			if (cropRect) {
				cropRect.destroy();
				cropRect = null;
			}
		}
		*/

		function getSelectedImage() {
			return editor.selection.getNode();
		}

		function createId() {
			return 'imagetools' + count++;
		}

		function findSelectedBlobInfo() {
			var blobInfo;

			blobInfo = editor.editorUpload.blobCache.getByUri(getSelectedImage().src);
			if (blobInfo) {
				return blobInfo;
			}

			return Conversions.imageToBlob(getSelectedImage()).then(function(blob) {
				return Conversions.blobToBase64(blob).then(function(base64) {
					var blobCache = editor.editorUpload.blobCache;
					var blobInfo = blobCache.create(createId(), blob, base64);
					blobCache.add(blobInfo);
					return blobInfo;
				});
			});
		}

		function updateSelectedImage(blob) {
			return Conversions.blobToDataUri(blob).then(function(dataUri) {
				var id, base64, blobCache, blobInfo, selectedImage;

				selectedImage = getSelectedImage();
				id = createId();
				blobCache = editor.editorUpload.blobCache;
				base64 = dataUri;

				blobInfo = blobCache.create(id, blob, base64);
				blobCache.add(blobInfo);

				editor.undoManager.transact(function() {
					editor.$(selectedImage).attr({
						src: blobInfo.blobUri(),
						"data-mce-src": blobInfo.blobUri()
					});
				});

				return blobInfo;
			});
		}

		function selectedImageOperation(fn) {
			return function() {
				return editor._scanForImages().then(findSelectedBlobInfo).then(fn).then(updateSelectedImage);
			};
		}

		function rotate(angle) {
			return function() {
				return selectedImageOperation(function(blobInfo) {
					editor.$(getSelectedImage()).attr({
						width: getSelectedImage().height,
						height: getSelectedImage().width
					});

					return ImageTools.rotate(blobInfo.blob(), angle);
				})();
			};
		}

		function flip(axis) {
			return function() {
				return selectedImageOperation(function(blobInfo) {
					return ImageTools.flip(blobInfo.blob(), axis);
				})();
			};
		}

		function editImageDialog() {
			var img = getSelectedImage();

			if (img) {
				Dialog.edit(img.src).then(updateSelectedImage, function() {});
			}
		}

		function addButtons() {
			editor.addButton('rotateleft', {
				title: 'Rotate counterclockwise',
				onclick: rotate(-90)
			});

			editor.addButton('rotateright', {
				title: 'Rotate clockwise',
				onclick: rotate(90)
			});

			editor.addButton('flipv', {
				title: 'Flip vertically',
				onclick: flip('v')
			});

			editor.addButton('fliph', {
				title: 'Flip horizontally',
				onclick: flip('h')
			});

			editor.addButton('editimage', {
				title: 'Edit image',
				onclick: editImageDialog
			});

			editor.addButton('imageoptions', {
				title: 'Image options',
				icon: 'options',
				cmd: 'mceImage'
			});

			/*
			editor.addButton('crop', {
				title: 'Crop',
				onclick: startCrop
			});
			*/
		}

		function addToolbars() {
			var toolbarItems = editor.settings.imagetools_toolbar;

			if (!toolbarItems) {
				toolbarItems = 'rotateleft rotateright | flipv fliph | crop editimage imageoptions';
			}

			editor.addContextToolbar(
				'img:not([data-mce-object],[data-mce-placeholder])',
				toolbarItems
			);
		}

		addButtons();
		addToolbars();
	});
});