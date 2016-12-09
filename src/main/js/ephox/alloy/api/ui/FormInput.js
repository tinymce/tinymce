define(
  'ephox.alloy.api.ui.FormInput',

  [
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (CompositeBuilder, Input, PartType, FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('components'),
      FieldSchema.option('placeholder'),
      FieldSchema.defaulted('stickyPlaceholder', false),
      FieldSchema.defaulted('inline', true)
    ];

    var partTypes = [
      PartType.optional(
        { build: Fun.identity },
        'label',
        '<alloy.input.label>',
        Fun.constant({ }),
        Fun.constant({ })
      ),
      PartType.internal(
        Input,
        'field',
        '<alloy.input.field>',
        Fun.constant({ }),
        Fun.constant({ })
      )
    ];

    var build = function (spec) {
      console.log('spec', spec);
      return CompositeBuilder.build('form-input', schema, partTypes, make, spec);
    };

    var make = function (detail, components, spec, externals) {
      return {
        uiType: 'custom',
        dom: {
          tag: 'span'
        },
        components: components
      };
    };

    var parts = PartType.generate('form-input', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);