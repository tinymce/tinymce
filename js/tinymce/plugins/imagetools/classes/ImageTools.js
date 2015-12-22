/**
 * ImageTools.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Modifies image blobs.
 */
define("tinymce/imagetoolsplugin/ImageTools", [
	"tinymce/imagetoolsplugin/Conversions",
	"tinymce/imagetoolsplugin/Canvas",
	"tinymce/imagetoolsplugin/ImageSize"
], function(Conversions, Canvas, ImageSize) {
	var revokeImageUrl = Conversions.revokeImageUrl;

	function rotate(blob, angle) {
		return Conversions.blobToImage(blob).then(function(image) {
			var canvas = Canvas.create(ImageSize.getWidth(image), ImageSize.getHeight(image)),
				context = Canvas.get2dContext(canvas),
				translateX = 0, translateY = 0;

			angle = angle < 0 ? 360 + angle : angle;

			if (angle == 90 || angle == 270) {
				Canvas.resize(canvas, canvas.height, canvas.width);
			}

			if (angle == 90 || angle == 180) {
				translateX = canvas.width;
			}

			if (angle == 270 || angle == 180) {
				translateY = canvas.height;
			}

			context.translate(translateX, translateY);
			context.rotate(angle * Math.PI / 180);
			context.drawImage(image, 0, 0);
			revokeImageUrl(image);

			return Conversions.canvasToBlob(canvas, blob.type);
		});
	}

	function flip(blob, axis) {
		return Conversions.blobToImage(blob).then(function(image) {
			var canvas = Canvas.create(ImageSize.getWidth(image), ImageSize.getHeight(image)),
				context = Canvas.get2dContext(canvas);

			if (axis == 'v') {
				context.scale(1, -1);
				context.drawImage(image, 0, -canvas.height);
			} else {
				context.scale(-1, 1);
				context.drawImage(image, -canvas.width, 0);
			}

			revokeImageUrl(image);

			return Conversions.canvasToBlob(canvas);
		});
	}

	function crop(blob, x, y, w, h) {
		return Conversions.blobToImage(blob).then(function(image) {
			var canvas = Canvas.create(w, h),
				context = Canvas.get2dContext(canvas);

			context.drawImage(image, -x, -y);
			revokeImageUrl(image);

			return Conversions.canvasToBlob(canvas);
		});
	}

	function resize(blob, w, h) {
		return Conversions.blobToImage(blob).then(function(image) {
			var canvas = Canvas.create(w, h),
				context = Canvas.get2dContext(canvas);

			context.drawImage(image, 0, 0, w, h);
			revokeImageUrl(image);

			return Conversions.canvasToBlob(canvas, blob.type);
		});
	}

	return {
		rotate: rotate,
		flip: flip,
		crop: crop,
		resize: resize
	};
});
