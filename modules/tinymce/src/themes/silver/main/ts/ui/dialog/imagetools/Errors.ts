/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun } from '@ephox/katamari';

import Promise from 'tinymce/core/api/util/Promise';

import * as Utils from './Utils';

const friendlyHttpErrors = [
  { code: 404, message: 'Could not find Image Proxy' },
  { code: 403, message: 'Rejected request' },
  { code: 0, message: 'Incorrect Image Proxy URL' }
];
const friendlyServiceErrors = [
  { type: 'key_missing', message: 'The request did not include an api key.' },
  { type: 'key_not_found', message: 'The provided api key could not be found.' },
  { type: 'domain_not_trusted', message: 'The api key is not valid for the request origins.' }
];

const isServiceErrorCode = (code) => {
  return code === 400 || code === 403 || code === 500;
};

const getHttpErrorMsg = (status) => {
  const message = Arr.find(friendlyHttpErrors, (error) => {
    return status === error.code;
  }).fold(
    Fun.constant('Unknown ImageProxy error'),
    (error) => {
      return error.message;
    }
  );

  return 'ImageProxy HTTP error: ' + message;
};

const handleHttpError = (status) => {
  const message = getHttpErrorMsg(status);

  return Promise.reject(message);
};

const getServiceErrorMsg = (type) => {
  return Arr.find(friendlyServiceErrors, (error) => {
    return error.type === type;
  }).fold(
    Fun.constant('Unknown service error'),
    (error) => {
      return error.message;
    }
  );
};

const getServiceError = (text) => {
  const serviceError = Utils.parseJson(text);
  const errorType = Utils.traverse(serviceError, [ 'error', 'type' ]);
  const errorMsg = errorType ? getServiceErrorMsg(errorType) : 'Invalid JSON in service error message';

  return 'ImageProxy Service error: ' + errorMsg;
};

const handleServiceError = (status, blob) => {
  return Utils.readBlob(blob).then((text) => {
    const serviceError = getServiceError(text);

    return Promise.reject(serviceError);
  });
};

const handleServiceErrorResponse = (status, blob) => {
  return isServiceErrorCode(status) ? handleServiceError(status, blob) : handleHttpError(status);
};

export {
  handleServiceErrorResponse,
  handleHttpError,
  getHttpErrorMsg,
  getServiceErrorMsg
};
