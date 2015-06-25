/**
 * Uploader.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Upload blobs or blob infos to the specified URL or handler.
 *
 * @private
 * @class tinymce.file.Uploader
 * @example
 * var uploader = new Uploader({
 *     url: '/upload.php',
 *     basePath: '/base/path',
 *     credentials: true,
 *     handler: function(data, success, failure) {
 *         ...
 *     }
 * });
 *
 * uploader.upload(blobInfos).then(function(result) {
 *     ...
 * });
 */
define("tinymce/file/Uploader", [
	"tinymce/util/Promise",
	"tinymce/util/Tools"
], function(Promise, Tools) {
	return function(settings) {
		function fileName(blobInfo) {
			var ext, extensions;

			extensions = {
				'image/jpeg': 'jpg',
				'image/jpg': 'jpg',
				'image/gif': 'gif',
				'image/png': 'png'
			};

			ext = extensions[blobInfo.blob().type.toLowerCase()] || 'dat';

			return blobInfo.id() + '.' + ext;
		}

		function pathJoin(path1, path2) {
			if (path1) {
				return path1.replace(/\/$/, '') + '/' + path2.replace(/^\//, '');
			}

			return path2;
		}

		function blobInfoToData(blobInfo) {
			return {
				id: blobInfo.id,
				blob: blobInfo.blob,
				base64: blobInfo.base64,
				filename: Tools.constant(fileName(blobInfo))
			};
		}

		function defaultHandler(blobInfo, success, failure) {
			var xhr, formData;

			xhr = new XMLHttpRequest();
			xhr.withCredentials = settings.credentials;
			xhr.open('POST', settings.url);

			xhr.onload = function() {
				var json;

				if (xhr.status != 200) {
					failure("HTTP Error: " + xhr.status);
					return;
				}

				json = JSON.parse(xhr.responseText);

				if (!json || typeof json.location != "string") {
					failure("Invalid JSON: " + xhr.responseText);
					return;
				}

				success(pathJoin(settings.basePath, json.location));
			};

			formData = new FormData();
			formData.append('file', blobInfo.blob(), fileName(blobInfo));

			xhr.send(formData);
		}

		function upload(blobInfos) {
			return new Promise(function(resolve, reject) {
				var handler = settings.handler, queue, index = 0, uploadedIdMap = {};

				// If no url is configured then resolve
				if (!settings.url && handler === defaultHandler) {
					resolve([]);
					return;
				}

				queue = Tools.map(blobInfos, function(blobInfo) {
					return {
						status: false,
						blobInfo: blobInfo,
						url: ''
					};
				});

				function uploadNext() {
					var previousResult, queueItem = queue[index++];

					if (!queueItem) {
						resolve(queue);
						return;
					}

					// Only upload unique blob once
					previousResult = uploadedIdMap[queueItem.blobInfo.id()];
					if (previousResult) {
						queueItem.url = previousResult;
						queueItem.status = true;
						uploadNext();
						return;
					}

					handler(blobInfoToData(queueItem.blobInfo), function(url) {
						uploadedIdMap[queueItem.blobInfo.id()] = url;
						queueItem.url = url;
						queueItem.status = true;
						uploadNext();
					}, function(failure) {
						queueItem.status = false;
						reject(failure);
					});
				}

				uploadNext();
			});
		}

		settings = Tools.extend({
			credentials: false,
			handler: defaultHandler
		}, settings);

		return {
			upload: upload
		};
	};
});