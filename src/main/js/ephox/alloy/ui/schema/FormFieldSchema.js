define(
  'ephox.alloy.ui.schema.FormFieldSchema',

  [
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (PartType, FieldSchema, Fun) {
    var schema = [
      FieldSchema.defaulted('prefix', 'form-field')
    ];

    // Different because it needs a factory
    var makeParts = function (factory) {
      return [
        PartType.optional(
          { sketch: Fun.identity },
          [ ],
          'label',
          '<alloy.form-field.label>',
          Fun.constant({ }),
          Fun.constant({ })
        ),
        PartType.internal(
          factory,
          [ ],
          'field',
          '<alloy.form-field.field>',
          Fun.constant({ }),
          Fun.constant({ })
        )
      ];
    };
    
    return {
      name: Fun.constant('FormField'),
      schema: Fun.constant(schema),
      makeParts: makeParts
    }
  }
);