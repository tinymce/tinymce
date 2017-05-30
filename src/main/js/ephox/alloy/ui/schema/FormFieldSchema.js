define(
  'ephox.alloy.ui.schema.FormFieldSchema',

  [
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun'
  ],

  function (PartType, FieldSchema, Objects, Fun) {
    var schema = [
      FieldSchema.defaulted('prefix', 'form-field'),
      FieldSchema.defaulted('fieldBehaviours', { })
    ];

    var parts = [
      PartType.optional({
        schema: [ FieldSchema.strict('dom') ],
        name: 'label'
      }),

      PartType.required({
        factory: {
          sketch: function (spec) {
            var excludeFactory = Objects.exclude(spec, [ 'factory' ]);
            return spec.factory.sketch(excludeFactory);
          }
        },
        schema: [ FieldSchema.strict('factory') ],
        name: 'field'
      })
    ];

    return {
      schema: Fun.constant(schema),
      parts: Fun.constant(parts)
    };
  }
);