import { Future, Optional } from '@ephox/katamari';

import { readBlobAsText } from './BlobReader';
import { DataType } from './DataType';
import { ResponseBodyDataTypes, ResponseType } from './HttpData';
import { HttpError } from './HttpError';
import * as JsonResponse from './JsonResponse';

// can't get responseText of a blob, throws a DomException. Need to use FileReader.
// request.response can be null if the server provided no content in the error response.
const getBlobError = (request: XMLHttpRequest) => Optional.from(request.response).map(readBlobAsText).getOr(Future.pure('no response content'));

const fallback = (request: XMLHttpRequest) => Future.pure(request.response);

const getResponseText = (responseType: ResponseBodyDataTypes, request: XMLHttpRequest) => {
  // for errors, the responseText is json if it can be, fallback if it can't
  switch (responseType) {
    case DataType.JSON: return JsonResponse.create(request.response).fold(() => fallback(request), Future.pure);
    case DataType.Blob: return getBlobError(request);
    case DataType.Text: return fallback(request);
    default: return fallback(request);
  }
};

export const handle = <T extends ResponseType>(url: string, responseType: ResponseBodyDataTypes, request: XMLHttpRequest): Future<HttpError<T>> => getResponseText(responseType, request).map((responseText) => {
  const message = request.status === 0 ? 'Unknown HTTP error (possible cross-domain request)' : `Could not load url ${url}: ${request.statusText}`;
  return {
    message,
    status: request.status,
    responseText
  };
});
