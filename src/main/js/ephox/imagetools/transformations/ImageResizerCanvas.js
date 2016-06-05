/**
 * ImageResizerCanvas.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Resizes image/canvas using canvas
 */
define("ephox/imagetools/transformations/ImageResizerCanvas", [
    "ephox/imagetools/util/Promise",
    "ephox/imagetools/util/Conversions",
    "ephox/imagetools/util/Canvas",
    "ephox/imagetools/util/ImageSize"
], function(Promise, Conversions, Canvas, ImageSize) {

    /**
     * @method scale
     * @static
     * @param image {Image|Canvas}
     * @param dW {Number} Width that the image should be scaled to
     * @param dH {Number} Height that the image should be scaled to
     * @returns {Promise}
     */
    function scale(image, dW, dH) {
        var sW = ImageSize.getWidth(image);
        var sH = ImageSize.getHeight(image);
        var wRatio = dW / sW;
        var hRatio = dH / sH;

        if (wRatio < 0.5 || wRatio > 2) {
            wRatio = wRatio < 0.5 ? 0.5 : 2;
        }
        if (hRatio < 0.5 || hRatio > 2) {
            hRatio = hRatio < 0.5 ? 0.5 : 2;
        }

        return _scale(image, wRatio, hRatio).then(function(tCanvas) {
            var tW = ImageSize.getWidth(tCanvas);
            var tH = ImageSize.getHeight(tCanvas);
            if (tW == dW && tH == dH) {
                return tCanvas;
            } else {
                return scale(tCanvas, dW, dH);
            }
        });
    }


    function _scale(image, wRatio, hRatio) {
        return new Promise(function(resolve) {
            var sW = ImageSize.getWidth(image);
            var sH = ImageSize.getHeight(image);
            var dW = Math.floor(sW * wRatio);
            var dH = Math.floor(sH * hRatio);
            var canvas = Canvas.create(dW, dH);
            var context = Canvas.get2dContext(canvas);

            context.drawImage(image, 0, 0, sW, sH, 0, 0, dW, dH);

            if (image.src) {
                Conversions.revokeImageUrl(image);
            }
            image = null; // just in case

            resolve(canvas);
        });
    }

    return {
        scale: scale
    };

});
