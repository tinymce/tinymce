define(
  'ephox.darwin.api.Responses',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    var response = Struct.immutable('selection', 'kill');

    return {
      response: response
    };
  }
);