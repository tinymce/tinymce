define(
  'ephox.alloy.data.Fields',

  [
    'ephox.alloy.debugging.StackTrace',
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Result',
    'global!console'
  ],

  function (StackTrace, MenuMarkers, FieldPresence, FieldSchema, ValueSchema, Arr, Fun, Result, console) {
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

    var onHandler = function (fieldName) {
      // We care about where the handler was declared (in terms of which schema)
      var trace = StackTrace.get();
      return FieldSchema.field(
        fieldName,
        fieldName,
        FieldPresence.defaulted(Fun.noop),
        // Apply some wrapping to their supplied function
        ValueSchema.valueOf(function (f) {
          return Result.value(function () {
            // Uncomment this line for debugging
            console.log('onHandler [' + fieldName + ']', trace);
            return f.apply(undefined, arguments);
          });
        })
      );
    };

    return {
      initSize: Fun.constant(initSize),
      members: members,
      itemMarkers: itemMarkers,
      menuMarkers: menuMarkers,
      tieredMenuMarkers: tieredMenuMarkers,
      markers: markers,

      onHandler: onHandler
    };
  }
);