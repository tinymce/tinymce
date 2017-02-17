define(
  'ephox.alloy.ui.schema.ButtonSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.option('action'),
      FieldSchema.option('role')
    ];

    return {
      name: Fun.constant('Button'),
      schema: Fun.constant(schema),
      parts: Fun.constant([ ])
    };
  }
);