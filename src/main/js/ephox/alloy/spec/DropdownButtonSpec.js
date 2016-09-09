define(
  'ephox.alloy.spec.DropdownButtonSpec',

  [
    'ephox.alloy.spec.DropdownMenuSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (DropdownMenuSpec, FieldSchema, Objects, ValueSchema, Arr, Merger, Fun, Option) {
    var make = function (spec) {
      var detail = ValueSchema.asRawOrDie('dropdown.button.spec', ValueSchema.objOf([
        FieldSchema.strict('fetchItems'),
        FieldSchema.strict('text'),
        FieldSchema.defaulted('onOpen', Fun.noop),
        FieldSchema.defaulted('onExecute', Option.none),
        FieldSchema.strict('sink'),
        FieldSchema.option('uid')
      ]), spec);

      return DropdownMenuSpec.make({
        fetch: function () {
          return detail.fetchItems().map(function (rawItems) {
            var items = Arr.map(rawItems, function (item) {
              return Merger.deepMerge({
                type: 'item'
              }, item);
            });

            var primary = 'main-dropdown';
            var expansions = {};
            var menus = Objects.wrap(primary, items);

            return {
              primary: primary,
              expansions: expansions,
              menus: menus
            };
          });
        },
        text: detail.text,
        sink: detail.sink,
        onOpen: detail.onOpen,
        onExecute: detail.onExecute,
        // Not sure if that will work
        uid: detail.uid.getOr(undefined)
      });
    };

    return {
      make: make
    };
  }
);