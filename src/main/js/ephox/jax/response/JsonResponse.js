define(
  'ephox.jax.response.JsonResponse',

  [
    'ephox.katamari.api.Result',
    'ephox.sand.api.JSON'
  ],

  function (Result, JSON) {
    var parse = function (text) {
      try {
        var parsed = JSON.parse(text);
        return Result.value(parsed);
      } catch (err) {
        return Result.error('Response was not JSON');
      }
    };
    return {
      parse: parse
    };
  }
);
