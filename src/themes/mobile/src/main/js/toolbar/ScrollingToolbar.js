define(
  'tinymce.themes.mobile.toolbar.ScrollingToolbar',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.behaviour.AdhocBehaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.sugar.api.properties.Css',
    'tinymce.themes.mobile.ios.scroll.Scrollables',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.touch.scroll.Scrollable'
  ],

  function (
    EventRoot, AdhocBehaviour, Behaviour, Keying, Toggling, GuiFactory, SystemEvents, Container, Toolbar, ToolbarGroup, EventHandler, Objects, Cell, Fun, Merger,
    Css, Scrollables, Styles, Scrollable
  ) {
    return function () {
      var toolbar = GuiFactory.build(
        Toolbar.sketch(
          {
            dom: {
              tag: 'div',
              classes: [ Styles.resolve('toolbar') ]
            },
            components: [
              Toolbar.parts().groups()
            ],
            parts: {
              groups: { }
            },
            toolbarBehaviours: Behaviour.derive([
              Toggling.config({
                toggleClass: Styles.resolve('context-toolbar'),
                toggleOnExecute: false,
                aria: {
                  mode: 'none'
                }
              }),
              Keying.config({
                mode: 'cyclic'
              })
            ]),
            shell: true,
            members: {
              group: {
                munge: function (gSpec) {
                  return Merger.deepMerge(
                    {
                      dom: {
                        tag: 'div',
                        classes: [ Styles.resolve('toolbar-group') ].concat(
                          gSpec.scrollable === true ? Styles.resolve([ 'toolbar-scrollable-group' ]) : [ ]
                        ),
                        attributes: {
                          'aria-label': gSpec.label
                        }
                      },

                      tgroupBehaviours: Behaviour.derive([
                        AdhocBehaviour.config('adhoc-scrollable-toolbar')
                      ]),
                      customBehaviours: [
                        AdhocBehaviour.events('adhoc-scrollable-toolbar', gSpec.scrollable === true ? Objects.wrap(
                          SystemEvents.systemInit(),
                          EventHandler.nu({
                            run: function (component, simulatedEvent) {
                              if (EventRoot.isSource(component, simulatedEvent)) {
                                Css.set(component.element(), 'overflow-x', 'auto');
                                Scrollables.markAsHorizontal(component.element());
                                Scrollable.register(component.element());
                              }
                            }
                          })
                        ) : { })
                      ],

                      components: [
                        Container.sketch({
                          components: [
                            ToolbarGroup.parts().items()
                          ]
                        })
                      ],
                      markers: {
                        itemClass: Styles.resolve('toolbar-group-item')
                      },

                      members: {
                        item: {
                          munge: Fun.identity
                        }
                      },

                      parts: {
                        items: { }
                      },

                      items: gSpec.items
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
            classes: [ Styles.resolve('toolstrip') ]
          },
          components: [
            GuiFactory.premade(toolbar)
          ]
        })
      );

      var resetGroups = function () {
        Toolbar.setGroups(toolbar, initGroups.get());
        Toggling.off(toolbar);
      };


      var initGroups = Cell([ ]);

      var setGroups = function (gs) {
        initGroups.set(gs);
        resetGroups();
      };

      var createGroups = function (gs) {
        return Toolbar.createGroups(toolbar, gs);
      };

      var refresh = function () {
        Toolbar.refresh(toolbar);
      };

      var setContextToolbar = function (gs) {
        Toggling.on(toolbar);
        Toolbar.setGroups(toolbar, gs);
      };

      var restoreToolbar = function () {
        if (Toggling.isOn(toolbar)) {
          resetGroups();
        }
      };

      var focus = function () {
        Keying.focusIn(toolbar);
      };

      return {
        wrapper: Fun.constant(wrapper),
        toolbar: Fun.constant(toolbar),
        createGroups: createGroups,
        setGroups: setGroups,
        setContextToolbar: setContextToolbar,
        restoreToolbar: restoreToolbar,
        refresh: refresh,
        focus: focus
      };
    };

  }
);