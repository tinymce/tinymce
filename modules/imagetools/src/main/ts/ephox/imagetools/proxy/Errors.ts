import { Arr, Fun, Optional, Type } from '@ephox/katamari';
import Promise from '@ephox/wrap-promise-polyfill';

import * as Utils from './Utils';

const friendlyHttpErrors = [
  { code: 404, message: 'Could not find Image Proxy' },
  { code: 403, message: 'Rejected request' },
  { code: 0, message: 'Incorrect Image Proxy URL' }
];

const friendlyServiceErrors = [
  { type: 'not_found', message: 'Failed to load image.' },
  { type: 'key_missing', message: 'The request did not include an api key.' },
  { type: 'key_not_found', message: 'The provided api key could not be found.' },
  { type: 'domain_not_trusted', message: 'The api key is not valid for the request origins.' }
];

const traverseJson = (json: any, path: string[]): Optional<any> => {
  const value = Arr.foldl(path, (result, key) => Type.isNonNullable(result) ? result[key] : undefined, json);
  return Optional.from(value);
};

const isServiceErrorCode = (code: number, blob: Blob | null): blob is Blob =>
  blob?.type === 'application/json' && (code === 400 || code === 403 || code === 404 || code === 500);

const getHttpErrorMsg = (status: number): string => {
  const message = Arr.find(friendlyHttpErrors, (error) => status === error.code).fold(
    Fun.constant('Unknown ImageProxy error'),
    (error) => error.message
  );

  return 'ImageProxy HTTP error: ' + message;
};

const handleHttpError = (status: number): Promise<never> => {
  const message = getHttpErrorMsg(status);

  return Promise.reject(message);
};

const getServiceErrorMsg = (type: string): string =>
  Arr.find(friendlyServiceErrors, (error) => error.type === type).fold(
    Fun.constant('Unknown service error'),
    (error) => error.message
  );

const getServiceError = (text: string) => {
  const serviceError = Utils.parseJson(text);
  const errorMsg = serviceError.bind((err): Optional<string> =>
    traverseJson(err, [ 'error', 'type' ]).map(getServiceErrorMsg)
  ).getOr('Invalid JSON in service error message');

  return 'ImageProxy Service error: ' + errorMsg;
};

const handleServiceError = (blob: Blob) =>
  Utils.readBlobText(blob).then((text) => {
    const serviceError = getServiceError(text);
    return Promise.reject(serviceError);
  });

const handleServiceErrorResponse = (status: number, blob: Blob | null): Promise<never> =>
  isServiceErrorCode(status, blob) ? handleServiceError(blob) : handleHttpError(status);

export {
  handleServiceErrorResponse,
  handleHttpError,
  getHttpErrorMsg,
  getServiceErrorMsg
};
