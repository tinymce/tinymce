define(
  'ephox.alloy.api.ui.FormSelect',

  [
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.api.ui.HtmlSelect',
    'ephox.alloy.api.ui.common.FieldParts',
    'ephox.alloy.api.ui.common.FieldUtils',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (CompositeBuilder, HtmlSelect, FieldParts, FieldUtils, PartType, FieldSchema, Fun) {


    // Dupe with HtmlSelect
    var schema = [
      FieldSchema.defaulted('prefix', 'form-select')
    ];

    var partTypes = FieldParts(HtmlSelect);

    var build = function (spec) {
      return CompositeBuilder.build('form-select', schema, partTypes, make, spec);
    };

    var make = function (detail, components, spec, externals) {
      return {
        uiType: 'custom',
        dom: {
          tag: 'span'
        },
        components: components,
        behaviours: FieldUtils.behaviours(detail),
        events: FieldUtils.events(detail)
      };
    };

    var parts = PartType.generate('form-select', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)
    };

  }
);