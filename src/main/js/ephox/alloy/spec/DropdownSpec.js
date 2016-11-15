define(
  'ephox.alloy.spec.DropdownSpec',

  [
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.dropdown.Beta',
    'ephox.alloy.dropdown.DropdownBehaviour',
    'ephox.alloy.dropdown.Gamma',
    'ephox.alloy.menu.logic.ViewTypes',
    'ephox.alloy.spec.ButtonSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Toggling, Beta, DropdownBehaviour, Gamma, ViewTypes, ButtonSpec, SpecSchema, UiSubstitutes, FieldSchema, Objects, Merger, Fun, Option) {
    var schema = [
      FieldSchema.strict('fetch'),
      FieldSchema.defaulted('onOpen', Fun.noop),
      FieldSchema.defaulted('onExecute', Option.none),
      FieldSchema.defaulted('toggleClass', 'alloy-selected-button'),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('displayer', Fun.identity),
      FieldSchema.option('lazySink'),
      FieldSchema.defaulted('matchWidth', false),
      ViewTypes.schema()
    ];

    var make = function (label, useView, spec) {
      var detail = SpecSchema.asStructOrDie(label, schema, Merger.deepMerge(spec, {
        view: useView
      }), Gamma.parts());

      var factories = Merger.deepMerge(
        Gamma.sink()
        // Gamma.display()
      );

      var components = UiSubstitutes.substitutePlaces(Option.none(), detail, detail.components(), {
        '<alloy.dropdown-display>': UiSubstitutes.single(
          Merger.deepMerge(
            {
              uiType: 'custom'
            },
            detail.parts().display(),
            {
              uid: detail.partUids().display,
              representing: {
                query: Fun.noop,
                set: function (comp, value) {
                  var dropdown = comp.getSystem().getByUid(detail.uid()).getOrDie();
                  detail.displayer()(dropdown, comp, value);
                }
              }
            }
          )
        )
      }, factories);
    
      return Merger.deepMerge(
        spec,
        ButtonSpec.make({
          uid: detail.uid(),
          action: function (component) {
            Beta.togglePopup(detail, component);
          }
        }),
        {
          uid: detail.uid(),
          uiType: 'custom',
          dom: detail.dom(),
          components: components,
          toggling: {
            toggleClass: detail.toggleClass(),
            aria: {
              'aria-expanded-attr': 'aria-expanded'
            }
          },
          eventOrder: {
            // Order, the button state is toggled first, so assumed !selected means close.
            'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
          },
          coupling: {
            others: {
              sandbox: function (hotspot) {
                return Beta.makeSandbox(detail, {
                  anchor: 'hotspot',
                  hotspot: hotspot
                }, hotspot, {
                  onOpen: function () { Toggling.select(hotspot); },
                  onClose: function () { Toggling.deselect(hotspot); }
                });
              }
            }
          },
          behaviours: [
            DropdownBehaviour(detail.partUids().display)
          ],
          keying: {
            mode: 'execution',
            useSpace: true
          },
          focusing: true
        }
      );
    };

    var list = function (spec) {
      return make(
        'dropdown.list',
        ViewTypes.useList(spec),
        Merger.deepMerge(
          {
            matchWidth: false
          },
          spec
        )
      );
    };

    var widget = function (spec) {
      return make(
        'dropdown.widget',
        ViewTypes.useWidget(spec),
        spec
      );
    };

    var menu = function (spec) {
      return make(
        'dropdown.menu',
        ViewTypes.useLayered(spec),
        spec
      );
    };

    var grid = function (spec) {
      return make(
        'dropdown.grid',
        ViewTypes.useGrid(spec),
        spec
      );
    };

    return {
      list: list,
      widget: widget,
      menu: menu,
      grid: grid
    };
  }
);