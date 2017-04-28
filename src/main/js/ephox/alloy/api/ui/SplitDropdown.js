define(
  'ephox.alloy.api.ui.SplitDropdown',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.dropdown.DropdownUtils',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.alloy.ui.schema.SplitDropdownSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option'
  ],

  function (
    Behaviour, Composing, Coupling, Focusing, Highlighting, Keying, Toggling, UiSketcher, DropdownUtils, PartType, ButtonBase, SplitDropdownSchema, Fun, Merger,
    Option
  ) {
    var schema = SplitDropdownSchema.schema();
    var partTypes = SplitDropdownSchema.parts();

    var make = function (detail, components, spec, externals) {
      var buttonEvents = ButtonBase.events(Option.some(
        function (component) {
          DropdownUtils.togglePopup(detail, {
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

          behaviours: Behaviour.derive([
            Coupling.config({
              others: {
                sandbox: function (hotspot) {
                  var arrow = hotspot.getSystem().getByUid(detail.partUids().arrow).getOrDie();
                  var extras = {
                    onOpen: function () {
                      Toggling.on(arrow);
                    },
                    onClose: function () {
                      Toggling.off(arrow);
                    }
                  };

                  return DropdownUtils.makeSandbox(detail, {
                    anchor: 'hotspot',
                    hotspot: hotspot
                  }, hotspot, extras);
                }
              }
            }),
            Keying.config({
              mode: 'execution',
              useSpace: true
            }),
            Focusing.config({ })
          ])
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

    var sketch = function (f) {
      return UiSketcher.composite(SplitDropdownSchema.name(), schema, partTypes, make, f);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate(SplitDropdownSchema.name(), partTypes);

    return {
      sketch: sketch,
      parts: Fun.constant(parts)
    };
  }
);