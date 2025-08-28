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

interface BlobStatus {
  readonly status: number;
  readonly resultUri: string | null;
}

export const UploadStatus = (): UploadStatus => {
  const PENDING = 1, UPLOADED = 2;
  let blobUriStatuses: Record<string, BlobStatus> = {};

  const createStatus = (status: number, resultUri: string | null): BlobStatus => {
    return {
      status,
      resultUri
    };
  };

  const hasBlobUri = (blobUri: string) => {
    return blobUri in blobUriStatuses;
  };

  const getResultUri = (blobUri: string) => {
    const result = blobUriStatuses[blobUri];

    return result ? result.resultUri : null;
  };

  const isPending = (blobUri: string) => {
    return hasBlobUri(blobUri) ? blobUriStatuses[blobUri].status === PENDING : false;
  };

  const isUploaded = (blobUri: string) => {
    return hasBlobUri(blobUri) ? blobUriStatuses[blobUri].status === UPLOADED : false;
  };

  const markPending = (blobUri: string) => {
    blobUriStatuses[blobUri] = createStatus(PENDING, null);
  };

  const markUploaded = (blobUri: string, resultUri: string) => {
    blobUriStatuses[blobUri] = createStatus(UPLOADED, resultUri);
  };

  const removeFailed = (blobUri: string) => {
    delete blobUriStatuses[blobUri];
  };

  const destroy = () => {
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
