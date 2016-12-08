define(
  'ephox.alloy.spec.DropdownSpec',

  [
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.dropdown.Beta',
    'ephox.alloy.spec.ButtonSpec',
    'ephox.highway.Merger'
  ],

  function (Toggling, Beta, ButtonSpec, Merger) {
    var make = function (detail, components, spec, externals) {
      return Merger.deepMerge(
        // FIX: Ugly
        ButtonSpec.make({
          uid: detail.uid(),
          // FIX: Re-used.
          dom: detail.dom(),
          action: function (component) {
            Beta.togglePopup(detail, {
              anchor: 'hotspot',
              hotspot: component
            }, component, externals).get(function (sandbox) {

            });
          }
        }),
        {
          uid: detail.uid(),
          uiType: 'custom',
          // FIX: Re-used.
          dom: detail.dom(),
          components: components,
          behaviours: {
            toggling: {
              toggleClass: detail.toggleClass(),
              aria: {
                'aria-expanded-attr': 'aria-expanded'
              }
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
            keying: {
              mode: 'execution',
              useSpace: true
            },
            focusing: true
          },

          eventOrder: {
            // Order, the button state is toggled first, so assumed !selected means close.
            'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
          }
        }
      );
    };

    return {
      make: make
    };
  }
);