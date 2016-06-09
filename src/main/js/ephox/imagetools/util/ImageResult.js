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
     * Creates data structure that will hold image data simultaneously as blob and as dataUri
     *
     * @method create
     * @static
     * @param {Blob} blob
     * @param {String) dataUri
     */
    function create(blob, uri) {
        return {
            blob: function() {
                return blob;
            },

            dataUri: function() {
                return uri;
            },

            base64: function() {
                return uri.split(',')[1];
            }
        }
    }

    return {
        create: create
    };
});
