import { Arr, Fun } from '@ephox/katamari';
import Promise from 'tinymce/core/api/util/Promise';
import Utils from './Utils';

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

const isServiceErrorCode = function (code) {
  return code === 400 || code === 403 || code === 500;
};

const getHttpErrorMsg = function (status) {
  const message = Arr.find(friendlyHttpErrors, function (error) {
    return status === error.code;
  }).fold(
    Fun.constant('Unknown ImageProxy error'),
    function (error) {
      return error.message;
    }
  );

  return 'ImageProxy HTTP error: ' + message;
};

const handleHttpError = function (status) {
  const message = getHttpErrorMsg(status);

  return Promise.reject(message);
};

const getServiceErrorMsg = function (type) {
  return Arr.find(friendlyServiceErrors, function (error) {
    return error.type === type;
  }).fold(
    Fun.constant('Unknown service error'),
    function (error) {
      return error.message;
    }
  );
};

const getServiceError = function (text) {
  const serviceError = Utils.parseJson(text);
  const errorType = Utils.traverse(serviceError, ['error', 'type']);
  const errorMsg = errorType ? getServiceErrorMsg(errorType) : 'Invalid JSON in service error message';

  return 'ImageProxy Service error: ' + errorMsg;
};

const handleServiceError = function (status, blob) {
  return Utils.readBlob(blob).then(function (text) {
    const serviceError = getServiceError(text);

    return Promise.reject(serviceError);
  });
};

const handleServiceErrorResponse = function (status, blob) {
  return isServiceErrorCode(status) ? handleServiceError(status, blob) : handleHttpError(status);
};

export default {
  handleServiceErrorResponse,
  handleHttpError,
  getHttpErrorMsg,
  getServiceErrorMsg
};