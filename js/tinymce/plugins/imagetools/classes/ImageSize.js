/**
 * ImageSize.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Returns the size of images.
 */
define("tinymce/imagetoolsplugin/ImageSize", [], function() {
	function getWidth(image) {
		return image.naturalWidth || image.width;
	}

	function getHeight(image) {
		return image.naturalHeight || image.height;
	}

	return {
		getWidth: getWidth,
		getHeight: getHeight
	};
});