define(
  'ephox.alloy.api.ui.SplitDropdown',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.dropdown.Beta',
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'global!Error'
  ],

  function (SystemEvents, Behaviour, Composing, Highlighting, Keying, Toggling, Button, UiBuilder, Beta, InternalSink, PartType, ButtonBase, FieldSchema, Fun, Option, Error) {
    var schema = [
      FieldSchema.strict('toggleClass'),
      FieldSchema.strict('fetch'),
      FieldSchema.strict('onExecute'),
      FieldSchema.option('lazySink'),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('onOpen', Fun.noop),
      // FieldSchema.defaulted('onClose', Fun.noop),

      FieldSchema.defaulted('matchWidth', false)
    ];

    var arrowPart = PartType.internal(
      Button,
      'arrow',
      '<alloy.split-dropdown.arrow>',
      function (detail) {
        return {
          behaviours: {
            tabstopping: Behaviour.revoke(),
            focusing: Behaviour.revoke()
          }
        };
      },
      function (detail) {
        return {
          action: function (arrow) {
            var hotspot = arrow.getSystem().getByUid(detail.uid()).getOrDie();
            hotspot.getSystem().triggerEvent(SystemEvents.execute(), hotspot.element(), { });
          },
          behaviours: {
            toggling: {
              toggleOnExecute: false,
              toggleClass: detail.toggleClass()
            }
          }
        };
      }
    );

    var buttonPart = PartType.internal(
      Button,
      'button',
      '<alloy.split-dropdown.button>',
      function (detail) {
        return {
          behaviours: {
            focusing: Behaviour.revoke()
          }
        };
      },
      function (detail) {
        return {
          action: detail.onExecute()
        };
      }
    );

    var partTypes = [
      arrowPart,
      buttonPart,
      PartType.external(
        { build: Fun.identity },
        'menu', 
        function (detail) {
          return {
            onExecute: detail.onExecute()
          };
        },
        Fun.constant({ })
      ),
      InternalSink
    ];

    var make = function (detail, components, spec, externals) {
      var buttonEvents = ButtonBase.events(Option.some(
        function (component) {
          Beta.togglePopup(detail, {
            anchor: 'hotspot',
            hotspot: component
          }, component, externals).get(function (sandbox) {
            Composing.getCurrent(sandbox).each(function (current) {
              Highlighting.highlightFirst(current);
              Keying.focusIn(current);
            });
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

    var build = function (f) {
      return UiBuilder.composite('split-dropdown', schema, partTypes, make, f);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate('split-dropdown', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);