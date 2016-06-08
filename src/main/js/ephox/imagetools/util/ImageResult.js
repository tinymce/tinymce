/**
 * ImageResult.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("ephox/imagetools/util/ImageResult", [], function() {

    /**
     * Data structure that will hold image data simultaneously as blob and as dataUri
     *
     * @constructor
     * @param {Object} data
     *  @param {Blob} data.blob
     *  @param {String) data.dataUri
     */
    return function ImageResult(data) {

        this.getBlob = function() {
            return data.blob;
        };

        this.getDataUri = function() {
            return data.dataUri;
        };

        this.getBase64 = function() {
            return data.dataUri.split(',')[1];
        };
    };
});
