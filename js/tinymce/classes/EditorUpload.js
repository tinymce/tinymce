/**
 * EditorUpload.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Handles image uploads, updates undo stack and patches over various internal functions.
 *
 * @private
 * @class tinymce.EditorUpload
 */
define("tinymce/EditorUpload", [
	"tinymce/util/Arr",
	"tinymce/file/Uploader",
	"tinymce/file/ImageScanner",
	"tinymce/file/BlobCache",
	"tinymce/file/UploadStatus"
], function(Arr, Uploader, ImageScanner, BlobCache, UploadStatus) {
	return function(editor) {
		var blobCache = new BlobCache(), uploader, imageScanner, settings = editor.settings;
		var uploadStatus = new UploadStatus();

		function aliveGuard(callback) {
			return function(result) {
				if (editor.selection) {
					return callback(result);
				}

				return [];
			};
		}

		// Replaces strings without regexps to avoid FF regexp to big issue
		function replaceString(content, search, replace) {
			var index = 0;

			do {
				index = content.indexOf(search, index);

				if (index !== -1) {
					content = content.substring(0, index) + replace + content.substr(index + search.length);
					index += replace.length - search.length + 1;
				}
			} while (index !== -1);

			return content;
		}

		function replaceImageUrl(content, targetUrl, replacementUrl) {
			content = replaceString(content, 'src="' + targetUrl + '"', 'src="' + replacementUrl + '"');
			content = replaceString(content, 'data-mce-src="' + targetUrl + '"', 'data-mce-src="' + replacementUrl + '"');

			return content;
		}

		function replaceUrlInUndoStack(targetUrl, replacementUrl) {
			Arr.each(editor.undoManager.data, function(level) {
				level.content = replaceImageUrl(level.content, targetUrl, replacementUrl);
			});
		}

		function openNotification() {
			return editor.notificationManager.open({
				text: editor.translate('Image uploading...'),
				type: 'info',
				timeout: -1,
				progressBar: true
			});
		}

		function replaceImageUri(image, resultUri) {
			blobCache.removeByUri(image.src);
			replaceUrlInUndoStack(image.src, resultUri);

			editor.$(image).attr({
				src: resultUri,
				'data-mce-src': editor.convertURL(resultUri, 'src')
			});
		}

		function uploadImages(callback) {
			if (!uploader) {
				uploader = new Uploader(uploadStatus, {
					url: settings.images_upload_url,
					basePath: settings.images_upload_base_path,
					credentials: settings.images_upload_credentials,
					handler: settings.images_upload_handler
				});
			}

			return scanForImages().then(aliveGuard(function(imageInfos) {
				var blobInfos;

				blobInfos = Arr.map(imageInfos, function(imageInfo) {
					return imageInfo.blobInfo;
				});

				return uploader.upload(blobInfos, openNotification).then(aliveGuard(function(result) {
					result = Arr.map(result, function(uploadInfo, index) {
						var image = imageInfos[index].image;

						if (uploadInfo.status && editor.settings.images_replace_blob_uris !== false) {
							replaceImageUri(image, uploadInfo.url);
						}

						return {
							element: image,
							status: uploadInfo.status
						};
					});

					if (callback) {
						callback(result);
					}

					return result;
				}));
			}));
		}

		function uploadImagesAuto(callback) {
			if (settings.automatic_uploads !== false) {
				return uploadImages(callback);
			}
		}

		function isValidDataUriImage(imgElm) {
			return settings.images_dataimg_filter ? settings.images_dataimg_filter(imgElm) : true;
		}

		function scanForImages() {
			if (!imageScanner) {
				imageScanner = new ImageScanner(uploadStatus, blobCache);
			}

			return imageScanner.findAll(editor.getBody(), isValidDataUriImage).then(aliveGuard(function(result) {
				Arr.each(result, function(resultItem) {
					replaceUrlInUndoStack(resultItem.image.src, resultItem.blobInfo.blobUri());
					resultItem.image.src = resultItem.blobInfo.blobUri();
					resultItem.image.removeAttribute('data-mce-src');
				});

				return result;
			}));
		}

		function destroy() {
			blobCache.destroy();
			uploadStatus.destroy();
			imageScanner = uploader = null;
		}

		function replaceBlobUris(content) {
			return content.replace(/src="(blob:[^"]+)"/g, function(match, blobUri) {
				var resultUri = uploadStatus.getResultUri(blobUri);

				if (resultUri) {
					return 'src="' + resultUri + '"';
				}

				var blobInfo = blobCache.getByUri(blobUri);

				if (!blobInfo) {
					blobInfo = Arr.reduce(editor.editorManager.editors, function(result, editor) {
						return result || editor.editorUpload.blobCache.getByUri(blobUri);
					}, null);
				}

				if (blobInfo) {
					return 'src="data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64() + '"';
				}

				return match;
			});
		}

		editor.on('setContent', function() {
			if (editor.settings.automatic_uploads !== false) {
				uploadImagesAuto();
			} else {
				scanForImages();
			}
		});

		editor.on('RawSaveContent', function(e) {
			e.content = replaceBlobUris(e.content);
		});

		editor.on('getContent', function(e) {
			if (e.source_view || e.format == 'raw') {
				return;
			}

			e.content = replaceBlobUris(e.content);
		});

		editor.on('PostRender', function() {
			editor.parser.addNodeFilter('img', function(images) {
				Arr.each(images, function(img) {
					var src = img.attr('src');

					if (blobCache.getByUri(src)) {
						return;
					}

					var resultUri = uploadStatus.getResultUri(src);
					if (resultUri) {
						img.attr('src', resultUri);
					}
				});
			});
		});

		return {
			blobCache: blobCache,
			uploadImages: uploadImages,
			uploadImagesAuto: uploadImagesAuto,
			scanForImages: scanForImages,
			destroy: destroy
		};
	};
});