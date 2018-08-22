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
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Element } from '@ephox/sugar';

UnitTest.asynctest('MatrixMenuTest', (success, failure) => {

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Menu.sketch({
        value: 'test-menu-1',
        items: Arr.map([
          { type: 'item', data: { value: 'alpha', text: 'Alpha' } },
          { type: 'item', data: { value: 'beta', text: 'Beta' } },
          { type: 'item', data: { value: 'gamma', text: 'Gamma' } },
          { type: 'item', data: { value: 'delta', text: 'Delta' } }
        ], TestDropdownMenu.renderItem),
        dom: {
          tag: 'ol',
          classes: [ 'test-menu' ]
        },

        movement: {
          mode: 'matrix',
          numColumns: 2,
          rowDom: {
            tag: 'div',
            classes: [ 'row-class' ]
          },
          rowSelector: '.row-class'
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

          cAssertStore('Before focusItem event', [ ]),

          NamedChain.direct('alpha', cTriggerFocusItem, '_'),

          cAssertSelectedStates('After focusing item on alpha', [ true, false, false, false ]),

          cAssertStore('After focusItem event (alpha)', [ 'menu.events.focus' ]),

          cClearStore,
          NamedChain.direct('beta', cTriggerFocusItem, '_'),
          cAssertSelectedStates('After focusing item on beta', [ false, true, false, false ]),
          cAssertStore('After focusItem event (beta)', [ 'menu.events.focus' ]),
          cClearStore,

          NamedChain.direct('menu', Chain.op((menu) => {
            Keyboard.keydown(Keys.down(), { }, menu);
          }), '_'),

          cAssertSelectedStates('After pressing down on menu (with beta focus)', [ false, false, false, true ]),
          cAssertStore('After focusItem event (beta)', [ 'menu.events.focus' ]),
          cClearStore,

          NamedChain.direct('menu', Chain.op((menu) => {
            Keyboard.keydown(Keys.left(), { }, menu);
          }), '_'),

          cAssertSelectedStates('After pressing left on menu (with delta focus)', [ false, false, true, false ]),
          cAssertStore('After focusItem event (beta)', [ 'menu.events.focus' ]),
          cClearStore

        ])
      ])
    ];
  }, () => { success(); }, failure);
});
