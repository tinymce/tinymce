/**
 * EditorUpload.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
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

		function replaceImageUrl(content, targetUrl, replacementUrl) {
			return content.replace(
				new RegExp('src="' + regExpEscape(targetUrl) + '"', 'g'),
				function() {
					return 'src="' + replacementUrl + '"';
				}
			);
		}

		function replaceUrlInUndoStack(targetUrl, replacementUrl) {
			Tools.each(editor.undoManager.data, function(level) {
				level.content = replaceImageUrl(level.content, targetUrl, replacementUrl);
			});
		}

		function uploadImages(callback) {
			var uploader = new Uploader({
				url: editor.settings.upload_url,
				basePath: editor.settings.upload_base_path,
				credentials: editor.settings.upload_credentials,
				handler: editor.settings.upload_handler
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
						image.src = uploadInfo.url;
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