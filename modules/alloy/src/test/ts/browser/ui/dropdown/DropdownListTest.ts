import { ApproxStructure, Assertions, FocusTools, Keyboard, Keys, Logger, Mouse, UiFinder, Waiter, Chain, GeneralSteps, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Fun, Future, Result, Option } from '@ephox/katamari';
import { Compare, Focus } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import { Container } from 'ephox/alloy/api/ui/Container';
import { Dropdown } from 'ephox/alloy/api/ui/Dropdown';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import * as DropdownAssertions from 'ephox/alloy/test/dropdown/DropdownAssertions';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as NavigationUtils from 'ephox/alloy/test/NavigationUtils';
import * as TestBroadcasts from 'ephox/alloy/test/TestBroadcasts';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';

UnitTest.asynctest('Dropdown List', (success, failure) => {

  const memSink = Memento.record(
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
      Dropdown.sketch({
        dom: {
          tag: 'button',
          classes: [ 'test-dropdown' ]
        },

        components: [
          {
            dom: {
              tag: 'span',
              innerHtml: 'hi'
            }
          }
        ],
        sandboxClasses: [ 'my-test-sandbox' ],
        sandboxBehaviours: Behaviour.derive([
          AddEventsBehaviour.config('test-events', [
            AlloyEvents.run('made-up-event', store.adder('received made-up-event'))
          ])
        ]),

        lazySink (c) {
          TestDropdownMenu.assertLazySinkArgs('button', 'test-dropdown', c);
          return Result.value(memSink.get(c));
        },

        toggleClass: 'alloy-selected',

        dropdownBehaviours: Behaviour.derive(
          Arr.map([ '1', '2', '3' ], (num) => AddEventsBehaviour.config(`test-listener-${num}`, [
            AlloyEvents.run('test-listener', store.adder(`test.listener.${num}`))
          ]))
        ),

        eventOrder: {
          'test-listener': [ 'test-listener-1', 'test-listener-3', 'test-listener-2' ]
        },

        matchWidth: true,

        parts: {
          menu: TestDropdownMenu.part(store)
        },

        fetch () {
          const future = Future.pure([
            { type: 'item', data: { value: 'alpha', meta: { text: 'Alpha' } } },
            { type: 'item', data: { value: 'beta', meta: { text: 'Beta' } } },
            { type: 'item', data: { value: 'gamma', meta: { text: 'Gamma' } } },
            { type: 'item', data: { value: 'delta', meta: { text: 'Delta' } } }
          ]);

          return future.map((f) => {
            const menu = TestDropdownMenu.renderMenu({
              value: 'v',
              items: Arr.map(f, TestDropdownMenu.renderItem)
            });
            return Option.some(TieredMenu.singleData('test', menu));
          });
        }
      })
    );

    return c;

  }, (doc, body, gui, component, store) => {
    const sink = GuiFactory.build(memSink.asSpec());

    const inputForFocus = GuiFactory.build({
      dom: {
        tag: 'input'
      }
    });

    gui.add(sink);
    gui.add(inputForFocus);

    const focusables = {
      button: { label: 'dropdown-button', selector: 'button' },
      alpha: { label: 'alpha-item', selector: 'li:contains(Alpha)' },
      beta: { label: 'beta-item', selector: 'li:contains(Beta)' },
      gamma: { label: 'gamma-item', selector: 'li:contains(Gamma)' },
      delta: { label: 'delta-item', selector: 'li:contains(Delta)' }
    };

    return [
      GuiSetup.mAddStyles(doc, [
        ':focus { outline: 2px solid green; }'
      ]),
      // Add more information to this.
      Assertions.sAssertStructure(
        'Initial structure of dropdown button',
        ApproxStructure.build((s, str, arr) => {
          return s.element('button', {
            attrs: {
              'aria-expanded': str.is('false'),
              'aria-haspopup': str.is('true'),
              'type': str.is('button')
            }
          });
        }),
        component.element()
      ),

      Mouse.sClickOn(gui.element(), focusables.button.selector),

      FocusTools.sTryOnSelector('Focus should be on alpha', doc, 'li:contains(Alpha)'),

      store.sClear,
      Chain.asStep(gui.element(), [
        UiFinder.cFindIn('.my-test-sandbox'),
        Chain.binder((sandbox) => component.getSystem().getByDom(sandbox)),
        Chain.op((sandboxComp) => {
          AlloyTriggers.emit(sandboxComp, 'made-up-event');
        }),
        Chain.op((sandboxComp) => {
          Assertions.assertEq('Checking Representing.getValue of sandbox is dropdown', true, Compare.eq(component.element(), Representing.getValue(sandboxComp).element()));
        })
      ]),
      store.sAssertEq('Checking sandbox is getting event', [ 'received made-up-event' ]),
      store.sClear,

      Keyboard.sKeydown(doc, Keys.escape(), { }),
      Waiter.sTryUntil(
        'Waiting for menu to disappear',
        FocusTools.sTryOnSelector('Focus should be back on button', doc, 'button')
      ),

      UiFinder.sNotExists(gui.element(), '.menu'),
      Keyboard.sKeydown(doc, Keys.enter(), { }),

      Waiter.sTryUntil(
        'Wait until dropdown content loads',
        // Just check the sandbox class is there.
        UiFinder.sExists(gui.element(), '.my-test-sandbox .menu')
      ),

      FocusTools.sTryOnSelector(
        '1. focus should start on alpha',
        doc,
        focusables.alpha.selector
      ),

      DropdownAssertions.sSameWidth('Dropdown List', gui, component, '.menu'),

      NavigationUtils.sequence(doc, Keys.down(), {}, [
        focusables.beta, focusables.gamma, focusables.delta, focusables.alpha
      ]),
      NavigationUtils.sequence(doc, Keys.up(), {}, [
        focusables.delta, focusables.gamma, focusables.beta, focusables.alpha
      ]),
      NavigationUtils.sequence(doc, Keys.right(), {}, [
        focusables.alpha, focusables.alpha
      ]),
      NavigationUtils.sequence(doc, Keys.left(), {}, [
        focusables.alpha, focusables.alpha
      ]),
      NavigationUtils.sequence(doc, Keys.tab(), {}, [
        focusables.beta, focusables.gamma, focusables.delta, focusables.alpha
      ]),
      NavigationUtils.sequence(doc, Keys.tab(), { shift: true }, [
        focusables.delta, focusables.gamma, focusables.beta, focusables.alpha
      ]),

      Keyboard.sKeydown(doc, Keys.down(), {}),
      store.sAssertEq('nothing has been executed', [ ]),
      Keyboard.sKeydown(doc, Keys.enter(), {}),
      store.sAssertEq('after executing item: beta', [ 'dropdown.menu.execute: beta' ]),
      store.sClear,

      Keyboard.sKeydown(doc, Keys.down(), {}),
      Keyboard.sKeydown(doc, Keys.space(), {}),
      store.sAssertEq('after executing item: gamma', [ 'dropdown.menu.execute: gamma' ]),
      store.sClear,

      Mouse.sClickOn(gui.element(), focusables.alpha.selector),
      store.sAssertEq('after executing item: alpha', [ 'dropdown.menu.execute: alpha' ]),
      store.sClear,

      Keyboard.sKeydown(doc, Keys.escape(), {}),
      FocusTools.sTryOnSelector(
        'Focus should have moved back to the dropdown',
        doc,
        focusables.button.selector
      ),

      Mouse.sClickOn(gui.element(), focusables.button.selector),

      FocusTools.sTryOnSelector(
        '2. focus should start on alpha',
        doc,
        focusables.alpha.selector
      ),

      TestBroadcasts.sDismiss(
        'button: should not close',
        gui,
        component.element()
      ),

      FocusTools.sIsOnSelector(
        'focus should stay on alpha',
        doc,
        focusables.alpha.selector
      ),

      TestBroadcasts.sDismissOn(
        'item: should not close',
        gui,
        focusables.alpha.selector
      ),

      FocusTools.sIsOnSelector(
        'focus should stay on alpha after firing dismiss on alpha',
        doc,
        focusables.alpha.selector
      ),

      TestBroadcasts.sDismiss(
        'outer element: should close',
        gui,
        gui.element()
      ),

      Logger.t(
        'After broadcasting dismiss popup on a non popup element, the menu should not longer exist in the DOM',
        UiFinder.sNotExists(gui.element(), '.menu')
      ),

      Logger.t(
        'Triggering the test-listener event should fire things to the store in the right order (1, 3, 2)',
        GeneralSteps.sequence([
          store.sClear,
          Step.sync(() => AlloyTriggers.emit(component, 'test-listener')),
          store.sAssertEq(
            'test-listener should respect eventOrder',
            ['test.listener.1', 'test.listener.3', 'test.listener.2' ]
          )
        ])
      ),

      Logger.t(
        'Using the expand API should open the dropdown, without focusing / highlighting it',
        GeneralSteps.sequence([
          store.sClear,
          Step.sync(() => {
            Focus.focus(component.element());
          }),
          Step.sync(() => {
            Dropdown.expand(component);
          }),
          UiFinder.sWaitForVisible('Waiting for menu to appear', sink.element(), '.menu'),
          Step.sync(() => Assertions.assertEq('isOpen should be true', true, Dropdown.isOpen(component))),
          FocusTools.sTryOnSelector('Focus should still be on button (expand does not shift it)', doc, 'button')
        ])
      ),

      Logger.t(
        'Pressing <down> in the button should focus the expanded menu',
        GeneralSteps.sequence([
          Keyboard.sKeydown(doc, Keys.down(), { }),
          Step.sync(() => Assertions.assertEq('isOpen should be true', true, Dropdown.isOpen(component))),
          FocusTools.sTryOnSelector('Focus should still be on button (expand does not shift it)', doc, 'li:contains("Alpha")')
        ])
      ),

      Logger.t(
        'Closing the dropdown should hide the menu. Currently, it will not shift focus.',
        GeneralSteps.sequence([
          Step.sync(() => {
            Focus.focus(inputForFocus.element());
          }),
          Step.sync(() => {
            Dropdown.close(component);
          }),
          UiFinder.sNotExists(sink.element(), '.menu'),
          Step.sync(() => Assertions.assertEq('isOpen should be false', false, Dropdown.isOpen(component))),
          FocusTools.sTryOnSelector('Focus should not be shifted by the close call', doc, 'input')
        ])
      ),

      Logger.t(
        'Using the open API should open the dropdown, and focus / highlight the menu',
        GeneralSteps.sequence([
          Step.sync(() => {
            Dropdown.open(component);
          }),
          UiFinder.sWaitForVisible('Waiting for menu to appear', sink.element(), '.menu'),
          Step.sync(() => Assertions.assertEq('isOpen should be true', true, Dropdown.isOpen(component))),
          FocusTools.sTryOnSelector('Focus should still be on button (expand does not shift it)', doc, 'li:contains("Alpha")')
        ])
      ),

      GuiSetup.mRemoveStyles
    ];
  }, () => { success(); }, failure);
});
