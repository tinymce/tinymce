define(
  'ephox.jax.request.RequestUpdate',

  [
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Type',
    'global!console'
  ],

  function (Obj, Type, console) {
    var mutate = function (request, options) {
      var contentType = options.contentType();
      request.setRequestHeader('Content-Type', contentType);
      
      var accept = options.accept();
      request.setRequestHeader('Accept', accept);

      options.credentials().each(function (creds) {
        // NOTE: IE10 minimum
        request.withCredentials = creds;
      });

      options.responseType().each(function (responseType) {
        request.responseType = responseType;
      });

      var extra = options.headers();
      Obj.each(extra, function (v, k) {
        if (!Type.isString(k) && !Type.isString(v)) console.error('Request header data was not a string: ', k ,' -> ', v);
        else request.setRequestHeader(k, v);
      });
    };

    return {
      mutate: mutate
    };
  }
);