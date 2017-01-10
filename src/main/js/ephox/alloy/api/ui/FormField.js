define(
  'ephox.alloy.api.ui.FormField',

  [
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.common.FieldBase',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (UiBuilder, PartType, FieldBase, FieldSchema, Fun) {
    var schema = [
      FieldSchema.defaulted('prefix', 'form-field')
    ];

    var build = function (factory, spec) {
      var partTypes = makePartTypes(factory);
      return UiBuilder.composite(factory.name(), schema, partTypes, make, spec);
    };

    var make = function (detail, components, spec, externals) {
      return {
        dom: {
          tag: 'div'
        },
        components: components,
        behaviours: FieldBase.behaviours(detail),
        events: FieldBase.events(detail)
      };
    };

    var makePartTypes = function (factory) {
      return [
        PartType.optional(
          { build: Fun.identity },
          'label',
          '<alloy.form-field.label>',
          Fun.constant({ }),
          Fun.constant({ })
        ),
        PartType.internal(
          factory,
          'field',
          '<alloy.form-field.field>',
          Fun.constant({ }),
          Fun.constant({ })
        )
      ];
    };

    var parts = function (factory) {
      var partTypes = makePartTypes(factory);
      return PartType.generate(factory.name(), partTypes);
    };

    return {
      build: build,
      parts: parts
    };
  }
);