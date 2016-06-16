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
 * Resizes image using canvas
 */
define("ephox/imagetools/transformations/ImageResizerCanvas", [
    "ephox/imagetools/util/Promise",
    "ephox/imagetools/util/Conversions",
    "ephox/imagetools/util/Canvas"
], function(Promise, Conversions, Canvas) {

    /**
     * @method scale
     * @static
     * @param sCanvas {Canvas}
     * @param w {Number} Width that the image should be scaled to
     * @param h {Number} Height that the image should be scaled to
     * @returns {Promise}
     */
    function scale(sCanvas, w, h) {
        var wRatio = w / sCanvas.width;
        var hRatio = h / sCanvas.height;
        var scaleCapped = false;

        if (wRatio < 0.5 || wRatio > 2) {
            wRatio = wRatio < 0.5 ? 0.5 : 2;
            scaleCapped = true;
        }
        if (hRatio < 0.5 || hRatio > 2) {
            hRatio = hRatio < 0.5 ? 0.5 : 2;
            scaleCapped = true;
        }

        var scaled = _scale(sCanvas, wRatio, hRatio);

        return !scaleCapped ? scaled : scaled.then(function (dCanvas) {
            return scale(dCanvas, w, h);
        });
    }


    function _scale(sCanvas, wRatio, hRatio) {
        return new Promise(function(resolve) {
            var w = Math.floor(sCanvas.width * wRatio);
            var h = Math.floor(sCanvas.height * hRatio);
            var dCanvas = Canvas.create(w, h);
            var context = Canvas.get2dContext(dCanvas);

            context.drawImage(sCanvas, 0, 0, sCanvas.width, sCanvas.height, 0, 0, w, h);

            resolve(dCanvas);
        });
    }

    return {
        scale: scale
    };

});
