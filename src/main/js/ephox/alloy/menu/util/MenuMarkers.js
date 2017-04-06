define(
  'ephox.alloy.menu.util.MenuMarkers',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun'
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

    var schema = ValueSchema.objOfOnly(
      itemFields.concat(menuFields)
    );

    var itemSchema = ValueSchema.objOfOnly(itemFields);

    return {
      menuFields: Fun.constant(menuFields),
      itemFields: Fun.constant(itemFields),
      schema: Fun.constant(schema),
      itemSchema: Fun.constant(itemSchema)
    };
  }
);