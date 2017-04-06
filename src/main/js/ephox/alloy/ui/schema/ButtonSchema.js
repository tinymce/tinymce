define(
  'ephox.alloy.ui.schema.ButtonSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (FieldSchema, Fun) {
    var schema = [
      FieldSchema.defaulted('uid', undefined),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('components', [ ]),
      FieldSchema.defaulted('buttonBehaviours', { }),
      FieldSchema.option('action'),
      FieldSchema.option('role'),
      FieldSchema.defaulted('customBehaviours', [ ]),
      FieldSchema.defaulted('eventOrder', { })
    ];

    return {
      name: Fun.constant('Button'),
      schema: Fun.constant(schema),
      parts: Fun.constant([ ])
    };
  }
);