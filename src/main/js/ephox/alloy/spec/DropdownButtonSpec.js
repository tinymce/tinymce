define(
  'ephox.alloy.spec.DropdownButtonSpec',

  [
    'ephox.alloy.spec.DropdownMenuSpec',
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

  function (DropdownMenuSpec, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Merger, Fun, Option, Result, Width) {
    

    var dependents = {
      '<alloy.dropdown.display>': function (comp, detail) {
        console.log('extra', comp.extra);
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
      var detail = ValueSchema.asRawOrDie('dropdown.button.spec', ValueSchema.objOf([
        FieldSchema.strict('fetchItems'),
        FieldSchema.defaulted('onOpen', Fun.noop),
        FieldSchema.defaulted('onExecute', Option.none),
        FieldSchema.strict('dom'),
        FieldSchema.field(
          'components',
          'components',
          FieldPresence.defaulted([ ]),
          ValueSchema.arrOf(
            ValueSchema.valueOf(function (comp) {
              console.log('comp.validator', comp);
              if (comp.uiType !== 'dependent') return Result.value(Fun.constant(comp));
              else return Objects.hasKey(dependents, comp.name) ? Result.value(Fun.curry(dependents[comp.name], comp)) : Result.error('Dependent component: ' + comp.name + ' not known by DummySpec');
            })
          )
        ),
        FieldSchema.option('sink'),
        FieldSchema.strict('uid')
      ]), spec);
      

      var components = Arr.map(detail.components, function (comp) {
        return comp(detail);
      });

      console.log('components', components);

      return Merger.deepMerge(spec, DropdownMenuSpec.make({
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
        // Not sure if that will work
        uid: detail.uid,
        dom: detail.dom,
        components: components
      }));
    };

    return {
      make: make
    };
  }
);