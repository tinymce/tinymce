/**
 * Conversions.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Converts blob/uris/images back and forth.
 */
define("tinymce/imagetoolsplugin/Conversions", [
	"tinymce/util/Promise",
	"tinymce/imagetoolsplugin/Canvas",
	"tinymce/imagetoolsplugin/Mime",
	"tinymce/imagetoolsplugin/ImageSize"
], function(Promise, Canvas, Mime, ImageSize) {
	function loadImage(image) {
		return new Promise(function(resolve) {
			function loaded() {
				image.removeEventListener('load', loaded);
				resolve(image);
			}

			if (image.complete) {
				resolve(image);
			} else {
				image.addEventListener('load', loaded);
			}
		});
	}

	function imageToCanvas(image) {
		return loadImage(image).then(function(image) {
			var context, canvas;

			canvas = Canvas.create(ImageSize.getWidth(image), ImageSize.getHeight(image));
			context = Canvas.get2dContext(canvas);
			context.drawImage(image, 0, 0);

			return canvas;
		});
	}

	function imageToBlob(image) {
		return loadImage(image).then(function(image) {
			var src = image.src;

			if (src.indexOf('blob:') === 0) {
				return blobUriToBlob(src);
			}

			if (src.indexOf('data:') === 0) {
				return dataUriToBlob(src);
			}

			return imageToCanvas(image).then(function(canvas) {
				return dataUriToBlob(canvas.toDataURL(Mime.guessMimeType(src)));
			});
		});
	}

	function blobToImage(blob) {
		return new Promise(function(resolve) {
			var image = new Image();

			function loaded() {
				image.removeEventListener('load', loaded);
				resolve(image);
			}

			image.addEventListener('load', loaded);
			image.src = URL.createObjectURL(blob);

			if (image.complete) {
				loaded();
			}
		});
	}

	function blobUriToBlob(url) {
		return new Promise(function(resolve) {
			var xhr = new XMLHttpRequest();

			xhr.open('GET', url, true);
			xhr.responseType = 'blob';

			xhr.onload = function() {
				if (this.status == 200) {
					resolve(this.response);
				}
			};

			xhr.send();
		});
	}

	function dataUriToBlob(uri) {
		return new Promise(function(resolve) {
			var str, arr, i, matches, type, blobBuilder;

			uri = uri.split(',');

			matches = /data:([^;]+)/.exec(uri[0]);
			if (matches) {
				type = matches[1];
			}

			str = atob(uri[1]);

			if (window.WebKitBlobBuilder) {
				/*globals WebKitBlobBuilder:false */
				blobBuilder = new WebKitBlobBuilder();

				arr = new ArrayBuffer(str.length);
				for (i = 0; i < arr.length; i++) {
					arr[i] = str.charCodeAt(i);
				}

				blobBuilder.append(arr);

				resolve(blobBuilder.getBlob(type));
				return;
			}

			arr = new Uint8Array(str.length);

			for (i = 0; i < arr.length; i++) {
				arr[i] = str.charCodeAt(i);
			}

			resolve(new Blob([arr], {type: type}));
		});
	}

	function uriToBlob(url) {
		if (url.indexOf('blob:') === 0) {
			return blobUriToBlob(url);
		}

		if (url.indexOf('data:') === 0) {
			return dataUriToBlob(url);
		}

		return null;
	}

	function canvasToBlob(canvas, type) {
		return dataUriToBlob(canvas.toDataURL(type));
	}

	function blobToDataUri(blob) {
		return new Promise(function(resolve) {
			var reader = new FileReader();

			reader.onloadend = function() {
				resolve(reader.result);
			};

			reader.readAsDataURL(blob);
		});
	}

	function blobToBase64(blob) {
		return blobToDataUri(blob).then(function(dataUri) {
			return dataUri.split(',')[1];
		});
	}

	function revokeImageUrl(image) {
		URL.revokeObjectURL(image.src);
	}

	return {
		blobToImage: blobToImage,
		imageToBlob: imageToBlob,
		uriToBlob: uriToBlob,
		blobToDataUri: blobToDataUri,
		blobToBase64: blobToBase64,
		imageToCanvas: imageToCanvas,
		canvasToBlob: canvasToBlob,
		revokeImageUrl: revokeImageUrl
	};
});