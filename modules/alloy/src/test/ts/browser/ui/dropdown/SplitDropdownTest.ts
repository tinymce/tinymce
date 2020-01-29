import { ApproxStructure, Assertions, FocusTools, Keyboard, Keys, Mouse, Touch, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun, Future, Option, Result } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';
import { SplitDropdown } from 'ephox/alloy/api/ui/SplitDropdown';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';

UnitTest.asynctest('SplitDropdown List', (success, failure) => {

  const sink = Memento.record(
    Container.sketch({
      containerBehaviours: Behaviour.derive([
        Positioning.config({
          useFixed: Fun.always
        })
      ])
    })
  );

  GuiSetup.setup((store, doc, body) => {
    const c = GuiFactory.build(
      SplitDropdown.sketch({
        dom: {
          tag: 'span',
          classes: [ 'test-split-dropdown' ],
          attributes: {
            'data-test-id': 'split-dropdown'
          }
        },

        toggleClass: 'test-selected-dropdown',
        onExecute (dropdown, button) {
          const arg0Name = Attr.get(dropdown.element(), 'data-test-id');
          const arg1Name = Attr.get(button.element(), 'data-test-id');
          store.adderH('dropdown.execute(' + arg0Name + ', ' + arg1Name + ')')();
        },
        onItemExecute (dropdown, tieredMenu, item) {
          const arg0Name = Attr.get(dropdown.element(), 'data-test-id');
          const arg1Name = Attr.get(tieredMenu.element(), 'data-test-id');
          const arg2Name = Attr.get(item.element(), 'data-test-id');
          AlloyTriggers.emit(item, SystemEvents.sandboxClose());
          store.adderH('dropdown.item.execute(' + [ arg0Name, arg1Name, arg2Name ].join(', ') + ')')();
        },

        components: [
          SplitDropdown.parts().button({
            dom: {
              tag: 'button',
              classes: [ 'test-split-button-action' ],
              attributes: {
                'data-test-id': 'split-dropdown-button'
              }
            },
            components: [
              {
                dom: {
                  tag: 'div',
                  innerHtml: 'hi'
                }
              }
            ]
          }),
          SplitDropdown.parts().arrow({
            dom: {
              tag: 'button',
              innerHtml: 'v',
              classes: [ 'test-split-button-arrow' ],
              attributes: {
                'data-test-id': 'split-dropdown-arrow'
              }
            }
          })
        ],

        lazySink: (c: AlloyComponent) => {
          TestDropdownMenu.assertLazySinkArgs('span', 'test-split-dropdown', c);
          // Only gets here is the above assertion passes.
          return Result.value(sink.get(c));
        },

        parts: {
          menu: {
            dom: {
              tag: 'div',
              attributes: {
                'data-test-id': 'split-tiered-menu'
              }
            },
            markers: TestDropdownMenu.markers()
          }
        },

        fetch () {
          const future = Future.pure([
            { type: 'item', data: { value: 'alpha', meta: { text: 'Alpha' } } },
            { type: 'item', data: { value: 'beta', meta: { text: 'Beta' } } }
          ]);

          return future.map((f) => {
            const menu = TestDropdownMenu.renderMenu({
              value: 'split-dropdown-test',
              items: Arr.map(f, TestDropdownMenu.renderItem)
            });
            return Option.some(TieredMenu.singleData('test', menu));
          });
        }
      })
    );

    return c;

  }, (doc, body, gui, component, store) => {
    gui.add(
      GuiFactory.build(sink.asSpec())
    );

    return [
      Assertions.sAssertStructure(
        'Check basic initial structure',
        ApproxStructure.build((s, str, arr) => {
          return s.element('span', {
            attrs: {
              'role': str.is('button'),
              'aria-expanded': str.is('false'),
              'aria-haspopup': str.is('true')
            },

            children: [
              s.element('span', {
                attrs: {
                  role: str.is('presentation')
                }
              }),
              s.element('span', {
                attrs: {
                  role: str.is('presentation')
                }
              })
            ]
          });
        }),
        component.element()
      ),

      store.sClear,
      store.sAssertEq('Should be empty', [ ]),
      Mouse.sClickOn(gui.element(), '.test-split-button-action'),
      store.sAssertEq('After clicking on action', [ 'dropdown.execute(split-dropdown, split-dropdown-button)' ]),
      UiFinder.sNotExists(gui.element(), '[role="menu"]'),
      store.sClear,

      Mouse.sClickOn(gui.element(), '.test-split-button-arrow'),
      store.sAssertEq('After clicking on action', [ ]),
      Waiter.sTryUntil(
        'Waiting until menu appears',
        UiFinder.sExists(gui.element(), '[role="menu"]')
      ),
      FocusTools.sTryOnSelector('Focus should be on alpha', doc, 'li:contains("Alpha")'),
      Assertions.sAssertStructure(
        'Check menu opened structure',
        ApproxStructure.build((s, str, arr) => {
          return s.element('span', {
            attrs: {
              'role': str.is('button'),
              'aria-expanded': str.is('true'),
              'aria-haspopup': str.is('true')
            },

            children: [
              s.element('span', {
                attrs: {
                  role: str.is('presentation')
                }
              }),
              s.element('span', {
                attrs: {
                  role: str.is('presentation')
                },
                classes: [ arr.has('test-selected-dropdown') ]
              })
            ]
          });
        }),
        component.element()
      ),
      Keyboard.sKeydown(doc, Keys.escape(), { }),
      UiFinder.sNotExists(gui.element(), '[role="menu"]'),

      // Now, let's do some keyboard testing. Pressing space and enter should trigger execute
      store.sAssertEq('Before keyboard testing: should be clear', [ ]),
      Keyboard.sKeydown(doc, Keys.space(), { }),
      store.sAssertEq('After space on button', [ 'dropdown.execute(split-dropdown, split-dropdown-button)' ]),
      // NOTE: this sNotExists isn't 100% fool-proof. We should probably wait first because
      // it is async ... however, how long to wait?
      UiFinder.sNotExists(gui.element(), '[role="menu"]'),
      store.sClear,
      Keyboard.sKeydown(doc, Keys.enter(), { }),
      store.sAssertEq('After enter on button', [ 'dropdown.execute(split-dropdown, split-dropdown-button)' ]),
      UiFinder.sNotExists(gui.element(), '[role="menu"]'),
      store.sClear,

      Keyboard.sKeydown(doc, Keys.down(), { }),
      store.sAssertEq('After down on button', [ ]),
      Waiter.sTryUntil(
        'Waiting until menu appears',
        UiFinder.sExists(gui.element(), '[role="menu"]')
      ),
      FocusTools.sTryOnSelector('Focus should be on alpha', doc, 'li:contains("Alpha")'),

      // Now press enter on one of the items
      Keyboard.sKeydown(doc, Keys.enter(), { }),
      store.sAssertEq('After enter on item', [ 'dropdown.item.execute(split-dropdown, split-tiered-menu, item-alpha)' ]),
      // NOTE: This is due to the itemExecute handler here.
      UiFinder.sNotExists(gui.element(), '[role="menu"]'),
      store.sClear,

      // Test to make sure tapping on the button/arrow also works
      store.sAssertEq('Should be empty', [ ]),
      Touch.sTapOn(gui.element(), '.test-split-button-action'),
      store.sAssertEq('After tapping on action', [ 'dropdown.execute(split-dropdown, split-dropdown-button)' ]),
      UiFinder.sNotExists(gui.element(), '[role="menu"]'),
      store.sClear,

      Touch.sTapOn(gui.element(), '.test-split-button-arrow'),
      store.sAssertEq('After tapping on action', [ ]),
      Waiter.sTryUntil(
        'Waiting until menu appears',
        UiFinder.sExists(gui.element(), '[role="menu"]')
      ),
      FocusTools.sTryOnSelector('Focus should be on alpha', doc, 'li:contains("Alpha")'),
      store.sClear
    ];
  }, () => { success(); }, failure);
});
