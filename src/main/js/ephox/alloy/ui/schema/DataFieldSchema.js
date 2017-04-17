define(
  'ephox.alloy.ui.schema.DataFieldSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('uid'),
      FieldSchema.strict('dom'),
      FieldSchema.strict('getInitialValue')
    ];

    return {
      name: Fun.constant('DataField'),
      schema: Fun.constant(schema)
    };
  }
);
