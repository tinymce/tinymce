/**
 * UploadStatus.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Holds the current status of a blob uri, if it's pending or uploaded and what the result urls was.
 *
 * @private
 * @class tinymce.file.UploadStatus
 */
define(
  'tinymce.core.file.UploadStatus',
  [
  ],
  function () {
    return function () {
      var PENDING = 1, UPLOADED = 2;
      var blobUriStatuses = {};

      var createStatus = function (status, resultUri) {
        return {
          status: status,
          resultUri: resultUri
        };
      };

      var hasBlobUri = function (blobUri) {
        return blobUri in blobUriStatuses;
      };

      var getResultUri = function (blobUri) {
        var result = blobUriStatuses[blobUri];

        return result ? result.resultUri : null;
      };

      var isPending = function (blobUri) {
        return hasBlobUri(blobUri) ? blobUriStatuses[blobUri].status === PENDING : false;
      };

      var isUploaded = function (blobUri) {
        return hasBlobUri(blobUri) ? blobUriStatuses[blobUri].status === UPLOADED : false;
      };

      var markPending = function (blobUri) {
        blobUriStatuses[blobUri] = createStatus(PENDING, null);
      };

      var markUploaded = function (blobUri, resultUri) {
        blobUriStatuses[blobUri] = createStatus(UPLOADED, resultUri);
      };

      var removeFailed = function (blobUri) {
        delete blobUriStatuses[blobUri];
      };

      var destroy = function () {
        blobUriStatuses = {};
      };

      return {
        hasBlobUri: hasBlobUri,
        getResultUri: getResultUri,
        isPending: isPending,
        isUploaded: isUploaded,
        markPending: markPending,
        markUploaded: markUploaded,
        removeFailed: removeFailed,
        destroy: destroy
      };
    };
  }
);