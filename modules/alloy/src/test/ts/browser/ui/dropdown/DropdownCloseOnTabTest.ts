import { FocusTools, Keyboard, Keys, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Fun, Future, Optional, Result } from '@ephox/katamari';

import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import { Container } from 'ephox/alloy/api/ui/Container';
import { Dropdown } from 'ephox/alloy/api/ui/Dropdown';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import type { NativeSimulatedEvent } from 'ephox/alloy/events/SimulatedEvent';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('DropdownCloseOnTabTest', (success, failure) => {

  const memSink = Memento.record(
    Container.sketch({
      containerBehaviours: Behaviour.derive([
        Positioning.config({
          useFixed: Fun.always
        })
      ])
    })
  );

  GuiSetup.setup((store, _doc, _body) => {
    const tieredData = TestDropdownMenu.getSampleTieredData();

    return GuiFactory.build(
      Dropdown.sketch({
        dom: {
          tag: 'button',
          classes: [ 'test-dropdown' ]
        },

        components: [
          { dom: { tag: 'span', innerHtml: 'menu' }}
        ],

        lazySink: (c) => Result.value(memSink.get(c)),

        toggleClass: 'alloy-selected',

        // Captures the keydown that onTabOutOfMenu re-emits on the trigger so
        // the test can verify the shift flag is preserved.
        dropdownBehaviours: Behaviour.derive([
          AddEventsBehaviour.config('test-keydown-capture', [
            AlloyEvents.run<NativeSimulatedEvent<KeyboardEvent>['event']>('keydown', (_comp, se) => {
              store.adder(`keydown received: shift=${se.event.raw.shiftKey}`)();
            })
          ])
        ]),

        eventOrder: {
          keydown: [ 'keying', 'test-keydown-capture' ]
        },

        parts: {
          menu: TestDropdownMenu.part(store)
        },

        fetch: () => Future.pure(Optional.some(
          TieredMenu.tieredData(tieredData.primary, tieredData.menus, tieredData.expansions)
        ))
      })
    );
  }, (doc, _body, gui, component, store) => {
    gui.add(GuiFactory.build(memSink.asSpec()));

    const buttonSelector = 'button.test-dropdown';
    const aAlphaSelector = 'li:contains("a-Alpha")';
    const aBetaSelector = 'li:contains("a-Beta")';
    const bAlphaSelector = 'li:contains("b-Alpha")';

    const sFocusTrigger = Step.sync(() => Focusing.focus(component));
    const sOpenMenu = Keyboard.sKeydown(doc, Keys.enter(), {});
    const sWaitForMenuOpen = Waiter.sTryUntil(
      'Wait for menu to open',
      UiFinder.sExists(gui.element, '.menu')
    );
    const sWaitForMenuClosed = Waiter.sTryUntil(
      'Wait for menu to close',
      UiFinder.sNotExists(gui.element, '.menu')
    );
    const sAssertFocusOnTrigger = FocusTools.sTryOnSelector(
      'Focus should be back on dropdown trigger',
      doc, buttonSelector
    );

    return [
      // Case 1: Tab from a top-level menu item closes the menu, refocuses the
      // trigger, and re-emits the keydown on the trigger (shift=false).
      sFocusTrigger,
      sOpenMenu,
      sWaitForMenuOpen,
      FocusTools.sTryOnSelector('Focus starts on a-Alpha', doc, aAlphaSelector),
      store.sClear,
      Keyboard.sKeydown(doc, Keys.tab(), { }),
      sWaitForMenuClosed,
      sAssertFocusOnTrigger,
      store.sAssertEq(
        'Tab re-emits keydown on the trigger with shift=false',
        [ 'keydown received: shift=false' ]
      ),

      // Case 2: Shift+Tab from a top-level menu item does the same, preserving
      // the shift flag on the re-emitted keydown.
      sOpenMenu,
      sWaitForMenuOpen,
      FocusTools.sTryOnSelector('Focus back on a-Alpha', doc, aAlphaSelector),
      store.sClear,
      Keyboard.sKeydown(doc, Keys.tab(), { shift: true }),
      sWaitForMenuClosed,
      sAssertFocusOnTrigger,
      store.sAssertEq(
        'Shift+Tab re-emits keydown on the trigger with shift=true',
        [ 'keydown received: shift=true' ]
      ),

      // Case 3: Tab from inside an open submenu closes the whole tiered menu
      // (not just the submenu) and refocuses the trigger.
      sOpenMenu,
      sWaitForMenuOpen,
      Keyboard.sKeydown(doc, Keys.down(), { }),
      FocusTools.sTryOnSelector('Focus on a-Beta', doc, aBetaSelector),
      Keyboard.sKeydown(doc, Keys.right(), { }),
      FocusTools.sTryOnSelector('Focus on b-Alpha in submenu', doc, bAlphaSelector),
      store.sClear,
      Keyboard.sKeydown(doc, Keys.tab(), { }),
      sWaitForMenuClosed,
      sAssertFocusOnTrigger,
      store.sAssertEq(
        'Tab from submenu closes whole tiered menu and re-emits keydown (shift=false)',
        [ 'keydown received: shift=false' ]
      )
    ];
  }, success, failure);
});
