define(
  'ephox.jax.request.RequestOptions',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (Fun, Option) {
    var generate = function (cType, rType, creds, custom) {
      var contentType = cType.map(function (adt) {
        return adt.match({
          form: function () {
            return 'application/x-www-form-urlencoded; charset=UTF-8';
          },
          json: function () {
            return 'application/json';
          },
          plain: function () {
            return 'text/plain';
          },
          html: function () {
            return 'text/html';
          }
        });
      });

      var credentials = creds.match({
        none: Option.none,
        xhr: Fun.constant(Option.some(true))
      });

      var responseType = rType.match({
        // Not supported by IE, so we have to manually process it
        json: Option.none,
        blob: Fun.constant(Option.some('blob')),
        // Check if cross-browser
        xml: Fun.constant(Option.some('document')),
        html: Fun.constant(Option.some('document')),
        text: Fun.constant(Option.some('text'))
      });

      var exactAccept = rType.match({
        json: Fun.constant('application/json, text/javascript'),
        blob: Fun.constant('application/octet-stream'),
        text: Fun.constant('text/plain'),
        html: Fun.constant('text/html'),
        xml: Fun.constant('application/xml, text/xml')
      });

      // Always accept everything.
      var accept = exactAccept + ', */*; q=0.01';

      var headers = custom;

      return {
        contentType: Fun.constant(contentType),
        credentials: Fun.constant(credentials),
        responseType: Fun.constant(responseType),
        accept: Fun.constant(accept),
        headers: Fun.constant(headers)
      };
    };

    return {
      generate: generate
    };
  }
);