import Promise from '@ephox/wrap-promise-polyfill';

import * as Errors from '../proxy/Errors';
import * as Utils from '../proxy/Utils';

const appendApiKey = (url: string, apiKey: string) => {
  const separator = url.indexOf('?') === -1 ? '?' : '&';
  if (/[?&]apiKey=/.test(url)) {
    return url;
  } else {
    return url + separator + 'apiKey=' + encodeURIComponent(apiKey);
  }
};

const isError = (status: number) => status < 200 || status >= 300;

const requestServiceBlob = (url: string, apiKey: string) => {
  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
    'tiny-api-key': apiKey
  };

  return Utils.sendRequest(appendApiKey(url, apiKey), headers).then((result) =>
    isError(result.status) ? Errors.handleServiceErrorResponse(result.status, result.blob) : Promise.resolve(result.blob)
  );
};

const requestBlob = (url: string, withCredentials: boolean) =>
  Utils.sendRequest(url, {}, withCredentials).then((result) =>
    isError(result.status) ? Errors.handleHttpError(result.status) : Promise.resolve(result.blob)
  );

const getUrl = (url: string, apiKey?: string, withCredentials: boolean = false): Promise<Blob> =>
  apiKey ? requestServiceBlob(url, apiKey) : requestBlob(url, withCredentials);

export {
  getUrl
};
