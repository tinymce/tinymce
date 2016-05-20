/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 *
 * Settings:
 *  imagetools_cors_hosts - Array of remote domains that has CORS setup.
 *  imagetools_proxy - Url to proxy that streams images from remote host to local host.
 *  imagetools_toolbar - Toolbar items to render when an editable image is selected.
 */
define("tinymce/imagetoolsplugin/Plugin", [
	"global!tinymce.PluginManager",
	"global!tinymce.Env",
	"global!tinymce.util.Promise",
	"global!tinymce.util.URI",
	"global!tinymce.util.Tools",
	"global!tinymce.util.Delay",
	"ephox/imagetools/api/ImageTransformations",
	"ephox/imagetools/api/BlobConversions",
	"tinymce/imagetoolsplugin/Dialog",
	"tinymce/imagetoolsplugin/ImageSize",
	"tinymce/imagetoolsplugin/Proxy"
], function(PluginManager, Env, Promise, URI, Tools, Delay, ImageTransformations, BlobConversions, Dialog, ImageSize, Proxy) {
	var plugin = function(editor) {
		var count = 0, imageUploadTimer, lastSelectedImage;

		if (!Env.fileApi) {
			return;
		}

		function displayError(error) {
			editor.notificationManager.open({
				text: error,
				type: 'error'
			});
		}

		function getSelectedImage() {
			return editor.selection.getNode();
		}

		function createId() {
			return 'imagetools' + count++;
		}

		function isLocalImage(img) {
			var url = img.src;

			return url.indexOf('data:') === 0 || url.indexOf('blob:') === 0 || new URI(url).host === editor.documentBaseURI.host;
		}

		function isCorsImage(img) {
			return Tools.inArray(editor.settings.imagetools_cors_hosts, new URI(img.src).host) !== -1;
		}

		function getApiKey() {
			return editor.settings.api_key || editor.settings.imagetools_api_key;
		}

		function imageToBlob(img) {
			var src = img.src, apiKey;

			if (isCorsImage(img)) {
				return Proxy.getUrl(img.src, null);
			}

			if (!isLocalImage(img)) {
				src = editor.settings.imagetools_proxy;
				src += (src.indexOf('?') === -1 ? '?' : '&') + 'url=' + encodeURIComponent(img.src);
				apiKey = getApiKey();
				return Proxy.getUrl(src, apiKey);
			}

			return BlobConversions.imageToBlob(img);
		}

		function findSelectedBlob() {
			var blobInfo;

			blobInfo = editor.editorUpload.blobCache.getByUri(getSelectedImage().src);
			if (blobInfo) {
				return blobInfo.blob();
			}

			return imageToBlob(getSelectedImage());
		}

		function startTimedUpload() {
			imageUploadTimer = Delay.setEditorTimeout(editor, function() {
				editor.editorUpload.uploadImagesAuto();
			}, 30000);
		}

		function cancelTimedUpload() {
			clearTimeout(imageUploadTimer);
		}

		function updateSelectedImage(blob, uploadImmediately) {
			return BlobConversions.blobToDataUri(blob).then(function(dataUri) {
				var id, base64, blobCache, blobInfo, selectedImage;

				selectedImage = getSelectedImage();
				id = createId();
				blobCache = editor.editorUpload.blobCache;
				base64 = URI.parseDataUri(dataUri).data;

				blobInfo = blobCache.create(id, blob, base64);
				blobCache.add(blobInfo);

				editor.undoManager.transact(function() {
					function imageLoadedHandler() {
						editor.$(selectedImage).off('load', imageLoadedHandler);
						editor.nodeChanged();

						if (uploadImmediately) {
							editor.editorUpload.uploadImagesAuto();
						} else {
							cancelTimedUpload();
							startTimedUpload();
						}
					}

					editor.$(selectedImage).on('load', imageLoadedHandler);

					editor.$(selectedImage).attr({
						src: blobInfo.blobUri()
					}).removeAttr('data-mce-src');
				});

				return blobInfo;
			});
		}

		function selectedImageOperation(fn) {
			return function() {
				return editor._scanForImages().then(findSelectedBlob).then(fn).then(updateSelectedImage, displayError);
			};
		}

		function rotate(angle) {
			return function() {
				return selectedImageOperation(function(blob) {
					var size = ImageSize.getImageSize(getSelectedImage());

					if (size) {
						ImageSize.setImageSize(getSelectedImage(), {
							w: size.h,
							h: size.w
						});
					}

					return ImageTransformations.rotate(blob, angle);
				})();
			};
		}

		function flip(axis) {
			return function() {
				return selectedImageOperation(function(blob) {
					return ImageTransformations.flip(blob, axis);
				})();
			};
		}

		function editImageDialog() {
			var img = getSelectedImage(), originalSize = ImageSize.getNaturalImageSize(img);
			var handleDialogBlob = function(blob) {
				return new Promise(function(resolve) {
					BlobConversions.blobToImage(blob).then(function(newImage) {
						var newSize = ImageSize.getNaturalImageSize(newImage);

						if (originalSize.w != newSize.w || originalSize.h != newSize.h) {
							if (ImageSize.getImageSize(img)) {
								ImageSize.setImageSize(img, newSize);
							}
						}

						URL.revokeObjectURL(newImage.src);
						resolve(blob);
					});
				});
			};

			var openDialog = function (blob) {
				return Dialog.edit(blob).then(handleDialogBlob).then(function(blob) {
					updateSelectedImage(blob, true);
				}, function () {
					// Close dialog
				});
			};

			if (img) {
				imageToBlob(img).then(openDialog, displayError);
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

		function addEvents() {
			editor.on('NodeChange', function(e) {
				//If the last node we selected was an image
				//And had a source that doesn't match the current blob url
				//We need to attempt to upload it
				if (lastSelectedImage && lastSelectedImage.src != e.element.src) {
					cancelTimedUpload();
					editor.editorUpload.uploadImagesAuto();
					lastSelectedImage = undefined;
				}

				//Set up the lastSelectedImage
				if (isEditableImage(e.element)) {
					lastSelectedImage = e.element;
				}
			});
		}

		function isEditableImage(img) {
			var selectorMatched = editor.dom.is(img, 'img:not([data-mce-object],[data-mce-placeholder])');

			return selectorMatched && (isLocalImage(img) || isCorsImage(img) || editor.settings.imagetools_proxy);
		}

		function addToolbars() {
			var toolbarItems = editor.settings.imagetools_toolbar;

			if (!toolbarItems) {
				toolbarItems = 'rotateleft rotateright | flipv fliph | crop editimage imageoptions';
			}

			editor.addContextToolbar(
				isEditableImage,
				toolbarItems
			);
		}

		addButtons();
		addToolbars();
		addEvents();

		editor.addCommand('mceEditImage', editImageDialog);
	};

	PluginManager.add('imagetools', plugin);

	return function() {};
});
