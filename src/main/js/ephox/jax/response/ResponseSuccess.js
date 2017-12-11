define(
  'ephox.jax.response.ResponseSuccess',

  [
    'ephox.jax.response.JsonResponse',
    'ephox.jax.response.ResponseError',
    'ephox.katamari.api.FutureResult',
    'ephox.katamari.api.Result'
  ],

  function (JsonResponse, ResponseError, FutureResult, Result) {
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

    return {
      validate: validate
    };
  }
);