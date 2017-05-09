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
      Fields.onHandler('onShow'),
      Fields.onHandler('onHide'),
      FieldSchema.defaulted('inlineBehaviours', { }),
      FieldSchema.defaulted('customBehaviours', [ ]),
      FieldSchema.defaulted('eventOrder')
    ];

    return {
      name: Fun.constant('InlineView'),
      schema: Fun.constant(schema),
      parts: Fun.constant([ ])
    }
  }
);