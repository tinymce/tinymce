define(
  'ephox.alloy.data.Fields',

  [
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.peanut.Fun'
  ],

  function (MenuMarkers, FieldSchema, Arr, Fun) {

    var initSize = FieldSchema.strictObjOf('initSize', [
      FieldSchema.strict('numColumns'),
      FieldSchema.strict('numRows')
    ]);

    var members = function (required) {
      return FieldSchema.strictObjOf('members', Arr.map(required, FieldSchema.strict));
    };

    var itemMarkers = function () {
      FieldSchema.strictOf('markers', MenuMarkers.itemSchema());
    };

    var menuMarkers = function () {
      return FieldSchema.strictOf('markers', MenuMarkers.schema());
    };

    return {
      initSize: Fun.constant(initSize),
      members: members,
      itemMarkers: itemMarkers,
      menuMarkers: menuMarkers
    };
  }
);