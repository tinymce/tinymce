import { ApproxStructure, Assertions, Chain, NamedChain, UiFinder, Keyboard, Keys } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr } from '@ephox/katamari';
import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import { Menu } from 'ephox/alloy/api/ui/Menu';
import * as MenuEvents from 'ephox/alloy/menu/util/MenuEvents';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Element } from '@ephox/sugar';

UnitTest.asynctest('MatrixMenuTest', (success, failure) => {

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Menu.sketch({
        value: 'test-menu-1',
        items: Arr.map([
          { type: 'item', data: { value: 'alpha', meta: { } }, hasSubmenu: false },
          { type: 'item', data: { value: 'beta', meta: { } }, hasSubmenu: false },
          { type: 'item', data: { value: 'gamma', meta: { } }, hasSubmenu: false },
          { type: 'item', data: { value: 'delta', meta: { } }, hasSubmenu: false }
        ], TestDropdownMenu.renderItem),
        dom: {
          tag: 'ol',
          classes: [ 'test-menu' ]
        },

        movement: {
          mode: 'matrix',

          rowSelector: '.row-class'
        },

        components: [
          Menu.parts().items({
            preprocess: (items) => {
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

    const cAssertSelectedStates = (label, expected) => {
      return NamedChain.direct('menu', cAssertStructure(label, ApproxStructure.build((s, str, arr) => {
        return s.element('ol', {
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
        });
      })), '_');
    };

    return [
      Chain.asStep({}, [
        NamedChain.asChain([
          NamedChain.writeValue('menu', component.element()),
          NamedChain.direct('menu', UiFinder.cFindIn('li[data-value="alpha"]'), 'alpha'),
          NamedChain.direct('menu', UiFinder.cFindIn('li[data-value="beta"]'), 'beta'),

          store.cAssertEq('Before focusItem event', [ ]),

          NamedChain.direct('alpha', cTriggerFocusItem, '_'),

          cAssertSelectedStates('After focusing item on alpha', [ true, false, false, false ]),

          store.cAssertEq('After focusItem event (alpha)', [ 'menu.events.focus' ]),

          store.cClear,
          NamedChain.direct('beta', cTriggerFocusItem, '_'),
          cAssertSelectedStates('After focusing item on beta', [ false, true, false, false ]),
          store.cAssertEq('After focusItem event (beta)', [ 'menu.events.focus' ]),
          store.cClear,

          NamedChain.direct('menu', Chain.op((menu) => {
            Keyboard.keydown(Keys.down(), { }, menu);
          }), '_'),

          cAssertSelectedStates('After pressing down on menu (with beta focus)', [ false, false, false, true ]),
          store.cAssertEq('After pressing down on beta', [ 'menu.events.focus' ]),
          store.cClear,

          NamedChain.direct('menu', Chain.op((menu) => {
            Keyboard.keydown(Keys.left(), { }, menu);
          }), '_'),

          cAssertSelectedStates('After pressing left on menu (with delta focus)', [ false, false, true, false ]),
          store.cAssertEq('After pressing left on delta', [ 'menu.events.focus' ]),
          store.cClear

        ])
      ])
    ];
  }, () => { success(); }, failure);
});
