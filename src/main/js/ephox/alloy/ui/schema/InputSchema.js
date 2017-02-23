define(
  'ephox.alloy.ui.schema.InputSchema',

  [
    'ephox.alloy.ui.common.InputBase',
    'ephox.katamari.api.Fun'
  ],

  function (InputBase, Fun) {
    var schema = InputBase.schema();

    return {
      name: Fun.constant('Input'),
      schema: Fun.constant(schema),
      parts: Fun.constant([ ])
    }
  }
);