define(
  'ephox.alloy.spec.SplitDropdownSpec',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dropdown.Beta',
    'ephox.alloy.dropdown.Gamma',
    'ephox.alloy.menu.logic.ViewTypes',
    'ephox.alloy.spec.ButtonSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'global!Error'
  ],

  function (SystemEvents, Toggling, EventHandler, Beta, Gamma, ViewTypes, ButtonSpec, SpecSchema, UiSubstitutes, FieldSchema, Objects, Merger, Fun, Option, Error) {
    var schema = [
      FieldSchema.strict('toggleClass'),
      FieldSchema.strict('fetch'),
      FieldSchema.strict('onExecute'),
      FieldSchema.option('lazySink'),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('onOpen', Fun.noop),
      // FieldSchema.defaulted('onClose', Fun.noop),

      FieldSchema.defaulted('matchWidth', false),
    
      ViewTypes.schema()
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('split-dropdown.spec', schema, spec, [
        'button',
        'arrow'
      ]);

      // Need to make the substitutions for "button" and "arrow"
      var components = UiSubstitutes.substitutePlaces(Option.some('split-dropdown'), detail, detail.components(), {
        '<alloy.split-dropdown.button>': UiSubstitutes.single(
          Merger.deepMerge(
            {
              focusing: undefined
            },
            detail.parts()['button'](),
            {
              uid: detail.partUids()['button'],
              uiType: 'button',
              action: detail.onExecute()
            }
          )
        ),

        '<alloy.split-dropdown.arrow>': UiSubstitutes.single(
          Merger.deepMerge({
            uiType: 'button',
            tabstopping: undefined,
            focusing: undefined
          }, detail.parts().arrow(), {
            uid: detail.partUids().arrow,
            action: function (arrow) {
              var hotspot = arrow.getSystem().getByUid(detail.uid()).getOrDie();
              hotspot.getSystem().triggerEvent(SystemEvents.execute(), hotspot.element(), { });
            },
            toggling: {
              toggleOnExecute: false
            }
          })
        )
      }, Gamma.sink());

      return Merger.deepMerge(
        ButtonSpec.make({
          uid: detail.uid(),
          action: function (component) {
            Beta.togglePopup(detail, component);
          }
        }), {
          uid: detail.uid(),
          uiType: 'button',
          dom: detail.dom(),
          components: components,
          // toggling: {
          //   toggleClass: detail.toggleClass(),
          //   aria: {
          //     'aria-expanded-attr': 'aria-expanded'
          //   }
          // },
          eventOrder: {
            // Order, the button state is toggled first, so assumed !selected means close.
            'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
          },
          coupling: {
            others: {
              sandbox: function (hotspot) {
                var arrow = hotspot.getSystem().getByUid(detail.partUids().arrow).getOrDie();
                var extras = {
                  onOpen: function () {
                    Toggling.select(arrow);
                  },
                  onClose: function () {
                    Toggling.deselect(arrow);
                  }
                };

                return Beta.makeSandbox(detail, hotspot, extras);
              }
            }
          },
          keying: {
            mode: 'execution',
            useSpace: true
          },
          focusing: true          
        }
      );
    };

    return {
      make: make
    };
  }
);