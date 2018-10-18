import { JsonResponse } from './JsonResponse';
import { ResponseError } from './ResponseError';
import { FutureResult } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { ResponseType } from '../api/ResponseType';
import { XMLHttpRequest } from '@ephox/dom-globals';

const validate = function (responseType: ResponseType, request: XMLHttpRequest) {
  const normal = function () {
    return FutureResult.pure(request.response);
  };

  const error = function (message: string) {
    return ResponseError.nu({
      message: message,
      status: request.status,
      responseText: request.responseText
    });
  };

  const notNull = function (label: string, f: () => FutureResult<any, ResponseError>) {
    return function () {
      return f().bindResult(function (val) {
        // Invalid XML documents seem to come back as null
        return val === null ? Result.error(error(label)) : Result.value(val);
      });
    };
  };

  return responseType.match<FutureResult<any, ResponseError>>({
    json: function () {
      return JsonResponse.parse(request.response).fold(function (message) {
        return FutureResult.error(error(message));
      }, FutureResult.pure);
    },
    blob: normal,
    text: normal,
    html: normal,
    xml: notNull('Invalid XML document', normal)
  });
};

export const ResponseSuccess = {
  validate
};