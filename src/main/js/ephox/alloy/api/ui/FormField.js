define(
  'ephox.alloy.api.ui.FormField',

  [
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.api.ui.common.FieldParts',
    'ephox.alloy.api.ui.common.FieldUtils',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema'
  ],

  function (CompositeBuilder, FieldParts, FieldUtils, PartType, FieldSchema) {
    var schema = [
      FieldSchema.defaulted('prefix', 'form-field')
    ];

    

    var build = function (factory, spec) {
      var partTypes = FieldParts(factory);
      return CompositeBuilder.build(factory.name(), schema, partTypes, make, spec);
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

    var parts = function (factory) {
      var partTypes = FieldParts(factory);
      return PartType.generate(factory.name(), partTypes);
    };

    return {
      build: build,
      parts: parts
    };
  }
);