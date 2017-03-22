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

      function createStatus(status, resultUri) {
        return {
          status: status,
          resultUri: resultUri
        };
      }

      function hasBlobUri(blobUri) {
        return blobUri in blobUriStatuses;
      }

      function getResultUri(blobUri) {
        var result = blobUriStatuses[blobUri];

        return result ? result.resultUri : null;
      }

      function isPending(blobUri) {
        return hasBlobUri(blobUri) ? blobUriStatuses[blobUri].status === PENDING : false;
      }

      function isUploaded(blobUri) {
        return hasBlobUri(blobUri) ? blobUriStatuses[blobUri].status === UPLOADED : false;
      }

      function markPending(blobUri) {
        blobUriStatuses[blobUri] = createStatus(PENDING, null);
      }

      function markUploaded(blobUri, resultUri) {
        blobUriStatuses[blobUri] = createStatus(UPLOADED, resultUri);
      }

      function removeFailed(blobUri) {
        delete blobUriStatuses[blobUri];
      }

      function destroy() {
        blobUriStatuses = {};
      }

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