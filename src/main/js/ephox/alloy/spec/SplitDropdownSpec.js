define(
  'ephox.alloy.spec.SplitDropdownSpec',

  [
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.dropdown.Beta',
    'ephox.alloy.spec.ButtonBase',
    'ephox.perhaps.Option',
    'global!Error'
  ],

  function (Toggling, Beta, ButtonBase, Option, Error) {
    var make = function (detail, components, spec, externals) {
      var buttonEvents = ButtonBase.events(Option.some(
        function (component) {
          Beta.togglePopup(detail, {
            anchor: 'hotspot',
            hotspot: component
          }, component, externals).get(function (sandbox) {

          });
        }
      ));
      return {
        uid: detail.uid(),
        uiType: 'custom',
        dom: detail.dom(),
        components: components,
        eventOrder: {
          // Order, the button state is toggled first, so assumed !selected means close.
          'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
        },

        events: buttonEvents,

        behaviours: {
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

                return Beta.makeSandbox(detail, {
                  anchor: 'hotspot',
                  hotspot: hotspot
                }, hotspot, extras);
              }
            }
          },
          keying: {
            mode: 'execution',
            useSpace: true
          },
          focusing: true
        }
      };
    };

    return {
      make: make
    };
  }
);