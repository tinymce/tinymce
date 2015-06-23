/**
 * Filters.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Applies various filters to blobs.
 */
define("tinymce/imagetoolsplugin/Filters", [
	"tinymce/imagetoolsplugin/Canvas",
	"tinymce/imagetoolsplugin/ImageSize",
	"tinymce/imagetoolsplugin/Conversions",
	"tinymce/imagetoolsplugin/ColorMatrix"
], function(Canvas, ImageSize, Conversions, ColorMatrix) {
	var revokeImageUrl = Conversions.revokeImageUrl;

	function colorFilter(blob, matrix) {
		return Conversions.blobToImage(blob).then(function(image) {
			var canvas = Canvas.create(ImageSize.getWidth(image), ImageSize.getHeight(image)),
				context = Canvas.get2dContext(canvas),
				pixels;

			function applyMatrix(pixels, m) {
				var d = pixels.data, r, g, b, a, i,
					m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], m4 = m[4],
					m5 = m[5], m6 = m[6], m7 = m[7], m8 = m[8], m9 = m[9],
					m10 = m[10], m11 = m[11], m12 = m[12], m13 = m[13], m14 = m[14],
					m15 = m[15], m16 = m[16], m17 = m[17], m18 = m[18], m19 = m[19];

				for (i = 0; i < d.length; i += 4) {
					r = d[i];
					g = d[i + 1];
					b = d[i + 2];
					a = d[i + 3];

					d[i] = r * m0 + g * m1 + b * m2 + a * m3 + m4;
					d[i + 1] = r * m5 + g * m6 + b * m7 + a * m8 + m9;
					d[i + 2] = r * m10 + g * m11 + b * m12 + a * m13 + m14;
					d[i + 3] = r * m15 + g * m16 + b * m17 + a * m18 + m19;
				}

				return pixels;
			}

			context.drawImage(image, 0, 0);
			revokeImageUrl(image);
			pixels = applyMatrix(context.getImageData(0, 0, canvas.width, canvas.height), matrix);
			context.putImageData(pixels, 0, 0);

			return Conversions.canvasToBlob(canvas);
		});
	}

	function convoluteFilter(blob, matrix) {
		return Conversions.blobToImage(blob).then(function(image) {
			var canvas = Canvas.create(ImageSize.getWidth(image), ImageSize.getHeight(image)),
				context = Canvas.get2dContext(canvas),
				pixelsIn, pixelsOut;

			function applyMatrix(pixelsIn, pixelsOut, matrix) {
				var rgba, drgba, side, halfSide, x, y, r, g, b,
					cx, cy, scx, scy, offset, wt, w, h;

				function clamp(value, min, max) {
					if (value > max) {
						value = max;
					} else if (value < min) {
						value = min;
					}

					return value;
				}

				// Calc side and half side of matrix
				side = Math.round(Math.sqrt(matrix.length));
				halfSide = Math.floor(side / 2);
				rgba = pixelsIn.data;
				drgba = pixelsOut.data;
				w = pixelsIn.width;
				h = pixelsIn.height;

				// Apply convolution matrix to pixels
				for (y = 0; y < h; y++) {
					for (x = 0; x < w; x++) {
						r = g = b = 0;

						for (cy = 0; cy < side; cy++) {
							for (cx = 0; cx < side; cx++) {
								// Calc relative x, y based on matrix
								scx = clamp(x + cx - halfSide, 0, w - 1);
								scy = clamp(y + cy - halfSide, 0, h - 1);

								// Calc r, g, b
								offset = (scy * w + scx) * 4;
								wt = matrix[cy * side + cx];
								r += rgba[offset] * wt;
								g += rgba[offset + 1] * wt;
								b += rgba[offset + 2] * wt;
							}
						}

						// Set new RGB to destination buffer
						offset = (y * w + x) * 4;
						drgba[offset] = clamp(r, 0, 255);
						drgba[offset + 1] = clamp(g, 0, 255);
						drgba[offset + 2] = clamp(b, 0, 255);
					}
				}

				return pixelsOut;
			}

			context.drawImage(image, 0, 0);
			revokeImageUrl(image);
			pixelsIn = context.getImageData(0, 0, canvas.width, canvas.height);
			pixelsOut = context.getImageData(0, 0, canvas.width, canvas.height);
			pixelsOut = applyMatrix(pixelsIn, pixelsOut, matrix);
			context.putImageData(pixelsOut, 0, 0);

			return Conversions.canvasToBlob(canvas);
		});
	}

	function functionColorFilter(colorFn) {
		return function(blob, value) {
			return Conversions.blobToImage(blob).then(function(image) {
				var canvas = Canvas.create(ImageSize.getWidth(image), ImageSize.getHeight(image)),
					context = Canvas.get2dContext(canvas),
					pixels, i, lookup = new Array(256);

				function applyLookup(pixels, lookup) {
					var d = pixels.data, i;

					for (i = 0; i < d.length; i += 4) {
						d[i] = lookup[d[i]];
						d[i + 1] = lookup[d[i + 1]];
						d[i + 2] = lookup[d[i + 2]];
					}

					return pixels;
				}

				for (i = 0; i < lookup.length; i++) {
					lookup[i] = colorFn(i, value);
				}

				context.drawImage(image, 0, 0);
				revokeImageUrl(image);
				pixels = applyLookup(context.getImageData(0, 0, canvas.width, canvas.height), lookup);
				context.putImageData(pixels, 0, 0);

				return Conversions.canvasToBlob(canvas);
			});
		};
	}

	function complexAdjustableColorFilter(matrixAdjustFn) {
		return function(blob, adjust) {
			return colorFilter(blob, matrixAdjustFn(ColorMatrix.identity(), adjust));
		};
	}

	function basicColorFilter(matrix) {
		return function(blob) {
			return colorFilter(blob, matrix);
		};
	}

	function basicConvolutionFilter(kernel) {
		return function(blob) {
			return convoluteFilter(blob, kernel);
		};
	}

	return {
		invert: basicColorFilter([
			-1, 0, 0, 0, 255,
			0, -1, 0, 0, 255,
			0, 0, -1, 0, 255,
			0, 0, 0, 1, 0
		]),

		brightness: complexAdjustableColorFilter(ColorMatrix.adjustBrightness),
		hue: complexAdjustableColorFilter(ColorMatrix.adjustHue),
		saturate: complexAdjustableColorFilter(ColorMatrix.adjustSaturation),
		contrast: complexAdjustableColorFilter(ColorMatrix.adjustContrast),
		grayscale: complexAdjustableColorFilter(ColorMatrix.adjustGrayscale),
		sepia: complexAdjustableColorFilter(ColorMatrix.adjustSepia),
		colorize: function(blob, adjustR, adjustG, adjustB) {
			return colorFilter(blob, ColorMatrix.adjustColors(ColorMatrix.identity(), adjustR, adjustG, adjustB));
		},

		sharpen: basicConvolutionFilter([
			0, -1, 0,
			-1, 5, -1,
			0, -1, 0
		]),

		emboss: basicConvolutionFilter([
			-2, -1, 0,
			-1, 1, 1,
			0, 1, 2
		]),

		gamma: functionColorFilter(function(color, value) {
			return Math.pow(color / 255, 1 - value) * 255;
		}),

		exposure: functionColorFilter(function(color, value) {
			return 255 * (1 - Math.exp(-(color / 255) * value));
		}),

		colorFilter: colorFilter,
		convoluteFilter: convoluteFilter
	};
});