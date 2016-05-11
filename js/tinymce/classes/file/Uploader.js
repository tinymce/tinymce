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
	"tinymce/util/Tools",
	"tinymce/util/Fun"
], function(Promise, Tools, Fun) {
	return function(uploadStatus, settings) {
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
				filename: Fun.constant(fileName(blobInfo))
			};
		}

		function defaultHandler(blobInfo, success, failure, openNotification) {
			var xhr, formData, notification;

			xhr = new XMLHttpRequest();
			xhr.open('POST', settings.url);
			xhr.withCredentials = settings.credentials;

			notification = openNotification();

			xhr.upload.onprogress = function(e) {
				var percentLoaded = Math.round(e.loaded / e.total * 100);
				notification.progressBar.value(percentLoaded);
			};

			xhr.onerror = function() {
				notification.close();
				failure("Image upload failed due to a XHR Transport error. Code: " + xhr.status);
			};

			xhr.onload = function() {
				var json;

				notification.close();

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

		function noUpload() {
			return new Promise(function(resolve) {
				resolve([]);
			});
		}

		function blobInfoToPromise(blobInfo, openNotification) {
			return new Promise(function(resolve) {
				var handler = settings.handler;

				try {
					handler(blobInfoToData(blobInfo), function(url) {
						uploadStatus.markUploaded(blobInfo.blobUri(), url);

						resolve({
							url: url,
							blobInfo: blobInfo,
							status: true
						});
					}, function(failure) {
						resolve({
							url: '',
							blobInfo: blobInfo,
							status: false,
							error: failure
						});
					}, openNotification);
				} catch (ex) {
					resolve({
						url: '',
						blobInfo: blobInfo,
						status: false,
						error: ex.message
					});
				}
			});
		}

		function uploadBlobs(blobInfos, openNotification) {
			blobInfos = Tools.grep(blobInfos, function(blobInfo) {
				return !uploadStatus.hasBlobUri(blobInfo.blobUri());
			});

			Tools.each(blobInfos, function(blobInfo) {
				return uploadStatus.markPending(blobInfo.blobUri());
			});

			return Promise.all(Tools.map(blobInfos, function(blobInfo) {
				return blobInfoToPromise(blobInfo, openNotification);
			}));
		}

		function upload(blobInfos, openNotification) {
			return (!settings.url && settings.handler === defaultHandler) ? noUpload() : uploadBlobs(blobInfos, openNotification);
		}

		settings = Tools.extend({
			credentials: false,
			// We are adding a notify argument to this (at the moment, until it doesn't work)
			handler: defaultHandler
		}, settings);

		return {
			upload: upload
		};
	};
});