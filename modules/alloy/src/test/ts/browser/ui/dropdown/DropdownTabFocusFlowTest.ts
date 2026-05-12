import { FocusTools, Keyboard, Keys, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Fun, Future, Optional, Result } from '@ephox/katamari';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import { Container } from 'ephox/alloy/api/ui/Container';
import { Dropdown } from 'ephox/alloy/api/ui/Dropdown';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('DropdownTabFocusFlowTest', (success, failure) => {

  const memSink = Memento.record(
    Container.sketch({
      containerBehaviours: Behaviour.derive([
        Positioning.config({ useFixed: Fun.always })
      ])
    })
  );

  const makeTabstopSpan = (className: string, text: string) => Container.sketch({
    dom: {
      tag: 'span',
      classes: [ className ],
      innerHtml: text
    },
    containerBehaviours: Behaviour.derive([
      Tabstopping.config({ }),
      Focusing.config({ })
    ])
  });

  GuiSetup.setup((store, _doc, _body) => {
    const tieredData = TestDropdownMenu.getSampleTieredData();

    return GuiFactory.build(
      Container.sketch({
        dom: {
          tag: 'div',
          classes: [ 'tab-flow-test-root' ]
        },
        containerBehaviours: Behaviour.derive([
          Keying.config({ mode: 'cyclic' })
        ]),
        components: [
          makeTabstopSpan('before-trigger', 'before'),
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
            // The trigger must be a tabstop so the parent's cyclic keying
            // treats it as a peer of the "before" / "after" spans.
            dropdownBehaviours: Behaviour.derive([
              Tabstopping.config({ })
            ]),
            parts: {
              menu: TestDropdownMenu.part(store)
            },
            fetch: () => Future.pure(Optional.some(
              TieredMenu.tieredData(tieredData.primary, tieredData.menus, tieredData.expansions)
            ))
          }),
          makeTabstopSpan('after-trigger', 'after')
        ]
      })
    );
  }, (doc, _body, gui, component, _store) => {
    gui.add(GuiFactory.build(memSink.asSpec()));

    const beforeSelector = 'span.before-trigger';
    const afterSelector = 'span.after-trigger';
    const triggerSelector = 'button.test-dropdown';
    const aAlphaSelector = 'li:contains("a-Alpha")';
    const aBetaSelector = 'li:contains("a-Beta")';
    const bAlphaSelector = 'li:contains("b-Alpha")';

    const sFocusIn = Step.sync(() => Keying.focusIn(component));
    const sOpenMenu = Keyboard.sKeydown(doc, Keys.enter(), {});
    const sWaitForMenuOpen = Waiter.sTryUntil(
      'Wait for menu to open',
      UiFinder.sExists(gui.element, '.menu')
    );
    const sWaitForMenuClosed = Waiter.sTryUntil(
      'Wait for menu to close',
      UiFinder.sNotExists(gui.element, '.menu')
    );

    return [
      sFocusIn,
      Keyboard.sKeydown(doc, Keys.tab(), { }),
      FocusTools.sTryOnSelector('Focus on trigger before opening menu', doc, triggerSelector),

      // Case 1: Tab inside an open menu closes it and advances focus to the
      // next tabstop ("after") — exactly as if the menu had been closed and
      // Tab had been pressed on the trigger.
      sOpenMenu,
      sWaitForMenuOpen,
      FocusTools.sTryOnSelector('Focus moves into menu on "a-Alpha"', doc, aAlphaSelector),
      Keyboard.sKeydown(doc, Keys.tab(), { }),
      sWaitForMenuClosed,
      FocusTools.sTryOnSelector('Tab from open menu lands on "after"', doc, afterSelector),

      // Case 2: Reverse direction. Shift+Tab from "after" returns to the
      // trigger; opening the menu and Shift+Tabbing should land on "before".
      Keyboard.sKeydown(doc, Keys.tab(), { shift: true }),
      FocusTools.sTryOnSelector('Shift+Tab returns to trigger', doc, triggerSelector),
      sOpenMenu,
      sWaitForMenuOpen,
      FocusTools.sTryOnSelector('Focus back in menu on "a-Alpha"', doc, aAlphaSelector),
      Keyboard.sKeydown(doc, Keys.tab(), { shift: true }),
      sWaitForMenuClosed,
      FocusTools.sTryOnSelector('Shift+Tab from open menu lands on "before"', doc, beforeSelector),

      // Case 3: Depth-independence. Open menu, descend into the submenu, then
      // Tab should still close the whole tiered menu and land on "after".
      Keyboard.sKeydown(doc, Keys.tab(), { }),
      FocusTools.sTryOnSelector('Tab moves back to trigger', doc, triggerSelector),
      sOpenMenu,
      sWaitForMenuOpen,
      Keyboard.sKeydown(doc, Keys.down(), { }),
      FocusTools.sTryOnSelector('Focus on a-Beta', doc, aBetaSelector),
      Keyboard.sKeydown(doc, Keys.right(), { }),
      FocusTools.sTryOnSelector('Focus on b-Alpha in submenu', doc, bAlphaSelector),
      Keyboard.sKeydown(doc, Keys.tab(), { }),
      sWaitForMenuClosed,
      FocusTools.sTryOnSelector('Tab from submenu lands on "after"', doc, afterSelector)
    ];
  }, success, failure);
});
