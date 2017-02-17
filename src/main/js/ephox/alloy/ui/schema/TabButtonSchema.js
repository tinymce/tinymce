define(
  'ephox.alloy.ui.schema.TabButtonSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('value'),
      FieldSchema.strict('dom'),
      FieldSchema.option('action'),
      FieldSchema.option('role')
    ];

    return {
      name: Fun.constant('TabButton'),
      schema: Fun.constant(schema),
      parts: Fun.constant([ ])
    }
  }
);