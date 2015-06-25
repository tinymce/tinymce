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
	"tinymce/util/Tools",
	"tinymce/file/Uploader",
	"tinymce/file/ImageScanner",
	"tinymce/file/BlobCache"
], function(Tools, Uploader, ImageScanner, BlobCache) {
	return function(editor) {
		var blobCache = new BlobCache();

		function regExpEscape(str) {
			return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		}

		function replaceAttribValue(content, name, targetValue, newValue) {
			return content.replace(
				new RegExp(name + '="' + regExpEscape(targetValue) + '"', 'g'),
				function() {
					return name + '="' + newValue + '"';
				}
			);
		}

		function replaceImageUrl(content, targetUrl, replacementUrl) {
			content = replaceAttribValue(content, "src", targetUrl, replacementUrl);
			content = replaceAttribValue(content, "data-mce-src", targetUrl, replacementUrl);

			return content;
		}

		function replaceUrlInUndoStack(targetUrl, replacementUrl) {
			Tools.each(editor.undoManager.data, function(level) {
				level.content = replaceImageUrl(level.content, targetUrl, replacementUrl);
			});
		}

		function uploadImages(callback) {
			var uploader = new Uploader({
				url: editor.settings.images_upload_url,
				basePath: editor.settings.images_upload_base_path,
				credentials: editor.settings.images_upload_credentials,
				handler: editor.settings.images_upload_handler
			});

			function imageInfosToBlobInfos(imageInfos) {
				return Tools.map(imageInfos, function(imageInfo) {
					return imageInfo.blobInfo;
				});
			}

			return scanForImages().then(imageInfosToBlobInfos).then(uploader.upload).then(function(result) {
				result = Tools.map(result, function(uploadInfo) {
					var image;

					image = editor.dom.select('img[src="' + uploadInfo.blobInfo.blobUri() + '"]')[0];

					if (image) {
						replaceUrlInUndoStack(image.src, uploadInfo.url);

						editor.$(image).attr({
							src: uploadInfo.url,
							'data-mce-src': editor.convertURL(uploadInfo.url, 'src')
						});
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
			}, function() {
				// Silent
				// TODO: Maybe execute some failure callback here?
			});
		}

		function scanForImages() {
			return ImageScanner.findAll(editor.getBody(), blobCache).then(function(result) {
				Tools.each(result, function(resultItem) {
					replaceUrlInUndoStack(resultItem.image.src, resultItem.blobInfo.blobUri());
					resultItem.image.src = resultItem.blobInfo.blobUri();
				});

				return result;
			});
		}

		function destroy() {
			blobCache.destroy();
		}

		editor.on('setContent paste', scanForImages);

		editor.on('getContent', function(e) {
			if (e.source_view || e.format == 'raw') {
				return;
			}

			e.content = e.content.replace(/src="(blob:[^"]+)"/g, function(match, blobUri) {
				var blobInfo = blobCache.getByUri(blobUri);

				return 'src="data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64() + '"';
			});
		});

		return {
			blobCache: blobCache,
			uploadImages: uploadImages,
			scanForImages: scanForImages,
			destroy: destroy
		};
	};
});