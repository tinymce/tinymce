import { ApproxStructure, Assertions, StructAssert, TestStore, UiFinder } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Toggling } from 'ephox/alloy/api/behaviour/Toggling';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Menu } from 'ephox/alloy/api/ui/Menu';
import * as MenuEvents from 'ephox/alloy/menu/util/MenuEvents';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';

describe('MenuRadioTest', () => {
  const togglingConfig = (store: TestStore, name: string) => ({
    toggleClass: 'checked',
    toggleOnExecute: false,
    selected: false,
    exclusive: true,
    onToggled: store.adder(name)
  });

  const hook = GuiSetup.bddSetup((store, _doc, _body) => GuiFactory.build(
    Menu.sketch({
      value: 'test-menu-1',
      items: Arr.map([
        { type: 'item', data: { value: 'alpha', meta: { text: 'Alpha' }}, hasSubmenu: false, toggling: togglingConfig(store, 'alpha') },
        { type: 'item', data: { value: 'beta', meta: { text: 'Beta' }}, hasSubmenu: false, toggling: togglingConfig(store, 'beta') }
      ], TestDropdownMenu.renderItem),
      dom: {
        tag: 'ol',
        classes: [ 'test-menu' ]
      },
      components: [
        Menu.parts.items({ })
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
  ));

  beforeEach(() => {
    hook.store().clear();
  });

  const triggerFocusItem = (target: SugarElement<HTMLLIElement>) => {
    AlloyTriggers.dispatch(hook.component(), target, SystemEvents.focusItem());
  };

  const itemStructure = (expected: { focused: boolean; checked: boolean }): ApproxStructure.Builder<StructAssert> => (s, str, arr) =>
    s.element('li', {
      classes: [
        expected.focused ? arr.has('selected-item') : arr.not('selected-item'),
        expected.checked ? arr.has('checked') : arr.not('checked'),
      ],
      attrs: {
        'aria-checked': str.is(String(expected.checked)),
        'role': str.is('menuitemradio')
      }
    });

  it('TINY-8602: Focus first menu item and check structure', () => {
    const component = hook.component();
    const store = hook.store();
    const alpha = UiFinder.findIn<HTMLLIElement>(component.element, 'li[data-value="alpha"]').getOrDie();

    store.assertEq('Before focusItem event', []);

    triggerFocusItem(alpha);
    Assertions.assertStructure(
      'After focusing item on alpha',
      ApproxStructure.build((s, str, arr) => s.element('ol', {
        classes: [
          arr.has('test-menu')
        ],
        children: [
          itemStructure({ focused: true, checked: false })(s, str, arr),
          itemStructure({ focused: false, checked: false })(s, str, arr)
        ]
      })),
      component.element
    );

    store.assertEq('After focusItem event (alpha)', [ 'menu.events.focus' ]);
  });

  it('TINY-8602: Focus second menu item and check structure', () => {
    const component = hook.component();
    const store = hook.store();
    const beta = UiFinder.findIn<HTMLLIElement>(component.element, 'li[data-value="beta"]').getOrDie();

    triggerFocusItem(beta);
    Assertions.assertStructure(
      'After focusing item on beta',
      ApproxStructure.build((s, str, arr) => s.element('ol', {
        classes: [
          arr.has('test-menu')
        ],
        children: [
          itemStructure({ focused: false, checked: false })(s, str, arr),
          itemStructure({ focused: true, checked: false })(s, str, arr)
        ]
      })),
      component.element
    );

    store.assertEq('After focusItem event (beta)', [ 'menu.events.focus' ]);
  });

  it('TINY-8602: Toggling between the 2 items ensures only one item is toggled', () => {
    const component = hook.component();
    const store = hook.store();
    const [ alphaComp, betaComp ] = component.components();
    triggerFocusItem(alphaComp.element);

    store.assertEq('Before toggled event', [ 'menu.events.focus' ]);

    Toggling.on(alphaComp);
    Assertions.assertStructure(
      'After toggling alpha item',
      ApproxStructure.build((s, str, arr) => s.element('ol', {
        classes: [
          arr.has('test-menu')
        ],
        children: [
          itemStructure({ focused: true, checked: true })(s, str, arr),
          itemStructure({ focused: false, checked: false })(s, str, arr)
        ]
      })),
      component.element
    );

    store.assertEq('After first toggled event', [ 'menu.events.focus', 'alpha' ]);

    Toggling.on(betaComp);
    Assertions.assertStructure(
      'After toggling beta item',
      ApproxStructure.build((s, str, arr) => s.element('ol', {
        classes: [
          arr.has('test-menu')
        ],
        children: [
          itemStructure({ focused: true, checked: false })(s, str, arr),
          itemStructure({ focused: false, checked: true })(s, str, arr)
        ]
      })),
      component.element
    );

    // Note: Alpha is listed twice as it should have been toggled off when beta was toggled
    store.assertEq('After second toggled event', [ 'menu.events.focus', 'alpha', 'beta', 'alpha' ]);
  });
});
