asynctest(
  'MenuTest',

  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.NamedChain',
    'ephox.agar.api.UiFinder',
    'ephox.alloy.api.behaviour.AddEventsBehaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.menu.util.MenuEvents',
    'ephox.alloy.test.dropdown.TestDropdownMenu',
    'ephox.alloy.test.GuiSetup',
    'ephox.katamari.api.Arr'
  ],

  function (
    ApproxStructure, Assertions, Chain, NamedChain, UiFinder, AddEventsBehaviour, Behaviour, GuiFactory, AlloyEvents, AlloyTriggers, SystemEvents, Menu, MenuEvents,
    TestDropdownMenu, GuiSetup, Arr
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        Menu.sketch({
          value: 'test-menu-1',
          items: Arr.map([
            { type: 'item', data: { value: 'alpha', text: 'Alpha' } },
            { type: 'item', data: { value: 'beta', text: 'Beta' } }
          ], TestDropdownMenu.renderItem),
          dom: {
            tag: 'ol',
            classes: [ 'test-menu' ]
          },
          components: [
            Menu.parts().items({ })
          ],

          markers: {
            item: TestDropdownMenu.markers().item,
            selectedItem: TestDropdownMenu.markers().selectedItem
          },

          menuBehaviours: Behaviour.derive([
            AddEventsBehaviour.config('menu-test-behaviour', [
              AlloyEvents.run(MenuEvents.focus(), store.adder('menu.events.focus'))
            ])
          ])
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
        Chain.asStep({}, [
          NamedChain.asChain([
            NamedChain.writeValue('menu', component.element()),
            NamedChain.direct('menu', UiFinder.cFindIn('li[data-value="alpha"]'), 'alpha'),
            NamedChain.direct('menu', UiFinder.cFindIn('li[data-value="beta"]'), 'beta'),

            cAssertStore('Before focusItem event', [ ]),

            NamedChain.direct('alpha', cTriggerFocusItem, '_'),

            NamedChain.direct('menu', cAssertStructure('After focusing item on alpha', ApproxStructure.build(function (s, str, arr) {
              return s.element('ol', {
                classes: [
                  arr.has('test-menu')
                ],
                children: [
                  s.element('li', { classes: [ arr.has('selected-item') ] }),
                  s.element('li', { classes: [ arr.not('selected-item') ] })
                ]
              });
            })), '_'),

            cAssertStore('After focusItem event (alpha)', [ 'menu.events.focus' ]),

            cClearStore,
            NamedChain.direct('beta', cTriggerFocusItem, '_'),
            NamedChain.direct('menu', cAssertStructure('After focusing item on beta', ApproxStructure.build(function (s, str, arr) {
              return s.element('ol', {
                classes: [
                  arr.has('test-menu')
                ],
                children: [
                  s.element('li', { classes: [ arr.not('selected-item') ] }),
                  s.element('li', { classes: [ arr.has('selected-item') ] })
                ]
              });
            })), '_'),
            cAssertStore('After focusItem event (beta)', [ 'menu.events.focus' ]),
            cClearStore

          ])
        ])
      ];
    }, function () { success(); }, failure);

  }
);