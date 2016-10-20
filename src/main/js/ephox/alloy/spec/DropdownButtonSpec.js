define(
  'ephox.alloy.spec.DropdownButtonSpec',

  [
    'ephox.alloy.spec.DropdownMenuSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Width',
    'global!Error'
  ],

  function (DropdownMenuSpec, SpecSchema, FieldSchema, Objects, Arr, Obj, Merger, Fun, Option, Width, Error) {

    var factories = {
      '<alloy.dropdown.display>': function (comp, detail) {
        return Merger.deepMerge(comp.extra, {
          uiType: 'container',
          uid: detail.uid + '-dropdown.display',
          dom: {
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

      var scan = function (compSpec) {
        return Objects.readOptFrom(factories, compSpec.name).fold(function () {
          throw new Error('Unknown dependent component: ' + compSpec.name + '\nKnown: [' + Obj.keys(factories) + ']\nSpec: ' + compSpec);
        }, function (builder) {
          return builder(compSpec, detail);
        });
      };

      var connect = function (compSpec) {
        var base = compSpec.uiType !== 'dependent' ? compSpec : scan(compSpec);
        var cs = Objects.readOptFrom(base, 'components').getOr([ ]);
        var cs2 = Arr.map(cs, connect);
        return Merger.deepMerge(base, {
          components: cs2
        });
      };

      var components = Arr.map(detail.components, function (compSpec) {
        return connect(compSpec);
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
        components: components,
        library: factories
      }, factories);
    };

    return {
      make: make
    };
  }
);