asynctest(
  'TieredMenuTest',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.behaviour.AddEventsBehaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.menu.util.MenuEvents',
    'ephox.alloy.test.dropdown.TestDropdownMenu',
    'ephox.alloy.test.GuiSetup',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj'
  ],

  function (
    Assertions, Chain, Keyboard, Keys, Step, AddEventsBehaviour, Behaviour, Keying, GuiFactory, AlloyEvents, AlloyTriggers, SystemEvents, Menu, TieredMenu, MenuEvents,
    TestDropdownMenu, GuiSetup, Objects, Arr, Obj
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        TieredMenu.sketch({
          uid: 'uid-test-menu-1',
          dom: {
            tag: 'div',
            classes: [ 'test-menu' ]
          },
          components: [
            Menu.parts().items({ })
          ],

          markers: TestDropdownMenu.markers(),

          data: {
            primary: 'menu-a',
            menus: Obj.map({
              'menu-a': {
                value: 'menu-a',
                items: Arr.map([
                  { type: 'item', data: { value: 'a-alpha', text: 'a-Alpha' }},
                  { type: 'item', data: { value: 'a-beta', text: 'a-Beta' }},
                  { type: 'item', data: { value: 'a-gamma', text: 'a-Gamma' }}
                ], TestDropdownMenu.renderItem)
              },
              'menu-b': {
                value: 'menu-b',
                items: Arr.map([
                  { type: 'item', data: { value: 'b-alpha', text: 'b-Alpha' } }
                ], TestDropdownMenu.renderItem)
              }
            }, TestDropdownMenu.renderMenu),
            expansions: {
              'a-beta': 'menu-b'
            }
          },

          tmenuBehaviours: Behaviour.derive([
            AddEventsBehaviour.config('tiered-menu-test', [
              AlloyEvents.run(MenuEvents.focus(), store.adder('menu.events.focus'))
            ])
          ]),

          eventOrder: Objects.wrapAll([
            {
              key: MenuEvents.focus(),
              value: [ 'alloy.base.behaviour', 'tiered-menu-test' ]
            }
          ]),

          onExecute: store.adderH('onExecute'),
          onEscape: store.adderH('onEscape'),
          onOpenMenu: store.adderH('onOpenMenu'),
          onOpenSubmenu: store.adderH('onOpenSubmenu')
        })
      );
    }, function (doc, body, gui, component, store) {
      // TODO: Flesh out test.
      var cAssertStructure = function (label, expected) {
        return Chain.op(function (element) {
          Assertions.assertStructure(label, expected, element);
        });
      };

      var cTriggerFocusItem = Chain.op(function (target) {
        AlloyTriggers.dispatch(component, target, SystemEvents.focusItem());
      });

      var cAssertStore = function (label, expected) {
        return Chain.op(function () {
          store.assertEq(label, expected);
        });
      };

      var cClearStore = Chain.op(function () {
        store.clear();
      });

      return [
        Step.sync(function () {
          Keying.focusIn(component);
        }),
        store.sAssertEq('Focus is fired as soon as the tiered menu is active', [
          'menu.events.focus',
          'onOpenMenu'
        ]),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        Keyboard.sKeydown(doc, Keys.right(), { })

        // TODO: Beef up tests
      ];
    }, function () { success(); }, failure);

  }
);