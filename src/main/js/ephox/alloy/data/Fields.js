define(
  'ephox.alloy.data.Fields',

  [
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Arr',
    'ephox.peanut.Fun'
  ],

  function (MenuMarkers, FieldSchema, Arr, Fun) {

    var initSize = FieldSchema.strictObjOf('initSize', [
      FieldSchema.strict('numColumns'),
      FieldSchema.strict('numRows')
    ]);

    var members = function (required) {
      return FieldSchema.strictObjOf('members', Arr.map(required, function (reqd) {
        return FieldSchema.strictObjOf(reqd, [
          FieldSchema.strict('munge')
        ]);
      }));
    };

    var itemMarkers = function () {
      return FieldSchema.strictOf('markers', MenuMarkers.itemSchema());
    };

    var menuMarkers = function () {
      return FieldSchema.strictOf('markers', MenuMarkers.schema());
    };

    var tieredMenuMarkers = function () {
      return FieldSchema.strictObjOf('markers', [
        FieldSchema.strict('backgroundMenu')
      ].concat(MenuMarkers.menuFields()).concat(MenuMarkers.itemFields()));
    };

    var markers = function (required) {
      return FieldSchema.strictObjOf('markers', Arr.map(required, FieldSchema.strict));
    };

    return {
      initSize: Fun.constant(initSize),
      members: members,
      itemMarkers: itemMarkers,
      menuMarkers: menuMarkers,
      tieredMenuMarkers: tieredMenuMarkers,
      markers: markers
    };
  }
);