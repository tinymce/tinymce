define(
  'ephox.alloy.ui.schema.InlineViewSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Fields, FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('lazySink'),
      Fields.onHandler('onShow')
    ];

    return {
      name: Fun.constant('InlineView'),
      schema: Fun.constant(schema),
      parts: Fun.constant([ ])
    }
  }
);