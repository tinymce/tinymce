define(
  'ephox.alloy.spec.DropdownButtonSpec',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.spec.DropdownMenuSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Width',
    'global!Error'
  ],

  function (Behaviour, DomModification, DropdownMenuSpec, SpecSchema, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Obj, Merger, Fun, Option, Width, Error) {

    var factories = {
      '<alloy.dropdown.display>': function (comp, detail) {
        var fromUser = Objects.readOptFrom(detail.dependents, '<alloy.dropdown.display>');
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
        }, fromUser);
      }
    };

    var make = function (spec) {
      var detail = SpecSchema.asRawOrDie('dropdown.button', [
        FieldSchema.strict('fetchItems'),
        FieldSchema.defaulted('onOpen', Fun.noop),
        FieldSchema.defaulted('onExecute', Option.none),
        FieldSchema.strict('dom'),
        FieldSchema.option('sink'),
        FieldSchema.defaulted('dependents', { })
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
        behaviours: [
          Behaviour.contract({
            name: Fun.constant('dropdown.button.api'),
            exhibit: function () { return DomModification.nu({ }); },
            handlers: Fun.constant({ }),
            apis: function (info) {
              return {
                showValue: function (component, value) {
                  var displayer = component.getSystem().getByUid(detail.uid + '-dropdown.display').getOrDie();
                  displayer.apis().setValue(value);
                }
              };
            },
            schema: Fun.constant(FieldSchema.field(
              'dropdown.button.api',
              'dropdown.button.api',
              FieldPresence.asOption(),
              ValueSchema.anyValue()
            ))
          })
        ],
        library: factories
      }, factories);
    };

    return {
      make: make
    };
  }
);