import { ApproxStructure, Assertions, Chain, NamedChain, StructAssert, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Menu } from 'ephox/alloy/api/ui/Menu';
import * as MenuEvents from 'ephox/alloy/menu/util/MenuEvents';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';

UnitTest.asynctest('MenuTest', (success, failure) => {

  GuiSetup.setup((store, _doc, _body) => GuiFactory.build(
    Menu.sketch({
      value: 'test-menu-1',
      items: Arr.map([
        { type: 'item', data: { value: 'alpha', meta: { text: 'Alpha' }}, hasSubmenu: false },
        { type: 'item', data: { value: 'beta', meta: { text: 'Beta' }}, hasSubmenu: false }
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

      onHighlight: (_menuComp, itemComp) => {
        store.adder(
          `onHighlight: ${Representing.getValue(itemComp).value}`
        )();
      },

      onDehighlight: (_menuComp, itemComp) => {
        store.adder(
          `onDehighlight: ${Representing.getValue(itemComp).value}`
        )();
      },

      menuBehaviours: Behaviour.derive([
        AddEventsBehaviour.config('menu-test-behaviour', [
          AlloyEvents.run(MenuEvents.focus(), store.adder('menu.events.focus'))
        ])
      ])
    })
  ), (_doc, _body, _gui, component, store) => {
    // TODO: Flesh out test.
    const cAssertStructure = (label: string, expected: StructAssert) => Chain.op((element: SugarElement<HTMLOListElement>) => {
      Assertions.assertStructure(label, expected, element);
    });

    const cTriggerFocusItem = Chain.op((target: SugarElement<HTMLLIElement>) => {
      AlloyTriggers.dispatch(component, target, SystemEvents.focusItem());
    });

    const cAssertStore = (label: string, expected: string[]) => Chain.op(() => {
      store.assertEq(label, expected);
    });

    const cClearStore = Chain.op(() => {
      store.clear();
    });

    return [
      Chain.asStep({}, [
        NamedChain.asChain([
          NamedChain.writeValue('menu', component.element),
          NamedChain.direct('menu', UiFinder.cFindIn('li[data-value="alpha"]'), 'alpha'),
          NamedChain.direct('menu', UiFinder.cFindIn('li[data-value="beta"]'), 'beta'),

          NamedChain.read('menu', cAssertStore('Before focusItem event', [ ])),

          NamedChain.direct('alpha', cTriggerFocusItem, '_'),

          NamedChain.direct('menu', cAssertStructure('After focusing item on alpha', ApproxStructure.build((s, _str, arr) => s.element('ol', {
            classes: [
              arr.has('test-menu')
            ],
            children: [
              s.element('li', { classes: [ arr.has('selected-item') ] }),
              s.element('li', { classes: [ arr.not('selected-item') ] })
            ]
          }))), '_'),

          NamedChain.read('menu', cAssertStore('After focusItem event (alpha)', [
            'onHighlight: alpha',
            'menu.events.focus'
          ])),

          NamedChain.read('menu', cClearStore),
          NamedChain.direct('beta', cTriggerFocusItem, '_'),
          NamedChain.direct('menu', cAssertStructure('After focusing item on beta', ApproxStructure.build((s, _str, arr) => s.element('ol', {
            classes: [
              arr.has('test-menu')
            ],
            children: [
              s.element('li', { classes: [ arr.not('selected-item') ] }),
              s.element('li', { classes: [ arr.has('selected-item') ] })
            ]
          }))), '_'),

          // Beta is now highlighted, and Alpha is dehighlighted.
          NamedChain.read('menu', cAssertStore('After focusItem event (beta)', [
            'onDehighlight: alpha',
            'onHighlight: beta',
            'menu.events.focus',
          ])),
          NamedChain.read('menu', cClearStore)

        ])
      ])
    ];
  }, success, failure);
});
