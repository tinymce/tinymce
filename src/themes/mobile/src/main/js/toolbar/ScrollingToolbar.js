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
                        Container.sketch({
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
                      },

                      parts: {
                        items: { }
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
            classes: [ 'mce-toolbar-grp', 'mce-container', 'mce-panel', 'mce-stack-layout-item' ]
          },
          components: [
            Container.sketch({
              dom: {
                tag: 'div',
                classes: [ 'mce-container-body', 'mce-stack-layout' ]
              },
              components: [
                GuiFactory.premade(toolbar)
              ]
            })
          ]
        })
      );

      var initGroups = Cell([ ]);

      var setGroups = function (gs) {
        initGroups.set(gs);
        Toolbar.setGroups(toolbar, gs);
      };

      var createGroups = function (gs) {
        return Toolbar.createGroups(toolbar, gs);
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
        createGroups: createGroups,
        setGroups: setGroups,
        setContextToolbar: setContextToolbar,
        restoreToolbar: restoreToolbar,
        refresh: refresh
      };
    };

  }
);