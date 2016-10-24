define(
  'ephox.alloy.menu.util.MenuMarkers',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (FieldSchema, ValueSchema, Fun) {
    var menuFields = [
      FieldSchema.strict('menu'),
      FieldSchema.strict('selectedMenu')
    ];

    var itemFields = [
      FieldSchema.strict('item'),
      FieldSchema.strict('selectedItem')
    ];

    var schema = ValueSchema.objOf(
      itemFields.concat(menuFields)
    );

    var itemSchema = ValueSchema.objOf(itemFields);

    return {
      schema: Fun.constant(schema),
      itemSchema: Fun.constant(itemSchema)
    };
  }
);