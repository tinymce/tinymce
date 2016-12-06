asynctest(
  'ExecutingKeyingTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.NamedChain',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.menu.util.ItemEvents',
    'ephox.alloy.menu.util.MenuEvents',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.ui.TieredMenuSpec',
    'ephox.boulder.api.Objects'
  ],
 
  function (ApproxStructure, Assertions, Chain, Keyboard, Keys, NamedChain, Step, UiFinder, GuiFactory, SystemEvents, Keying, EventHandler, ItemEvents, MenuEvents, GuiSetup, TieredMenuSpec, Objects) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        TieredMenuSpec({
          uid: 'uid-test-menu-1',
          uiType: 'custom',
          value: 'test-menu-1',
          items: [
            { type: 'item', data: { value: 'alpha', text: 'Alpha' } },
            { type: 'item', data: { value: 'beta', text: 'Beta' } }
          ],
          dom: {
            tag: 'div',
            classes: [ 'test-menu' ]
          },
          components: [
            { uiType: 'placeholder', name: '<alloy.menu.items>', owner: 'menu' }
          ],

          markers: {
            item: 'test-item',
            selectedItem: 'test-selected-item',
            menu: 'test-menu',
            selectedMenu: 'test-selected-menu',
            backgroundMenu: 'test-background-menu'
          },
          members: { 
            item: {
              munge: function (itemSpec) {
                return {
                  dom: {
                    tag: 'div',
                    attributes: {
                      'data-value': itemSpec.data.value
                    },
                    classes: [ 'test-item' ],
                    innerHtml: itemSpec.data.text
                  },
                  components: [ ]
                };              
              }
            },
            menu: {
              munge: function (menuSpec) {
                return {
                  dom: {
                    tag: 'div',
                    attributes: {
                      'data-value': menuSpec.value
                    }
                  },
                  components: [ ],
                  shell: true
                };
              }
            }
          },

          data: {
            primary: 'menu-a',
            menus: {
              'menu-a': {
                value: 'menu-a',
                items: [
                  { type: 'item', data: { value: 'a-alpha', text: 'a-Alpha' }},
                  { type: 'item', data: { value: 'a-beta', text: 'a-Beta' }},
                  { type: 'item', data: { value: 'a-gamma', text: 'a-Gamma' }}
                ]
              },
              'menu-b': {
                value: 'menu-b',
                items: [
                  { type: 'item', data: { value: 'b-alpha', text: 'b-Alpha' } }
                ]
              }
            },
            expansions: {
              'a-beta': 'menu-b'
            }
          },

          events: Objects.wrap(
            MenuEvents.focus(),
            EventHandler.nu({
              run: store.adder('menu.events.focus')
            })
          ),

          onExecute: store.adderH('onExecute'),
          onEscape: store.adderH('onEscape'),
          onOpenMenu: store.adderH('onOpenMenu'),
          onOpenSubmenu: store.adderH('onOpenSubmenu')
        })
      );

    }, function (doc, body, gui, component, store) {
      // FIX: Flesh out test.
      var cAssertStructure = function (label, expected) {
        return Chain.op(function (element) {
          Assertions.assertStructure(label, expected, element);
        });
      };

      var cTriggerFocusItem = Chain.op(function (target) {
        component.getSystem().triggerEvent(SystemEvents.focusItem(), target, { });
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
        Keyboard.sKeydown(doc, Keys.down(), { }),
        Keyboard.sKeydown(doc, Keys.right(), { }),
        Step.fail('Tiered Menu spec fail')
      ];
    }, function () { success(); }, failure);

  }
);