define(
  'tinymce.themes.mobile.toolbar.ScrollingToolbar',

  [
    'ephox.alloy.api.behaviour.AddEventsBehaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.properties.Css',
    'tinymce.themes.mobile.ios.scroll.Scrollables',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.touch.scroll.Scrollable',
    'tinymce.themes.mobile.util.UiDomFactory'
  ],

  function (
    AddEventsBehaviour, Behaviour, Keying, Toggling, GuiFactory, AlloyEvents, Container, Toolbar, ToolbarGroup, Arr, Cell, Fun, Css, Scrollables, Styles, Scrollable,
    UiDomFactory
  ) {
    return function () {
      var makeGroup = function (gSpec) {
        var scrollClass = gSpec.scrollable === true ? '${prefix}-toolbar-scrollable-group' : '';
        return {
          dom: UiDomFactory.dom('<div aria-label="' + gSpec.label + '" class="${prefix}-toolbar-group ' + scrollClass + '"></div>'),

          tgroupBehaviours: Behaviour.derive([
            AddEventsBehaviour.config('adhoc-scrollable-toolbar', gSpec.scrollable === true ? [
              AlloyEvents.runOnInit(function (component, simulatedEvent) {
                Css.set(component.element(), 'overflow-x', 'auto');
                Scrollables.markAsHorizontal(component.element());
                Scrollable.register(component.element());
              })
            ] : [ ])
          ]),

          components: [
            Container.sketch({
              components: [
                ToolbarGroup.parts().items({ })
              ]
            })
          ],
          markers: {
            itemClass: Styles.resolve('toolbar-group-item')
          },

          items: gSpec.items
        };
      };

      var toolbar = GuiFactory.build(
        Toolbar.sketch(
          {
            dom: UiDomFactory.dom('<div class="${prefix}-toolbar"></div>'),
            components: [
              Toolbar.parts().groups({ })
            ],
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
            shell: true
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
          ],
          containerBehaviours: Behaviour.derive([
            Toggling.config({
              toggleClass: Styles.resolve('android-selection-context-toolbar'),
              toggleOnExecute: false
            })
          ])
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
        return Arr.map(gs, Fun.compose(ToolbarGroup.sketch, makeGroup));
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