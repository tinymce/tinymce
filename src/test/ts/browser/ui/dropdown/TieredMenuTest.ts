import { Assertions, Chain, Keyboard, Keys, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Objects } from '@ephox/boulder';
import { Arr, Obj } from '@ephox/katamari';
import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import { Menu } from 'ephox/alloy/api/ui/Menu';
import { TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import * as MenuEvents from 'ephox/alloy/menu/util/MenuEvents';
import TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('TieredMenuTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

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
    const cAssertStructure = function (label, expected) {
      return Chain.op(function (element) {
        Assertions.assertStructure(label, expected, element);
      });
    };

    const cTriggerFocusItem = Chain.op(function (target) {
      AlloyTriggers.dispatch(component, target, SystemEvents.focusItem());
    });

    const cAssertStore = function (label, expected) {
      return Chain.op(function () {
        store.assertEq(label, expected);
      });
    };

    const cClearStore = Chain.op(function () {
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
});
