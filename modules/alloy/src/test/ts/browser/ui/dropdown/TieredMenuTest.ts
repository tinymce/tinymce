import { ApproxStructure, Assertions, Keyboard, Keys, Mouse, Step, StructAssert } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Objects } from '@ephox/boulder';
import { Arr, Obj } from '@ephox/katamari';
import { Class } from '@ephox/sugar';

import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Menu } from 'ephox/alloy/api/ui/Menu';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import * as MenuEvents from 'ephox/alloy/menu/util/MenuEvents';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';

UnitTest.asynctest('TieredMenuTest', (success, failure) => {

  const tmenuClass = 'tiered-menu-decoration';

  GuiSetup.setup((store, _doc, _body) => GuiFactory.build(
    TieredMenu.sketch({
      uid: 'uid-test-menu-1',
      dom: {
        tag: 'div',
        classes: [ 'test-menu', tmenuClass ]
      },
      components: [
        Menu.parts.items({ })
      ],

      markers: TestDropdownMenu.markers(),

      data: {
        primary: 'menu-a',
        menus: Obj.map({
          'menu-a': {
            value: 'menu-a',
            items: Arr.map([
              { type: 'item', data: { value: 'a-alpha', meta: { text: 'a-Alpha' }}, hasSubmenu: false },
              { type: 'item', data: { value: 'a-beta', meta: { text: 'a-Beta' }}, hasSubmenu: true },
              { type: 'item', data: { value: 'a-gamma', meta: { text: 'a-Gamma', disabled: true }}, hasSubmenu: true }
            ], TestDropdownMenu.renderItem)
          },
          'a-beta': { // menu name should be triggering parent item so TieredMenuSpec path works
            value: 'menu-b',
            items: Arr.map([
              { type: 'item', data: { value: 'b-alpha', meta: { text: 'b-Alpha' }}, hasSubmenu: false },
            ], TestDropdownMenu.renderItem)
          },
          'a-gamma': {
            value: 'menu-c',
            items: Arr.map([
              { type: 'item', data: { value: 'c-alpha', meta: { text: 'c-Alpha' }}, hasSubmenu: false },
            ], TestDropdownMenu.renderItem)
          }
        }, TestDropdownMenu.renderMenu),
        expansions: {
          'a-beta': 'a-beta',
          'a-gamma': 'a-gamma',
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
      onOpenSubmenu: store.adderH('onOpenSubmenu'),
      onRepositionMenu: store.adderH('onRepositionMenu'),

      onHighlightItem: (tmenuComp, menuComp, itemComp) => {
        // Make assertions about the arguments passed in here. To get the most
        // useful feedback, we'll add errors to store.
        if (!Class.has(tmenuComp.element, tmenuClass)) {
          store.adder('ERROR. First argument to onHighlightItem was not the tmenu')();
        }
        if (!Class.has(menuComp.element, TestDropdownMenu.markers().menu)) {
          store.adder('ERROR. Second argument to onHighlightItem was not the menu')();
        }
        store.adder(
          `onHighlightItem: ${Representing.getValue(itemComp).value}`
        )();
      },
      onDehighlightItem: (tmenuComp, menuComp, itemComp) => {
        // Make assertions about the arguments passed in here. To get the most
        // useful feedback, we'll add errors to store.
        if (!Class.has(tmenuComp.element, tmenuClass)) {
          store.adder('ERROR. First argument to onDehighlightItem was not the tmenu')();
        }
        if (!Class.has(menuComp.element, TestDropdownMenu.markers().menu)) {
          store.adder('ERROR. Second argument to onDehighlightItem was not the menu')();
        }
        store.adder(
          `onDehighlightItem: ${Representing.getValue(itemComp).value}`
        )();
      },
    })
  ), (doc, _body, _gui, component, store) => {
    const structureMenu = (selected: boolean, itemSelections: boolean[], hasPopups: boolean[], isExpandeds: boolean[], disabled: boolean[]) => (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi) => s.element('ol', {
      classes: [ arr.has('menu'), (selected ? arr.has : arr.not)('selected-menu') ],
      children: Arr.map(itemSelections, (sel, i) => s.element('li', {
        classes: [ arr.has('item'), (sel ? arr.has : arr.not)('selected-item') ],
        attrs: {
          'aria-haspopup': str.is(hasPopups[i].toString()),
          ...hasPopups[i]
            ? { 'aria-expanded': str.is(isExpandeds[i].toString()) }
            : { 'aria-expanded': str.none('aria-expanded should not exist') },
          'aria-disabled': str.is(disabled[i].toString()),
        }
      }))
    });

    const sAssertMenu = (label: string, structureMenus: Array<ApproxStructure.Builder<StructAssert>>) => Assertions.sAssertStructure(
      label,
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('test-menu') ],
        children: Arr.map(structureMenus, (sm) => sm(s, str, arr))
      })),
      component.element
    );

    return [
      Assertions.sAssertStructure(
        'Original structure test',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          classes: [ arr.has('test-menu') ],
          children: [
            structureMenu(true, [ true, false, false ], [ false, true, true ], [ false, false, false ], [ false, false, true ])(s, str, arr)
          ]
        })),
        component.element
      ),

      Step.sync(() => {
        Keying.focusIn(component);
      }),
      store.sAssertEq('Focus is fired as soon as the tiered menu is active', [
        'onOpenMenu',
        'onHighlightItem: a-alpha',
        'menu.events.focus'
      ]),

      store.sClear,
      Keyboard.sKeydown(doc, Keys.down(), { }),
      Keyboard.sKeydown(doc, Keys.right(), { }),

      store.sAssertEq('Check events after navigation', [
        'onDehighlightItem: a-alpha',
        'onHighlightItem: a-beta',
        'menu.events.focus',
        'onOpenSubmenu',
        'onHighlightItem: b-alpha',
        'menu.events.focus'
      ]),

      sAssertMenu(
        'Post expansion of submenu with <right> structure test',
        [
          structureMenu(false, [ false, true, false ], [ false, true, true ], [ false, true, false ], [ false, false, true ]),
          structureMenu(true, [ true ], [ false ], [ false ], [ false ])
        ]
      ),

      Keyboard.sKeydown(doc, Keys.left(), { }),
      sAssertMenu(
        'Post collapse of submenu with <left> structure test',
        [
          structureMenu(true, [ false, true, false ], [ false, true, true ], [ false, false, false ], [ false, false, true ])
        ]
      ),
      Keyboard.sKeydown(doc, Keys.enter(), { }),
      sAssertMenu(
        'Post exansion of submenu with <enter> structure test',
        [
          structureMenu(false, [ false, true, false ], [ false, true, true ], [ false, true, false ], [ false, false, true ]),
          structureMenu(true, [ true ], [ false ], [ false ], [ false ])
        ]
      ),

      Keyboard.sKeyup(doc, Keys.escape(), { }),
      sAssertMenu(
        'Post collapse of submenu with <escape> structure test',
        [
          structureMenu(true, [ false, true, false ], [ false, true, true ], [ false, false, false ], [ false, false, true ])
        ]
      ),

      Mouse.sHoverOn(component.element, 'li:contains("a-Beta")'),
      sAssertMenu(
        'Post hover on item with submenu structure test',
        [
          structureMenu(true, [ false, true, false ], [ false, true, true ], [ false, true, false ], [ false, false, true ]),
          structureMenu(false, [ false ], [ false ], [ false ], [ false ])
        ]
      ),

      Keyboard.sKeydown(doc, Keys.right(), { }),
      sAssertMenu(
        'Post right on item with expanded submenu structure test',
        [
          structureMenu(false, [ false, true, false ], [ false, true, true ], [ false, true, false ], [ false, false, true ]),
          structureMenu(true, [ true ], [ false ], [ false ], [ false ])
        ]
      ),

      Mouse.sHoverOn(component.element, 'li:contains("a-Gamma")'),
      sAssertMenu(
        'Post hover on disabled item with submenu structure test',
        [
          structureMenu(true, [ false, false, true ], [ false, true, true ], [ false, false, false ], [ false, false, true ]),
        ]
      ),
      // TODO: Beef up tests
    ];
  }, success, failure);
});
