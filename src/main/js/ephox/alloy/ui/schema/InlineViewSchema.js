define(
  'ephox.alloy.ui.schema.InlineViewSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('lazySink'),
      FieldSchema.defaulted('onShow', Fun.noop)
    ];

    return {
      name: Fun.constant('InlineView'),
      schema: Fun.constant(schema),
      parts: Fun.constant([ ])
    }
  }
);