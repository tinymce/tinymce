import { ApproxStructure, Assertions, Chain, NamedChain, UiFinder } from '@ephox/agar';
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

UnitTest.asynctest('MenuTest', (success, failure) => {

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Menu.sketch({
        value: 'test-menu-1',
        items: Arr.map([
          { type: 'item', data: { value: 'alpha', meta: { text: 'Alpha' } }, hasSubmenu: false },
          { type: 'item', data: { value: 'beta', meta: { text: 'Beta' } }, hasSubmenu: false }
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

    return [
      Chain.asStep({}, [
        NamedChain.asChain([
          NamedChain.writeValue('menu', component.element()),
          NamedChain.direct('menu', UiFinder.cFindIn('li[data-value="alpha"]'), 'alpha'),
          NamedChain.direct('menu', UiFinder.cFindIn('li[data-value="beta"]'), 'beta'),

          cAssertStore('Before focusItem event', [ ]),

          NamedChain.direct('alpha', cTriggerFocusItem, '_'),

          NamedChain.direct('menu', cAssertStructure('After focusing item on alpha', ApproxStructure.build((s, str, arr) => {
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
          NamedChain.direct('menu', cAssertStructure('After focusing item on beta', ApproxStructure.build((s, str, arr) => {
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
  }, () => { success(); }, failure);
});
