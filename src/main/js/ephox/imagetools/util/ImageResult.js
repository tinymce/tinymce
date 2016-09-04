/**
 * ImageResult.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("ephox/imagetools/util/ImageResult", [
    "ephox/imagetools/util/Promise",
    "ephox/imagetools/util/Conversions"
], function(Promise, Conversions) {

    function create(canvas) {

        function toPromisedBlob(type, quality) {
            return Conversions.canvasToBlob(canvas, type, quality);
        }

        function toBlob(type, quality) {
            return Conversions.dataUriToBlobSync(toDataURL(type, quality));
        }

        function toDataURL(type, quality) {
            return canvas.toDataURL(type, quality);
        }

        function toBase64(type, quality) {
            return toDataURL(type, quality).split(',')[1];
        }

        function toCanvas() {
            return canvas;
        }

        return {
            toBlob: toBlob,
            toPromisedBlob: toPromisedBlob,
            toDataURL: toDataURL,
            toBase64: toBase64,
            toCanvas: toCanvas
        };
    }


    function fromBlob(blob) {
        return Conversions.blobToImage(blob)
            .then(function(image) {
                var result = Conversions.imageToCanvas(image);
                Conversions.revokeImageUrl(image);
                return result;
            })
            .then(function(canvas) {
                return create(canvas);
            });
    }


    function fromCanvas(canvas) {
        return new Promise(function(resolve) {
            resolve(create(canvas));
        });
    }


    function fromImage(image) {
        return Conversions.imageToCanvas(image).then(fromCanvas);
    }


    return {
        fromBlob: fromBlob,
        fromCanvas: fromCanvas,
        fromImage: fromImage
    };
});
