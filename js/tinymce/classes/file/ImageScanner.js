/**
 * ImageScanner.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Finds images with data uris or blob uris. If data uris are found it will convert them into blob uris.
 *
 * @private
 * @class tinymce.file.ImageScanner
 */
define("tinymce/file/ImageScanner", [
	"tinymce/util/Promise",
	"tinymce/util/Arr",
	"tinymce/file/Conversions",
	"tinymce/Env"
], function(Promise, Arr, Conversions, Env) {
	var count = 0;

	return function(blobCache) {
		var cachedPromises = {};

		function findAll(elm) {
			var images, promises;

			function imageToBlobInfo(img, resolve) {
				var base64, blobInfo;

				if (img.src.indexOf('blob:') === 0) {
					blobInfo = blobCache.getByUri(img.src);

					if (blobInfo) {
						resolve({
							image: img,
							blobInfo: blobInfo
						});
					}

					return;
				}

				base64 = Conversions.parseDataUri(img.src).data;
				blobInfo = blobCache.findFirst(function(cachedBlobInfo) {
					return cachedBlobInfo.base64() === base64;
				});

				if (blobInfo) {
					resolve({
						image: img,
						blobInfo: blobInfo
					});
				} else {
					Conversions.uriToBlob(img.src).then(function(blob) {
						var blobInfoId = 'blobid' + (count++),
							blobInfo = blobCache.create(blobInfoId, blob, base64);

						blobCache.add(blobInfo);

						resolve({
							image: img,
							blobInfo: blobInfo
						});
					});
				}
			}

			images = Arr.filter(elm.getElementsByTagName('img'), function(img) {
				var src = img.src;

				if (!Env.fileApi) {
					return false;
				}

				if (img.hasAttribute('data-mce-bogus')) {
					return false;
				}

				if (img.hasAttribute('data-mce-placeholder')) {
					return false;
				}

				if (!src || src == Env.transparentSrc) {
					return false;
				}

				return src.indexOf('data:') === 0 || src.indexOf('blob:') === 0;
			});

			promises = Arr.map(images, function(img) {
				var newPromise;

				if (cachedPromises[img.src]) {
					// Since the cached promise will return the cached image
					// We need to wrap it and resolve with the actual image
					return new Promise(function(resolve) {
						cachedPromises[img.src].then(function(imageInfo) {
							resolve({
								image: img,
								blobInfo: imageInfo.blobInfo
							});
						});
					});
				}

				newPromise = new Promise(function(resolve) {
					imageToBlobInfo(img, resolve);
				}).then(function(result) {
					delete cachedPromises[result.image.src];
					return result;
				})['catch'](function(error) {
					delete cachedPromises[img.src];
					return error;
				});

				cachedPromises[img.src] = newPromise;

				return newPromise;
			});

			return Promise.all(promises);
		}

		return {
			findAll: findAll
		};
	};
});