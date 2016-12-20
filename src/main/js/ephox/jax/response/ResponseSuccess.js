define(
  'ephox.jax.response.ResponseSuccess',

  [
    'ephox.jax.response.ResponseError',
    'ephox.katamari.api.FutureResult',
    'ephox.katamari.api.Result',
    'ephox.sand.api.JSON'
  ],

  function (ResponseError, FutureResult, Result, Json) {
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
          try {
            var parsed = Json.parse(request.response);
            return FutureResult.pure(parsed);
          } catch (err) {
            return FutureResult.error(
              ResponseError.nu({
                message: 'Response was not JSON',
                status: request.status,
                responseText: request.responseText
              })
            );
          }
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