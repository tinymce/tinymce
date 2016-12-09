define(
  'ephox.alloy.api.ui.FormInput',

  [
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.api.ui.common.FieldParts',
    'ephox.alloy.api.ui.common.FieldUtils',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (CompositeBuilder, Input, FieldParts, FieldUtils, PartType, FieldSchema, Fun) {
    var schema = [
      FieldSchema.defaulted('prefix', 'form-input')
    ];

    var partTypes = FieldParts(Input);

    var build = function (spec) {
      return CompositeBuilder.build('form-input', schema, partTypes, make, spec);
    };

    var make = function (detail, components, spec, externals) {
      return {
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        components: components,
        behaviours: FieldUtils.behaviours(detail),
        events: FieldUtils.events(detail)
      };
    };

    var parts = PartType.generate('form-input', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);