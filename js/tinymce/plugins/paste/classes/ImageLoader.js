/**
 * ImageLoader.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Loads images as promises.
 *
 * @class tinymce.pasteplugin.ImageLoader
 * @private
 */
define("tinymce/pasteplugin/ImageLoader", [
	"tinymce/util/Promise"
], function (Promise) {
	var load = function (url) {
		return new Promise(function (resolve, reject) {
			var img = document.createElement('img');

			img.onload = function() {
				resolve(url);
			};

			img.onerror = function() {
				reject();
			};

			img.src = url;
		});
	};

	return {
		load: load
	};
});
