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
	"tinymce/file/BlobCache"
], function(Arr, Uploader, ImageScanner, BlobCache) {
	return function(editor) {
		var blobCache = new BlobCache(), uploader, imageScanner;

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

		function uploadImages(callback) {
			if (!uploader) {
				uploader = new Uploader({
					url: editor.settings.images_upload_url,
					basePath: editor.settings.images_upload_base_path,
					credentials: editor.settings.images_upload_credentials,
					handler: editor.settings.images_upload_handler
				});
			}

			return scanForImages().then(function(imageInfos) {
				var blobInfos;

				blobInfos = Arr.map(imageInfos, function(imageInfo) {
					return imageInfo.blobInfo;
				});

				return uploader.upload(blobInfos).then(function(result) {
					result = Arr.map(result, function(uploadInfo, index) {
						var image = imageInfos[index].image;

						replaceUrlInUndoStack(image.src, uploadInfo.url);

						editor.$(image).attr({
							src: uploadInfo.url,
							'data-mce-src': editor.convertURL(uploadInfo.url, 'src')
						});

						return {
							element: image,
							status: uploadInfo.status
						};
					});

					if (callback) {
						callback(result);
					}

					return result;
				});
			});
		}

		function scanForImages() {
			if (!imageScanner) {
				imageScanner = new ImageScanner(blobCache);
			}

			return imageScanner.findAll(editor.getBody()).then(function(result) {
				Arr.each(result, function(resultItem) {
					replaceUrlInUndoStack(resultItem.image.src, resultItem.blobInfo.blobUri());
					resultItem.image.src = resultItem.blobInfo.blobUri();
				});

				return result;
			});
		}

		function destroy() {
			blobCache.destroy();
			imageScanner = uploader = null;
		}

		function replaceBlobWithBase64(content) {
			return content.replace(/src="(blob:[^"]+)"/g, function(match, blobUri) {
				var blobInfo = blobCache.getByUri(blobUri);

				if (!blobInfo) {
					blobInfo = Arr.reduce(editor.editorManager.editors, function(result, editor) {
						return result || editor.editorUpload.blobCache.getByUri(blobUri);
					}, null);
				}

				if (blobInfo) {
					return 'src="data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64() + '"';
				}

				return match[0];
			});
		}

		editor.on('setContent paste', scanForImages);

		editor.on('RawSaveContent', function(e) {
			e.content = replaceBlobWithBase64(e.content);
		});

		editor.on('getContent', function(e) {
			if (e.source_view || e.format == 'raw') {
				return;
			}

			e.content = replaceBlobWithBase64(e.content);
		});

		return {
			blobCache: blobCache,
			uploadImages: uploadImages,
			scanForImages: scanForImages,
			destroy: destroy
		};
	};
});