import { ApproxStructure, Assertions, Keyboard, Keys, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Menu } from 'ephox/alloy/api/ui/Menu';
import * as MenuEvents from 'ephox/alloy/menu/util/MenuEvents';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import { MenuMovementSpec } from 'ephox/alloy/ui/types/MenuTypes';

describe('browser.ui.dropdown.MatrixMenuTest', () => {
  const assertSelectedStates = (label: string, expected: boolean[], menu: SugarElement<HTMLElement>) =>
    Assertions.assertStructure(
      label,
      ApproxStructure.build((s, _str, arr) => s.element('ol', {
        classes: [
          arr.has('test-menu')
        ],
        children: [
          s.element('div', {
            classes: [ arr.has('row-class') ],
            children: [
              s.element('li', { classes: [ (expected[0] ? arr.has : arr.not)('selected-item') ] }),
              s.element('li', { classes: [ (expected[1] ? arr.has : arr.not)('selected-item') ] })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('row-class') ],
            children: [
              s.element('li', { classes: [ (expected[2] ? arr.has : arr.not)('selected-item') ] }),
              s.element('li', { classes: [ (expected[3] ? arr.has : arr.not)('selected-item') ] })
            ]
          })
        ]
      })
      ), menu);

  const makeGuiHook = (movementSpec: MenuMovementSpec) => {
    return GuiSetup.bddSetup(
      (store, _doc, _body) => GuiFactory.build(
        Menu.sketch({
          value: 'test-menu-1',
          items: Arr.map([
            { type: 'item', data: { value: 'alpha', meta: { }}, hasSubmenu: false },
            { type: 'item', data: { value: 'beta', meta: { }}, hasSubmenu: false },
            { type: 'item', data: { value: 'gamma', meta: { }}, hasSubmenu: false },
            { type: 'item', data: { value: 'delta', meta: { }}, hasSubmenu: false }
          ], TestDropdownMenu.renderItem),
          dom: {
            tag: 'ol',
            classes: [ 'test-menu' ]
          },

          movement: movementSpec,

          components: [
            Menu.parts.items({
              preprocess: (items: AlloySpec[]) => {
                const chunks = Arr.chunk(items, 2);
                return Arr.map(chunks, (c) => ({
                  dom: {
                    tag: 'div',
                    classes: [ 'row-class' ]
                  },
                  components: c
                }));
              }
            })
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
      )
    );
  };
  context('No previous selector', () => {

    const hook = makeGuiHook({
      mode: 'matrix',
      rowSelector: '.row-class'
    });

    it('basic navigation', () => {

      const menuComponent = hook.component();
      const store = hook.store();

      // Find the alpha and beta list items
      const alphaItem = UiFinder.findIn(menuComponent.element, 'li[data-value="alpha"]').getOrDie();
      const betaItem = UiFinder.findIn(menuComponent.element, 'li[data-value="beta"]').getOrDie();

      store.assertEq('Before focusItem event', [ ]);

      AlloyTriggers.dispatch(menuComponent, alphaItem, SystemEvents.focusItem());
      // Focus item on alpha should select alpha (the first item)
      assertSelectedStates('After focusing on alpha', [ true, false, false, false ], menuComponent.element);
      store.assertEq('After focusItem event', [ 'menu.events.focus' ]);

      store.clear();
      // Focus item on beta should select beta (the second item)
      AlloyTriggers.dispatch(menuComponent, betaItem, SystemEvents.focusItem());
      assertSelectedStates('After focusing on beta', [ false, true, false, false ], menuComponent.element);
      store.assertEq('After focusItem event (on beta)', [ 'menu.events.focus' ]);

      store.clear();
      Keyboard.keydown(Keys.down(), { }, menuComponent.element);
      assertSelectedStates('After pressing down on beta to get to delta (goes down one row)', [ false, false, false, true ], menuComponent.element);
      store.assertEq('After pressing down on beta', [ 'menu.events.focus' ]);

      store.clear();
      Keyboard.keydown(Keys.left(), { }, menuComponent.element);
      assertSelectedStates('After pressing left on delta to get to gamma (goes back one column)', [ false, false, true, false ], menuComponent.element);
      store.assertEq('After pressing left on delta', [ 'menu.events.focus' ]);

      store.clear();
    });
  });
});
