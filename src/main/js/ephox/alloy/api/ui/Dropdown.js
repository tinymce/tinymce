define(
  'ephox.alloy.api.ui.Dropdown',

  [
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.dropdown.DropdownUtils',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.alloy.ui.schema.DropdownSchema',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (Composing, Highlighting, Keying, Toggling, UiSketcher, DropdownUtils, PartType, ButtonBase, DropdownSchema, Merger, Fun, Option) {
    var schema = DropdownSchema.schema();
    var partTypes = DropdownSchema.parts();

    var make = function (detail, components, spec, externals) {
      return Merger.deepMerge(
        {
          events: ButtonBase.events(
            Option.some(function (component) {
              DropdownUtils.togglePopup(detail, {
                anchor: 'hotspot',
                hotspot: component
              }, component, externals).get(function (sandbox) {
                Composing.getCurrent(sandbox).each(function (current) {
                  Highlighting.highlightFirst(current);
                  Keying.focusIn(current);
                });
              });
            })
          )
        },
        {
          uid: detail.uid(),
          dom: detail.dom(),
          components: components,
          behaviours: Merger.deepMerge(
            {
              toggling: {
                toggleClass: detail.toggleClass(),
                aria: {
                  mode: 'pressed',
                  syncWithExpanded: true
                }
              },
              coupling: {
                others: {
                  sandbox: function (hotspot) {
                    return DropdownUtils.makeSandbox(detail, {
                      anchor: 'hotspot',
                      hotspot: hotspot
                    }, hotspot, {
                      onOpen: function () { Toggling.on(hotspot); },
                      onClose: function () { Toggling.off(hotspot); }
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
            detail.dropdownBehaviours()
          ),

          eventOrder: {
            // Order, the button state is toggled first, so assumed !selected means close.
            'alloy.execute': [ 'toggling', 'alloy.base.behaviour' ]
          }
        },
        {
          dom: {
            attributes: {
              role: detail.role().getOr('button')
            }
          }
        }
      );
    };

    var sketch = function (spec) {
      return UiSketcher.composite(DropdownSchema.name(), schema, partTypes, make, spec);
    };

    // TODO: Remove likely dupe
    var parts = PartType.generate(DropdownSchema.name(), partTypes);

    return {
      sketch: sketch,
      parts: Fun.constant(parts)
    };
  }
);