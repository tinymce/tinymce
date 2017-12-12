import { ApproxStructure } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { NamedChain } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import Menu from 'ephox/alloy/api/ui/Menu';
import MenuEvents from 'ephox/alloy/menu/util/MenuEvents';
import TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Arr } from '@ephox/katamari';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('MenuTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Menu.sketch({
        value: 'test-menu-1',
        items: Arr.map([
          { type: 'item', data: { value: 'alpha', text: 'Alpha' } },
          { type: 'item', data: { value: 'beta', text: 'Beta' } }
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
  }, function (doc, body, gui, component, store) {
    // TODO: Flesh out test.
    var cAssertStructure = function (label, expected) {
      return Chain.op(function (element) {
        Assertions.assertStructure(label, expected, element);
      });
    };

    var cTriggerFocusItem = Chain.op(function (target) {
      AlloyTriggers.dispatch(component, target, SystemEvents.focusItem());
    });

    var cAssertStore = function (label, expected) {
      return Chain.op(function () {
        store.assertEq(label, expected);
      });
    };

    var cClearStore = Chain.op(function () {
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

          NamedChain.direct('menu', cAssertStructure('After focusing item on alpha', ApproxStructure.build(function (s, str, arr) {
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
          NamedChain.direct('menu', cAssertStructure('After focusing item on beta', ApproxStructure.build(function (s, str, arr) {
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
  }, function () { success(); }, failure);
});

