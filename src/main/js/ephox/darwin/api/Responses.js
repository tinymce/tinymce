define(
  'ephox.darwin.api.Responses',

  [
    'ephox.katamari.api.Struct'
  ],

  function (Struct) {
    var response = Struct.immutable('selection', 'kill');

    return {
      response: response
    };
  }
);