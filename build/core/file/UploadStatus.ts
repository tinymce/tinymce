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

export default function () {
  const PENDING = 1, UPLOADED = 2;
  let blobUriStatuses = {};

  const createStatus = function (status, resultUri) {
    return {
      status,
      resultUri
    };
  };

  const hasBlobUri = function (blobUri) {
    return blobUri in blobUriStatuses;
  };

  const getResultUri = function (blobUri) {
    const result = blobUriStatuses[blobUri];

    return result ? result.resultUri : null;
  };

  const isPending = function (blobUri) {
    return hasBlobUri(blobUri) ? blobUriStatuses[blobUri].status === PENDING : false;
  };

  const isUploaded = function (blobUri) {
    return hasBlobUri(blobUri) ? blobUriStatuses[blobUri].status === UPLOADED : false;
  };

  const markPending = function (blobUri) {
    blobUriStatuses[blobUri] = createStatus(PENDING, null);
  };

  const markUploaded = function (blobUri, resultUri) {
    blobUriStatuses[blobUri] = createStatus(UPLOADED, resultUri);
  };

  const removeFailed = function (blobUri) {
    delete blobUriStatuses[blobUri];
  };

  const destroy = function () {
    blobUriStatuses = {};
  };

  return {
    hasBlobUri,
    getResultUri,
    isPending,
    isUploaded,
    markPending,
    markUploaded,
    removeFailed,
    destroy
  };
}