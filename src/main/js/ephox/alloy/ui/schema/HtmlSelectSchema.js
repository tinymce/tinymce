define(
  'ephox.alloy.ui.schema.HtmlSelectSchema',

  [
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Fields, FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('options'),
      Fields.members([ 'option' ]),
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