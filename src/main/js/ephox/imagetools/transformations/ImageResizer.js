/**
 * ImageResizer.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Does a gradual resizing of the image, using canvas element via either 3D (Webgl) or 2D
 * (as a fallback) context
 */
define("ephox/imagetools/transformations/ImageResizer", [
    "ephox/imagetools/util/Conversions",
    "ephox/imagetools/util/Canvas",
    "ephox/imagetools/util/ImageSize",
    "ephox/imagetools/transformations/ImageResizerCanvas"
], function(Conversions, Canvas, ImageSize, ImageResizerCanvas) {

    var Resizer = ImageResizerCanvas;

    function scale(image, srcRect, dW, dH, gradient) {
        var srcImage;

        if (!srcRect) {
            srcImage = image;
        } else {
            var canvas = Canvas.create(srcRect.width, srcRect.height);

            Canvas.get2dContext(canvas).drawImage(image,
                srcRect.x,
                srcRect.y,
                srcRect.width,
                srcRect.height
            );

            Conversions.revokeImageUrl(image);
            srcImage = canvas;
        }

        gradient = gradient === undefined ? true : parseInt(gradient);

        return _scale(srcImage, dW, dH, gradient);
    }


    function _scale(image, dW, dH, gradient) {
        var sW = ImageSize.getWidth(image);
        var sH = ImageSize.getHeight(image);
        var wRatio = dW / sW;
        var hRatio = dH / sH;

        if (gradient) {
            if (wRatio < 0.5 || wRatio > 2) {
                wRatio = wRatio < 0.5 ? 0.5 : 2;
            }
            if (hRatio < 0.5 || hRatio > 2) {
                hRatio = hRatio < 0.5 ? 0.5 : 2;
            }
        }

        return Resizer.scale(image, wRatio, hRatio).then(function(tCanvas) {
            var tW = ImageSize.getWidth(tCanvas);
            var tH = ImageSize.getWidth(tCanvas);
            if (tW == dW && tH == dH) {
                return tCanvas;
            } else {
                return _scale(tCanvas, dW, dH, gradient);
            }
        });
    }

    return {
        scale: scale
    };
});
