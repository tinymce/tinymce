import { ApproxStructure, Assertions, Chain, Logger, Step, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Future, Optional } from '@ephox/katamari';
import { Class, SugarElement } from '@ephox/sugar';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Menu } from 'ephox/alloy/api/ui/Menu';
import { TouchMenu } from 'ephox/alloy/api/ui/TouchMenu';
import { ItemSpec } from 'ephox/alloy/ui/types/ItemTypes';

interface TestItemSpec {
  type: string;
  data: {
    value: string;
    meta: {
      text: string;
    };
  };
}

UnitTest.asynctest('Browser Test: ui.touch.TouchMenuTest', (success, failure) => {
  const munge = (i: TestItemSpec): ItemSpec => ({
    type: 'item',
    data: i.data,
    dom: {
      tag: 'div', innerHtml: i.data.meta.text,
      attributes: { 'data-value': i.data.value },
      styles: { display: 'inline-block', padding: '10px' }
    },
    components: [ ]
  });

  GuiSetup.setup((store, _doc, _body) => {
    const menuPart = {
      value: 'touchmenu1',
      dom: {
        tag: 'div',
        classes: [ 'touch-menu' ],
        styles: {
          'padding-top': '40px'
        }
      },
      components: [
        Menu.parts.items({ })
      ],

      items: [],

      markers: {
        item: 'test-item',
        selectedItem: 'test-selected-item'
      }
    };

    const viewPart = {
      dom: {
        tag: 'div'
      }
    };

    return GuiFactory.build(
      TouchMenu.sketch({
        dom: {
          tag: 'div',
          classes: [ 'touch-menu-test' ],
          styles: {
            padding: '20px'
          }
        },

        components: [
          {
            dom: {
              tag: 'span',
              classes: [ 'touch-menu-button' ],
              innerHtml: 'Touch button'
            }
          },
          // TODO: Test lazy sink
          TouchMenu.parts.sink({ })
        ],

        parts: {
          menu: menuPart,
          view: viewPart,
          sink: {
            dom: { tag: 'div' }
          }
        },

        fetch: () => {
          return Future.pure(
            Optional.from(Arr.map([
              { type: 'item', data: { value: 'dog', meta: { text: 'Dog' }}},
              { type: 'item', data: { value: 'elephant', meta: { text: 'Elephant' }}}
            ], munge))
          );
        },

        onHoverOn: store.adder('onHoverOn'),
        onHoverOff: store.adder('onHoverOff'),

        toggleClass: 'touch-menu-open'
      })
    );
  }, (doc, _body, gui, component, store) => {

    const fireTouchstart = (target: SugarElement<Node>, x: number, y: number) => {
      AlloyTriggers.dispatchWith(component, target, NativeEvents.touchstart(), {
        raw: {
          touches: [
            { clientX: x, clientY: y }
          ]
        }
      });
    };

    const fireTouchend = (target: SugarElement<Node>) => {
      AlloyTriggers.dispatch(component, target, NativeEvents.touchend());
    };

    const fireLongpress = (target: SugarElement<Node>) => {
      AlloyTriggers.dispatch(component, target, SystemEvents.longpress());
    };

    const sFireTouchmoveOn = (container: SugarElement<Node>, selector: string) => Chain.asStep(gui.element, [
      UiFinder.cFindIn(selector),
      Chain.op((target) => {
        const rect = target.dom.getBoundingClientRect();
        AlloyTriggers.dispatchWith(component, container, NativeEvents.touchmove(), {
          raw: {
            touches: [
              { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 }
            ]
          }
        });
      })
    ]);

    const sAssertMenuStructure = (label: string, structure: StructAssert) => Logger.t(label, Chain.asStep(gui.element, [
      UiFinder.cFindIn('[role=menu]'),
      Chain.op((menu) => {
        Assertions.assertStructure('Checking menu strucuture', structure, menu);
      })
    ]));

    return [
      GuiSetup.mAddStyles(doc, [
        '.test-selected-item { background-color: #cadbee; }'
      ]),
      // Only tests the dispatched events (not the real ones or their formulation)
      Step.sync(() => {
        store.assertEq('Checking no messages', [ ]);
        Assertions.assertEq('Checking selected class should be off initially', false, Class.has(component.element, 'touch-menu-open'));
        const rect = component.element.dom.getBoundingClientRect();
        fireTouchstart(component.element, rect.x, rect.y);
        Assertions.assertEq('Checking selected class should be on', true, Class.has(component.element, 'touch-menu-open'));
        store.assertEq('Checking no hovering messages until menu appears', [ ]);
        fireTouchend(component.element);
        Assertions.assertEq('Checking selected class should be off again', false, Class.has(component.element, 'touch-menu-open'));
        store.clear();
      }),
      Waiter.sTryUntil(
        'Waiting for menu to disappear',
        UiFinder.sNotExists(gui.element, '[role="menu"]')
      ),

      Step.sync(() => {
        store.assertEq('Checking no messages', [ ]);
        const rect = component.element.dom.getBoundingClientRect();
        fireTouchstart(component.element, rect.x, rect.y);
        Step.wait(300);
        fireLongpress(component.element);
        Assertions.assertEq('Checking selected class should now be on', true, Class.has(component.element, 'touch-menu-open'));
      }),

      Waiter.sTryUntil(
        'Waiting until menu appears',
        UiFinder.sExists(gui.element, '[role=menu]')
      ),
      store.sAssertEq('Hover on should be fired immediately after longpress menu appears', [ 'onHoverOn' ]),

      sFireTouchmoveOn(component.element, '[role="menu"] [data-value="dog"]'),
      sAssertMenuStructure('Checking menu structure with hover over first item', ApproxStructure.build((s, _str, arr) => s.element('div', {
        children: [
          s.element('div', {
            classes: [ arr.has('test-selected-item') ]
          }),
          s.element('div', {
            classes: [ arr.not('test-selected-item') ]
          })
        ]
      }))),
      store.sAssertEq('Hover off should be fire when an item gets focus', [ 'onHoverOn', 'onHoverOff' ]),
      sFireTouchmoveOn(component.element, '[role="menu"] [data-value="elephant"]'),
      sAssertMenuStructure('Checking menu structure with hover over first item', ApproxStructure.build((s, _str, arr) => s.element('div', {
        children: [
          s.element('div', {
            classes: [ arr.not('test-selected-item') ]
          }),
          s.element('div', {
            classes: [ arr.has('test-selected-item') ]
          })
        ]
      }))),

      store.sAssertEq('Hover off should not fire again until hover on has fired', [ 'onHoverOn', 'onHoverOff' ]),
      sFireTouchmoveOn(component.element, '.touch-menu-button'),
      sAssertMenuStructure('Checking menu structure with hover over the touch button (so nothing selected)',
        ApproxStructure.build((s, _str, arr) => s.element('div', {
          children: [
            s.element('div', {
              classes: [ arr.not('test-selected-item') ]
            }),
            s.element('div', {
              classes: [ arr.not('test-selected-item') ]
            })
          ]
        }))
      ),
      store.sAssertEq('Hover on should fire again now the button is under the "touch"', [ 'onHoverOn', 'onHoverOff', 'onHoverOn' ]),

      sFireTouchmoveOn(component.element, '.touch-menu-button'),
      store.sAssertEq(
        'Hover on should not fire again because hover off has not yet',
        [ 'onHoverOn', 'onHoverOff', 'onHoverOn' ]
      ),

      // Entire component, so inside the menu part
      sFireTouchmoveOn(component.element, '.touch-menu'),
      store.sAssertEq(
        'Hover off should fire because nothing under "touch"',
        [ 'onHoverOn', 'onHoverOff', 'onHoverOn', 'onHoverOff' ]
      ),
      sAssertMenuStructure('Checking menu structure with hover over nothing (so nothing selected)',
        ApproxStructure.build((s, _str, arr) => s.element('div', {
          children: [
            s.element('div', {
              classes: [ arr.not('test-selected-item') ]
            }),
            s.element('div', {
              classes: [ arr.not('test-selected-item') ]
            })
          ]
        }))
      )
    ];
  }, success, failure);
});
