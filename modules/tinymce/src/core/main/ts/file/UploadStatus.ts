/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

/**
 * Holds the current status of a blob uri, if it's pending or uploaded and what the result urls was.
 *
 * @private
 * @class tinymce.file.UploadStatus
 */

export interface UploadStatus {
  readonly hasBlobUri: (blobUri: string) => boolean;
  readonly getResultUri: (blobUri: string) => string | null;
  readonly isPending: (blobUri: string) => boolean;
  readonly isUploaded: (blobUri: string) => boolean;
  readonly markPending: (blobUri: string) => void;
  readonly markUploaded: (blobUri: string, resultUri: string) => void;
  readonly removeFailed: (blobUri: string) => void;
  readonly destroy: () => void;
}

export const UploadStatus = (): UploadStatus => {
  const PENDING = 1, UPLOADED = 2;
  let blobUriStatuses = {};

  const createStatus = function (status: number, resultUri: string) {
    return {
      status,
      resultUri
    };
  };

  const hasBlobUri = function (blobUri: string) {
    return blobUri in blobUriStatuses;
  };

  const getResultUri = function (blobUri: string) {
    const result = blobUriStatuses[blobUri];

    return result ? result.resultUri : null;
  };

  const isPending = function (blobUri: string) {
    return hasBlobUri(blobUri) ? blobUriStatuses[blobUri].status === PENDING : false;
  };

  const isUploaded = function (blobUri: string) {
    return hasBlobUri(blobUri) ? blobUriStatuses[blobUri].status === UPLOADED : false;
  };

  const markPending = function (blobUri: string) {
    blobUriStatuses[blobUri] = createStatus(PENDING, null);
  };

  const markUploaded = function (blobUri: string, resultUri: string) {
    blobUriStatuses[blobUri] = createStatus(UPLOADED, resultUri);
  };

  const removeFailed = function (blobUri: string) {
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
};
