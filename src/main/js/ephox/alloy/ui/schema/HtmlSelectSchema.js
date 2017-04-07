define(
  'ephox.alloy.ui.schema.HtmlSelectSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('options'),
      FieldSchema.defaulted('selectBehaviours', { }),
      FieldSchema.option('data'),
      FieldSchema.defaulted('hasTabstop', true)
    ];

    return {
      name: Fun.constant('HtmlSelect'),
      schema: Fun.constant(schema),
      parts: Fun.constant([ ])
    }
  }
);