define(
  'ephox.jax.response.ResponseError',

  [
    'ephox.jax.response.BlobError',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.FutureResult',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Struct'
  ],

  function (BlobError, Future, FutureResult, Option, Struct) {
    var getBlobError = function (request) {
      // can't get responseText of a blob, throws a DomException. Need to use FileReader.
      // request.response can be null if the server provided no content in the error response.
      return Option.from(request.response).map(BlobError).getOr(Future.pure('no response content'));
    };

    // Returns a future, not a future result
    var handle = function (responseType, request) {
      var fallback = function () {
        return Future.pure(request.response);
      };

      var asyncResText = responseType.match({
        json: fallback,
        blob: function () {
          return getBlobError(request);
        },
        text: fallback,
        html: fallback,
        xml: fallback
      });

      return asyncResText.map(function (responseText) {
        var message = request.status === 0 ? 'Unknown HTTP error (possible cross-domain request)' :  'Could not load url "' + request.url + '": ' + request.statusText;
        return nu({
          message: message,
          status: request.status,
          responseText: responseText
        });
      });
    };

    var nu = Struct.immutableBag([ 'message', 'status', 'responseText' ], [ ]);

    return {
      handle: handle,
      nu: nu
    };

  }
);