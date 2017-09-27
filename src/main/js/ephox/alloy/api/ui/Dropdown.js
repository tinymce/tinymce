define(
  'ephox.alloy.api.ui.Dropdown',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.dropdown.DropdownUtils',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.alloy.ui.schema.DropdownSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option'
  ],

  function (Behaviour, Composing, Coupling, Focusing, Highlighting, Keying, Toggling, Sketcher, DropdownUtils, ButtonBase, DropdownSchema, Fun, Merger, Option) {
    var factory = function (detail, components, spec, externals) {
      var switchToMenu = function (sandbox) {
        Composing.getCurrent(sandbox).each(function (current) {
          Highlighting.highlightFirst(current);
          Keying.focusIn(current);
        });
      };

      var action = function (component) {
        var anchor = { anchor: 'hotspot', hotspot: component };
        var onOpenSync = switchToMenu;
        DropdownUtils.togglePopup(detail, anchor, component, externals, onOpenSync).get(Fun.noop);
      };

      return Merger.deepMerge(
        {
          events: ButtonBase.events(
            Option.some(action)
          )
        },
        {
          uid: detail.uid(),
          dom: detail.dom(),
          components: components,
          behaviours: Merger.deepMerge(
            Behaviour.derive([
              Toggling.config({
                toggleClass: detail.toggleClass(),
                aria: {
                  // INVESTIGATE: Are we sure we want aria-pressed as well as aria-expanded here?
                  mode: 'pressed',
                  syncWithExpanded: true
                }
              }),
              Coupling.config({
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
              }),
              Keying.config({
                mode: 'execution',
                useSpace: true
              }),
              Focusing.config({ })
            ]),
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
              role: detail.role().getOr('button'),
              'aria-haspopup': 'true'
            }
          }
        }
      );
    };

    return Sketcher.composite({
      name: 'Dropdown',
      configFields: DropdownSchema.schema(),
      partFields: DropdownSchema.parts(),
      factory: factory
    });
  }
);