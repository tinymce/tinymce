define(
  'ephox.alloy.spec.DropdownButtonSpec',

  [
    'ephox.alloy.spec.DropdownMenuSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Width'
  ],

  function (DropdownMenuSpec, SpecSchema, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Merger, Fun, Option, Result, Width) {
    

    var factories = {
      '<alloy.dropdown.display>': function (comp, detail) {
        throw new Error('Finally!');
        return Merger.deepMerge(comp.extra, {
          uiType: 'container',
          uid: detail.uid + '-dropdown.display',
          dom: {
            tag: 'div',
            attributes: {
              'data-goal': 'true'
            },
            // FIX: Getting clobbered.
            classes: [ 'from-spec' ]
          }
        });
      }
    };

    var make = function (spec) {
      var detail = SpecSchema.asRawOrDie('dropdown.button', [
        FieldSchema.strict('fetchItems'),
        FieldSchema.defaulted('onOpen', Fun.noop),
        FieldSchema.defaulted('onExecute', Option.none),
        FieldSchema.strict('dom'),
        FieldSchema.option('sink')
      ], spec, factories);
      

      var components = Arr.map(detail.components, function (comp) {
        return comp(detail);
      });

      return SpecSchema.extend(DropdownMenuSpec.make, spec, {
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
        sink: detail.sink.getOr(undefined),
        onOpen: function (button, sandbox, menu) {
          var buttonWidth = Width.get(button.element());
          Width.set(menu.element(), buttonWidth);
          detail.onOpen(button, sandbox, menu);
        },
        onExecute: detail.onExecute,
        components: components
      }, factories);
    };

    return {
      make: make
    };
  }
);