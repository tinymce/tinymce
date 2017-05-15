define(
  'ephox.alloy.ui.schema.TabButtonSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('value'),
      FieldSchema.strict('dom'),
      FieldSchema.option('action'),
      FieldSchema.option('role'),
      FieldSchema.defaulted('domModification', { }),

      // TODO: Move view out of the resultant object.
      FieldSchema.strict('view')
    ];

    return {
      name: Fun.constant('TabButton'),
      schema: Fun.constant(schema),
      parts: Fun.constant([ ])
    };
  }
);