import { BlobError } from './BlobError';
import { JsonResponse } from './JsonResponse';
import { Future } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';
import { ResponseType } from '../api/ResponseType';
import { XMLHttpRequest } from '@ephox/dom-globals';

export interface ResponseErrorBag {
  message: string;
  status: number;
  responseText: any;
}

export interface ResponseError {
  message: () => string;
  status: () => number;
  responseText: () => any;
}

const getBlobError = function (request: XMLHttpRequest) {
  // can't get responseText of a blob, throws a DomException. Need to use FileReader.
  // request.response can be null if the server provided no content in the error response.
  return Option.from(request.response).map(BlobError.parse).getOr(Future.pure('no response content'));
};

const handle = function (url: string, responseType: ResponseType, request: XMLHttpRequest) {
  const fallback = function () {
    return Future.pure(request.response);
  };

  const asyncResText = responseType.match({
    json: function () {
      // for errors, the responseText is json if it can be, fallback if it can't
      return JsonResponse.parse(request.response).fold(fallback, Future.pure);
    },
    blob: function () {
      return getBlobError(request);
    },
    text: fallback,
    html: fallback,
    xml: fallback
  });

  return asyncResText.map(function (responseText) {
    const message = request.status === 0 ? 'Unknown HTTP error (possible cross-domain request)' :  'Could not load url "' + url + '": ' + request.statusText;
    return nu({
      message: message,
      status: request.status,
      responseText: responseText
    });
  });
};

const nuErr = Struct.immutableBag<ResponseError>([ 'message', 'status', 'responseText' ], [ ]);

const nu = (bag: ResponseErrorBag): ResponseError => {
  const err = nuErr(bag);
  err.toString = err.message;
  return err;
};

export const ResponseError = {
  handle,
  nu
};