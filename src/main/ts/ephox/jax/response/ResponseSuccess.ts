import JsonResponse from './JsonResponse';
import ResponseError from './ResponseError';
import { FutureResult } from '@ephox/katamari';
import { Result } from '@ephox/katamari';

var validate = function (responseType, request) {
  var normal = function () {
    return FutureResult.pure(request.response);
  };

  var notNull = function (label, f) {
    return function () {
      return f().bindResult(function (val) {
        // Invalid XML documents seem to come back as null
        return val === null ? Result.error(label) : Result.value(val);
      });
    };
  };

  return responseType.match({
    json: function () {
      return JsonResponse.parse(request.response).fold(function (message) {
        return FutureResult.error(ResponseError.nu({
          message: message,
          status: request.status,
          responseText: request.responseText
        }));
      }, FutureResult.pure);
    },
    blob: normal,
    text: normal,
    html: normal,
    xml: notNull('Invalid XML document', normal)
  });
};

export default <any> {
  validate: validate
};