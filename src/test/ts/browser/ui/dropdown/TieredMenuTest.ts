
import { Assertions, Chain, Keyboard, Keys, Step, ApproxStructure, Mouse } from '@ephox/agar';
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
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import * as MenuEvents from 'ephox/alloy/menu/util/MenuEvents';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Element } from '@ephox/sugar';

UnitTest.asynctest('TieredMenuTest', (success, failure) => {

  GuiSetup.setup((store, doc, body) => {
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
  }, (doc, body, gui, component, store) => {
    // TODO: Flesh out test.
    const cAssertStructure = (label, expected) => {
      return Chain.op((element: Element) => {
        Assertions.assertStructure(label, expected, element);
      });
    };

    const cTriggerFocusItem = Chain.op((target: Element) => {
      AlloyTriggers.dispatch(component, target, SystemEvents.focusItem());
    });

    const cAssertStore = (label, expected) => {
      return Chain.op(() => {
        store.assertEq(label, expected);
      });
    };

    const cClearStore = Chain.op(() => {
      store.clear();
    });

    const structureMenu = (selected, itemSelections) => (s, str, arr) => {
      return s.element('ol', {
        classes: [ arr.has('menu'), (selected ? arr.has : arr.not)('selected-menu') ],
        children: Arr.map(itemSelections, (sel) => s.element('li', {
          classes: [ arr.has('item'), (sel ? arr.has : arr.not)('selected-item') ]
        }))
      })
    }

    const sAssertMenu = (label, structureMenus) => {
      return Assertions.sAssertStructure(
        label,
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            classes: [ arr.has('test-menu') ],
            children: Arr.map(structureMenus, (sm) => sm(s, str, arr))
          })
        }),
        component.element()
      );
    };

    return [
      Assertions.sAssertStructure(
        'Original structure test',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            classes: [ arr.has('test-menu') ],
            children: [
              structureMenu(true, [ true, false, false ])(s, str, arr)
            ]
          })
        }),
        component.element()
      ),


      Step.sync(() => {
        Keying.focusIn(component);
      }),
      store.sAssertEq('Focus is fired as soon as the tiered menu is active', [
        'onOpenMenu',
        'menu.events.focus',
      ]),
      Keyboard.sKeydown(doc, Keys.down(), { }),
      Keyboard.sKeydown(doc, Keys.right(), { }),

      sAssertMenu(
        'Post expansion of submenu with <right> structure test',
        [
          structureMenu(false, [ false, true, false ]),
          structureMenu(true, [ true ])
        ]
      ),

      Keyboard.sKeydown(doc, Keys.left(), { }),
      sAssertMenu(
        'Post collapse of submenu with <left> structure test',
        [
          structureMenu(true, [ false, true, false ])
        ]
      ),
      Keyboard.sKeydown(doc, Keys.enter(), { }),
      sAssertMenu(
        'Post exansion of submenu with <enter> structure test',
        [
          structureMenu(false, [ false, true, false ]),
          structureMenu(true, [ true ])
        ]
      ),

      Keyboard.sKeydown(doc, Keys.escape(), { }),
      sAssertMenu(
        'Post collapse of submenu with <escape> structure test',
        [
          structureMenu(true, [ false, true, false ])
        ]
      ),

      Mouse.sHoverOn(component.element(), 'li:contains("a-Beta")'),
      sAssertMenu(
        'Post hover on item with submenu structure test',
        [
          structureMenu(true, [ false, true, false ]),
          structureMenu(false, [ false ])
        ]
      ),

      Keyboard.sKeydown(doc, Keys.right(), { }),
      sAssertMenu(
        'Post right on item with expanded submenu structure test',
        [
          structureMenu(false, [ false, true, false ]),
          structureMenu(true, [ true ])
        ]
      )
      // TODO: Beef up tests
    ];
  }, () => { success(); }, failure);
});
