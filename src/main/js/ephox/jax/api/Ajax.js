define(
  'ephox.jax.api.Ajax',

  [
    'ephox.jax.api.ContentType',
    'ephox.jax.api.Methods',
    'ephox.jax.request.RequestOptions',
    'ephox.jax.request.RequestUpdate',
    'ephox.jax.response.ResponseError',
    'ephox.jax.response.ResponseSuccess',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.FutureResult',
    'ephox.katamari.api.Result',
    'ephox.katamari.api.Strings',
    'ephox.sand.api.JSON',
    'ephox.sand.api.XMLHttpRequest'
  ],

  function (ContentType, Methods, RequestOptions, RequestUpdate, ResponseError, ResponseSuccess, Fun, FutureResult, Result, Strings, Json, XMLHttpRequest) {
    // _custom gets defaulted to an empty object.
    var send = function (url, method, contentType, responseType, credentials, _custom) {
      var custom = _custom !== undefined ? _custom : { };

      return FutureResult.nu(function (callback) {
        var type = method.match({
          get: Fun.constant('get'),
          put: Fun.constant('put'),
          post: Fun.constant('post'),
          del: Fun.constant('delete')
        });

        var request = XMLHttpRequest();
        request.open(type, url, true); // enforced async! enforced type as String!
        
        var options = RequestOptions.generate(contentType, responseType, credentials, custom);
        RequestUpdate.mutate(request, options);

        var onError = function () {
          ResponseError.handle(responseType, request).get(function (err) {
            callback(Result.error(err));
          });
        };

        var onLoad = function () {
          // Local files and Cors errors return status 0.
          // The only way we can decifer a local request is request url starts with 'file:' and allow local files to succeed.
          if (request.status === 0 && ! Strings.startsWith(url, 'file:')) onError();
          else if ( request.status < 100 || request.status >= 400) onError();
          else ResponseSuccess.validate(responseType, request).get(callback);
        };

        request.onload = onLoad;
        request.onerror = onError;

        // We could use method here again, but then we'd have to nest a pattern match.
        var data = type === 'get' ? undefined : contentType.match({
          none: Fun.constant(undefined),
          form: Fun.identity,
          json: Json.stringify,
          plain: Fun.identity,
          html: Fun.identity
        });

        request.send(data);
      }).toLazy();
    };

    var get = function (url, responseType, credentials, _custom) {
      var method = Methods.get();
      return send(url, method, ContentType.none(), responseType, credentials, _custom);
    };

    var post = function (url, contentType, responseType, credentials, _custom) {
      var method = Methods.post();
      return send(url, method, contentType, responseType, credentials, _custom);
    };

    var put = function (url, contentType, responseType, credentials, _custom) {
      var method = Methods.put();
      return send(url, method, contentType, responseType, credentials, _custom);
    };

    var del = function (url, responseType, credentials, _custom) {
      var method = Methods.del();
      return send(url, method, ContentType.none(), responseType, credentials, _custom);
    };

    return {
      get: get,
      post: post,
      put: put,
      del: del
    };
  }
);