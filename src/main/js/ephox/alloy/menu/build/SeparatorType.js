define(
  'ephox.alloy.menu.build.SeparatorType',

  [
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema'
  ],

  function (SpecSchema, FieldSchema, ValueSchema) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('components'),
      FieldSchema.state('builder', function () {
        return builder;
      })
    ];

    var builder = function (detail) {
      return {
        uiType: 'custom',
        dom: detail.dom(),
        components: detail.components()
      };
    };

    return schema;
  }
);