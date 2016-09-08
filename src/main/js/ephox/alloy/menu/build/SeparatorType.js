define(
  'ephox.alloy.menu.build.SeparatorType',

  [
    'ephox.boulder.api.FieldSchema'
  ],

  function (FieldSchema) {
    var schema = [
      FieldSchema.defaulted('classes', [ ]),
      FieldSchema.strict('markers'),
      FieldSchema.state('builder', function () {
        return builder;
      })
    ];

    var builder = function (info) {
      return {
        uiType: 'custom',
        dom: {
          tag: 'li',
          classes: [ ]
        }
      };
    };

    return schema;
  }
);