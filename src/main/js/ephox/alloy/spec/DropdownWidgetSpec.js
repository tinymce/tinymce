define(
  'ephox.alloy.spec.DropdownWidgetSpec',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.dropdown.Dropdown',
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Width'
  ],

  function (Behaviour, DomModification, Dropdown, MenuMarkers, SpecSchema, UiSubstitutes, FieldPresence, FieldSchema, Objects, ValueSchema, Merger, Fun, Option, Width) {
    // DUPE:
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
      var detail = SpecSchema.asRawOrDie('dropdown.list', [
        FieldSchema.strict('fetchItems'),
        FieldSchema.defaulted('onOpen', Fun.noop),
        FieldSchema.defaulted('onExecute', Option.none),
        FieldSchema.defaulted('toggleClass', 'alloy-selected-button'),
        FieldSchema.strict('dom'),
        FieldSchema.option('sink'),
        FieldSchema.defaulted('dependents', { }),

        FieldSchema.field(
          'members',
          'members',
          FieldPresence.strict(),
          ValueSchema.objOf([
            FieldSchema.strict('menu'),
            FieldSchema.strict('item')
          ])
        ),

        FieldSchema.field(
          'markers',
          'markers',
          FieldPresence.strict(),
          MenuMarkers.itemSchema()
        )
      ], spec, factories);

      var components = UiSubstitutes.substituteAll(detail, detail.components, factories, { });
    
      return SpecSchema.extend(Dropdown.make, spec, {
        fetch: function () {
          return detail.fetchItems().map(function (items) {
            var primary = 'main-dropdown';
            var expansions = {};
            var menus = Objects.wrap(primary, {
              name: primary,
              textkey: 'DOGS',
              items: items
            });

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
        view: {
          style: 'widget',
          members: spec.members,
          markers: spec.markers
        }
      }, factories);
    };

    return {
      make: make
    };
    return null;
  }
);