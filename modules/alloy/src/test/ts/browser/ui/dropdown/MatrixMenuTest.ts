import { ApproxStructure, Assertions, Keyboard, Keys, TestStore, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
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
  const selectedClass = 'selected-item';

  const assertSelectedStates = (label: string, expectedPos: number, menu: SugarElement<HTMLElement>) =>
    Assertions.assertStructure(
      label,
      ApproxStructure.build(
        (s, _str, arr) => {
          const classcheck = (index: number) =>
            index === expectedPos ?
              arr.has(selectedClass) :
              arr.not(selectedClass);

          return s.element('ol', {
            classes: [
              arr.has('test-menu')
            ],
            children: [
              s.element('div', {
                classes: [ arr.has('row-class') ],
                children: [
                  s.element('li', { classes: [ classcheck(0) ] }),
                  s.element('li', { classes: [ classcheck(1) ] })
                ]
              }),
              s.element('div', {
                classes: [ arr.has('row-class') ],
                children: [
                  s.element('li', { classes: [ classcheck(2) ] }),
                  s.element('li', { classes: [ classcheck(3) ] })
                ]
              })
            ]
          });
        }
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

  const assertInitialFocusIsOnElement = (store: TestStore<string>, menuComponent: AlloyComponent, position: number, message: string) => {
    AlloyTriggers.dispatch(menuComponent, menuComponent.element, SystemEvents.focus());
    assertFocusIsOnItem(menuComponent, position, message);
    store.assertEq('After focusItem event', [ 'menu.events.focus' ]);
    store.clear();
  };

  const assertFocusIsOnItem = (menuComponent: AlloyComponent, position: number, message: string) =>
    assertSelectedStates(message, position, menuComponent.element);

  const setFocusOnItem = (store: TestStore<string>, menuComponent: AlloyComponent, element: SugarElement<Element>, position: number, message: string) => {
    AlloyTriggers.dispatch(menuComponent, element, SystemEvents.focusItem());
    // Focus item on alpha should select alpha (the first item)
    assertFocusIsOnItem(menuComponent, position, message);
    store.assertEq('After focusItem event', [ 'menu.events.focus' ]);
    store.clear();
  };

  const keyboardNavigationMovement = (store: TestStore<string>, menuComponent: AlloyComponent, key: number, position: number, message: string) => {
    Keyboard.keydown(key, { }, menuComponent.element);
    assertFocusIsOnItem(menuComponent, position, message);
    store.assertEq('After pressing key', [ 'menu.events.focus' ]);
    store.clear();
  };

  context('No previous selector', () => {
    const hook = makeGuiHook({
      mode: 'matrix',
      rowSelector: '.row-class'
    });

    it('TINY-9283: Basic Focusing', () => {
      const menuComponent = hook.component();
      const store = hook.store();

      // Find the alpha and beta list items
      const alphaItem = UiFinder.findIn(menuComponent.element, 'li[data-value="alpha"]').getOrDie();
      const betaItem = UiFinder.findIn(menuComponent.element, 'li[data-value="beta"]').getOrDie();

      store.assertEq('Before focusItem event', [ ]);
      assertInitialFocusIsOnElement(store, menuComponent, 0, 'Focus should be on alpha');

      setFocusOnItem(store, menuComponent, alphaItem, 0, 'After focusing on alpha');
      setFocusOnItem(store, menuComponent, betaItem, 1, 'After focusing on beta');
    });

    it('TINY-9283: Keyboard navigation', () => {
      const menuComponent = hook.component();
      const store = hook.store();

      store.assertEq('Before focusItem event', [ ]);
      assertInitialFocusIsOnElement(store, menuComponent, 0, 'Focus should be on alpha');

      keyboardNavigationMovement(store, menuComponent, Keys.right(), 1, 'Press right to go from alpha to beta ( column movement )');
      keyboardNavigationMovement(store, menuComponent, Keys.down(), 3, 'Press down to move from beta to delta ( row movement )');
      keyboardNavigationMovement(store, menuComponent, Keys.left(), 2, 'Press left to go from delta to gamma ( column movement )');
      keyboardNavigationMovement(store, menuComponent, Keys.up(), 0, 'Press up to move from gamma to alpha ( row movement )');
    });
  });

  context('Previous selector', () => {
    const hook = makeGuiHook({
      mode: 'matrix',
      rowSelector: '.row-class',
      previousSelector: (component) => Optional.some(UiFinder.findIn<HTMLElement>(component.element, 'li[data-value="beta"]').getOrDie())
    });

    it('TINY-9283: Position starts as expected', () => {
      const menuComponent = hook.component();
      const store = hook.store();
      assertInitialFocusIsOnElement(store, menuComponent, 1, 'Focus should be on beta');
    });
  });
});
