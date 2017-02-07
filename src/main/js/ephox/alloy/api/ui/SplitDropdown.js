define(
  'ephox.alloy.api.ui.SplitDropdown',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.dropdown.Beta',
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.alloy.ui.schema.SplitDropdownSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'global!Error'
  ],

  function (Behaviour, Composing, Highlighting, Keying, Toggling, SystemEvents, Button, UiBuilder, Beta, InternalSink, PartType, ButtonBase, SplitDropdownSchema, FieldSchema, Merger, Fun, Option, Error) {
    var schema = SplitDropdownSchema.schema();
    var partTypes = SplitDropdownSchema.parts();

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
      return Merger.deepMerge(
        {
          uid: detail.uid(),
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
        },
        {
          dom: {
            attributes: {
              role: 'presentation'
            }
          }
        }
      );
    };

    var build = function (f) {
      return UiBuilder.composite(SplitDropdownSchema.name(), schema, partTypes, make, f);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate(SplitDropdownSchema.name(), partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);