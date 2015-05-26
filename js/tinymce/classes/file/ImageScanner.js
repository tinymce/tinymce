/**
 * ImageScanner.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
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
	"tinymce/util/Promise"
], function(Promise) {
	return {
		findAll: function(elm, blobCache) {
			return new Promise(function(resolve) {
				resolve();
			});
		}
	};
});