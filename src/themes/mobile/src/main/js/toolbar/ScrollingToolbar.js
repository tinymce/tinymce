define(
  'tinymce.themes.mobile.toolbar.ScrollingToolbar',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger'
  ],

  function (GuiFactory, Container, Toolbar, ToolbarGroup, Cell, Fun, Merger) {
    return function () {
      var toolbar = GuiFactory.build(
        Toolbar.sketch(
          {
            dom: {
              tag: 'div',
              classes: [ 'mce-container', 'mce-toolbar', 'mce-stack-layout-item' ]
            },
            components: [
              Toolbar.parts().groups()
            ],
            parts: {
              groups: { }
            },
            behaviours: {
              toggling: {
                toggleClass: 'showing-inline-form',
                toggleOnExecute: false
              }
            },
            shell: true,
            members: {
              group: {
                munge: function (gSpec) {
                  return Merger.deepMerge(
                    gSpec,
                    {
                      dom: {
                        tag: 'div',
                        classes: [ 'mce-container', 'mce-flow-layout-item', 'mce-btn-group' ].concat(gSpec.extraClass !== undefined ? [ gSpec.extraClass ] : [ ]),
                        attributes: {
                          'aria-label': gSpec.label !== undefined ? gSpec.label : 'Untranslated'
                        }
                      },

                      components: [
                        Container.build({
                          components: [
                            ToolbarGroup.parts().items()
                          ]
                        })
                      ],
                      markers: {
                        // FIX: Use a tinymce class.
                        itemClass: 'ephox-chameleon-toolbar-top-item'
                      },

                      members: {
                        item: {
                          munge: Fun.identity
                        }
                      }
                    }
                  );
                }
              }
            }
          }
        )
      );

      var wrapper = GuiFactory.build(
        Container.sketch({
          dom: {
            // Use tinymce classes.
            classes: [ 'ephox-chameleon-toolstrip', 'ephox-polish-layer-above-editor', 'ephox-polish-mobile-show' ],
            attributes: {
              'role': 'region'
            },
            styles: {
              'overflow-x': 'auto'
            }
          },
          components: [
            GuiFactory.premade(toolbar)
          ]
        })
      );

      var initGroups = Cell([ ]);

      var setGroups = function (gs) {
        initGroups.set(gs);
        Toolbar.setGroups(toolbar, gs);
      };

      var refresh = function () {
        Toolbar.refresh(toolbar);
      };

      var setContextToolbar = function (gs) {
        Toolbar.setGroups(toolbar, gs);
      };

      var restoreToolbar = function () {
        Toolbar.setGroups(toolbar, initGroups.get());
      };

      return {
        wrapper: Fun.constant(wrapper),
        toolbar: Fun.constant(toolbar),
        setGroups: setGroups,
        setContextToolbar: setContextToolbar,
        restoreToolbar: restoreToolbar,
        refresh: refresh
      };
    };

  }
);