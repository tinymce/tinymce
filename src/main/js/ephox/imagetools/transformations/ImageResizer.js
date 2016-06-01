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

    var _canvas;
    var _sW,_sH, _dW, _dH;
    var _ratio;
    var _gradient = true;

    var Resizer = ImageResizerCanvas;


    function scale(image, ratio, srcRect, gradient) {
        _sW = ImageSize.getWidth(image);
        _sH = ImageSize.getHeight(image);
        _dW = _sW * ratio;
        _dH = _sH * ratio;

        _ratio = ratio;
        _gradient = gradient === undefined ? true : parseInt(gradient);

        srcRect = srcRect ? srcRect : {
            x: 0,
            y: 0,
            width: _sW,
            height: _sH
        };

        _canvas = Canvas.create(srcRect.width, srcRect.height);

        Canvas.get2dContext(_canvas).drawImage(image,
            srcRect.x,
            srcRect.y,
            srcRect.width,
            srcRect.height
        );

        Conversions.revokeImageUrl(image);

        return _scale(ratio);
    }


    function _scale(tmpRatio) {
        if (_gradient && (tmpRatio < 0.5 || tmpRatio > 2)) {
            tmpRatio = tmpRatio < 0.5 ? 0.5 : 2;
        }

        return Resizer.scale(_canvas, tmpRatio).then(function(tCanvas) {
            var tW = ImageSize.getWidth(tCanvas);
            if (_ratio < 1 && tW <= _dW || _ratio > 1 && tW >= _dW) {
                _canvas = null;
                return tCanvas;
            } else {
                _canvas = tCanvas;
                tCanvas = null; // just in case
                return _scale(_dW / tW);
            }
        });
    }

    return {
        scale: scale
    };
});
