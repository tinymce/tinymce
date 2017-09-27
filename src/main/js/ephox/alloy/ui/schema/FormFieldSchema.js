define(
  'ephox.alloy.ui.schema.FormFieldSchema',

  [
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun'
  ],

  function (Composing, Representing, SketchBehaviours, PartType, FieldSchema, Objects, Fun) {
    var schema = [
      FieldSchema.defaulted('prefix', 'form-field'),
      SketchBehaviours.field('fieldBehaviours', [ Composing, Representing ])
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