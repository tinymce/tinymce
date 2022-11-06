import { ApproxStructure, Assertions, FocusTools, KeyPressAdt, Mouse, RealKeys, StructAssert, UiFinder } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun, Id, Optional } from '@ephox/katamari';
import { Attribute, Focus, SugarDocument, SugarElement, SugarNode, Value } from '@ephox/sugar';

import { renderMenuButton } from 'tinymce/themes/silver/ui/button/MenuButton';

import { fetchMailMergeData } from '../../module/CommonMailMergeFetch';
import { structMenuWith, structSearchField, structSearchLeafItem, structSearchParentItem, structSearchResultsWith } from '../../module/CommonMenuTestStructures';
import * as TestExtras from '../../module/TestExtras';

describe('webdriver.tinymce.themes.silver.toolbar.SearchableMenuTypingTest', () => {
  const extrasHook = TestExtras.bddSetup();

  TestHelpers.GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    `.tox-menu .tox-collection__item--active {
      background-color: black;
    }`,
    `.tox-menu {
      background-color: #3f878bd6;
      color:white;
      padding: 2em;
    }`
  ]);

  // Tags the keyboard-focused element with a selector to allow webdriver effects, and then
  // removes it once the effect has completed.
  const pSendToActiveElement = (_doc: SugarElement<Document>, f: (elem: SugarElement<Element>, selector: string) => Promise<unknown>): Promise<void> => {
    return Focus.active().fold(
      () => Promise.reject('Could not find the focused element to send events'),
      async (activeElem) => {
        const tempVal = Id.generate('data-sendkeys-id');
        Attribute.set(activeElem, 'data-sendkeys', tempVal);
        const selector = `${SugarNode.name(activeElem)}[data-sendkeys=${tempVal}]`;
        await f(activeElem, selector);
        Attribute.remove(activeElem, 'data-sendkeys');
      }
    );
  };

  const onActiveElement = <A>(doc: SugarElement<Document>, f: (elem: SugarElement<any>) => A): A => {
    return Focus.active(doc).fold<A>(
      () => {
        throw new Error('Could not find focused element');
      },
      (focused) => f(focused)
    );
  };

  const pSendKeysToActiveInput = (_doc: SugarElement<Document>, keys: KeyPressAdt[]) => {
    return pSendToActiveElement(hook.root(), async (_elem, selector) =>
      await RealKeys.pSendKeysOn(selector, keys)
    );
  };

  // We are currying this so that it works more easily with onActiveElement
  const assertTextState = (expected: { start: number; end: number; text: string }) => (input: SugarElement<HTMLInputElement>) => {
    Assertions.assertEq(
      'Checking input state (selection positions and value)',
      expected,
      {
        start: input.dom.selectionStart,
        end: input.dom.selectionEnd,
        text: Value.get(input)
      }
    );
  };

  // We are currying this so that it works more easily with onActiveElement
  const assertCursorAtEndOfText = (expectedText: string) => (input: SugarElement<HTMLInputElement>) => {
    Assertions.assertEq(
      'Checking input state (selection positions and value)',
      { start: expectedText.length, end: expectedText.length, text: expectedText },
      {
        start: input.dom.selectionStart,
        end: input.dom.selectionEnd,
        text: Value.get(input)
      }
    );
  };

  const pAssertTieredMenuStructure = async (label: string, sink: SugarElement<HTMLElement>, children: StructAssert[]) => {
    const tmenu = await UiFinder.pWaitForVisible(
      `Waiting for TieredMenu [${label}]`,
      sink,
      '.tox-tiered-menu:has(.tox-selected-menu)'
    );

    Assertions.assertStructure(
      `Asserting TieredMenu structure [${label}]`,
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children
        });
      }),
      tmenu
    );
  };

  const hook = TestHelpers.GuiSetup.bddSetup(
    (store, _doc, _body) => GuiFactory.build(
      renderMenuButton(
        {
          text: Optional.some('MailMerge'),
          icon: Optional.none(),
          tooltip: Optional.none(),
          onSetup: Fun.constant(Fun.noop),
          search: Optional.some({ placeholder: Optional.none() }),
          fetch: fetchMailMergeData({
            // To test that <left> and <right> etc. are not being
            // processed by the menu, we need to have menus that can expand / collapse
            // even when there is a search term.
            collapseSearchResults: false
          }, store)
        },
        'prefix',
        extrasHook.access().extras.backstages.popup,
        Optional.none()
      )
    )
  );

  const structNoPlaceholderSearch = structSearchField(Optional.none());

  // TINY-9013: The <space> key is missing from KeyEffects in bedrock
  const spaceKey = RealKeys.text('\uE00D');

  context('Testing searchable menu key events', () => {
    it('TINY-8952: Cycle through all actions', async () => {
      // Setup.
      const menuButtonComp = hook.component();

      // Open the dropdown.
      Mouse.click(menuButtonComp.element);
      // That should focus the search widget
      await FocusTools.pTryOnSelector(
        'Waiting until the input has focus',
        hook.root(),
        '.tox-menu input'
      );

      // Type "Ph" into the input
      await pSendKeysToActiveInput(hook.root(), [ RealKeys.text('Ph') ]);
      onActiveElement( hook.root(), assertCursorAtEndOfText('Ph') );
      await pAssertTieredMenuStructure('Typing Ph', extrasHook.access().getPopupSink(), [
        structMenuWith({ selected: true }, [
          structNoPlaceholderSearch,
          structSearchResultsWith([
            structSearchLeafItem({ selected: true }),
            structSearchLeafItem({ selected: false }),
            structSearchParentItem({ selected: false, expanded: false }),
            structSearchParentItem({ selected: false, expanded: false })
          ])
        ])
      ]);

      // Move the text selection back one character.
      await pSendKeysToActiveInput(hook.root(), [ RealKeys.text('arrowleft') ]);
      onActiveElement(
        hook.root(),
        assertTextState({ text: 'Ph', start: 'P'.length, end: 'P'.length })
      );
      await pAssertTieredMenuStructure('After <left>', extrasHook.access().getPopupSink(), [
        structMenuWith({ selected: true }, [
          structNoPlaceholderSearch,
          structSearchResultsWith([
            structSearchLeafItem({ selected: true }),
            structSearchLeafItem({ selected: false }),
            structSearchParentItem({ selected: false, expanded: false }),
            structSearchParentItem({ selected: false, expanded: false })
          ])
        ])
      ]);

      // Navigate back to the bottom item of the menu with <up>. It is an expandable item
      await pSendKeysToActiveInput(hook.root(), [ RealKeys.text('arrowup') ]);
      onActiveElement(
        hook.root(),
        assertTextState({ text: 'Ph', start: 'P'.length, end: 'P'.length })
      );
      await pAssertTieredMenuStructure('After <up>', extrasHook.access().getPopupSink(), [
        structMenuWith({ selected: true }, [
          structNoPlaceholderSearch,
          structSearchResultsWith([
            structSearchLeafItem({ selected: false }),
            structSearchLeafItem({ selected: false }),
            structSearchParentItem({ selected: false, expanded: false }),
            structSearchParentItem({ selected: true, expanded: false })
          ])
        ])
      ]);

      // Now press <right>. This should be handled by the input, not the menu
      // So it should not expand! Insetad, it should move the text selection
      // back to the end of the input
      await pSendKeysToActiveInput(hook.root(), [ RealKeys.text('arrowright') ]);
      onActiveElement(
        hook.root(),
        assertCursorAtEndOfText('Ph')
      );
      await pAssertTieredMenuStructure('After <right>', extrasHook.access().getPopupSink(), [
        structMenuWith({ selected: true }, [
          structNoPlaceholderSearch,
          structSearchResultsWith([
            structSearchLeafItem({ selected: false }),
            structSearchLeafItem({ selected: false }),
            structSearchParentItem({ selected: false, expanded: false }),
            structSearchParentItem({ selected: true, expanded: false })
          ])
        ])
      ]);

      // Now press <space>. Even though we are on a triggering item, <space>
      // should be handled by the input, not the menu. So it should get a space
      // character added.
      await pSendKeysToActiveInput(hook.root(), [ spaceKey ]);
      onActiveElement(
        hook.root(),
        assertCursorAtEndOfText('Ph ')
      );
      // Unfortunately, pressing <space> is going to trigger a refetch, because
      // the search pattern has changed, so the menu will be refetched, and selection
      // will reset back to the first item. So it's not easy to double-check it
      // didn't expand, but we are at least checking that it is being interpreted
      // by the input.
      await pAssertTieredMenuStructure('After <space> (which will trigger a refetch)', extrasHook.access().getPopupSink(), [
        structMenuWith({ selected: true }, [
          structNoPlaceholderSearch,
          structSearchResultsWith([
            structSearchLeafItem({ selected: true }),
            structSearchLeafItem({ selected: false }),
            structSearchParentItem({ selected: false, expanded: false }),
            structSearchParentItem({ selected: false, expanded: false })
          ])
        ])
      ]);

      // Now press <up> to get back to the last element.
      await pSendKeysToActiveInput(hook.root(), [ RealKeys.text('arrowup') ]);
      onActiveElement(
        hook.root(),
        assertCursorAtEndOfText('Ph ')
      );
      await pAssertTieredMenuStructure('After <up>', extrasHook.access().getPopupSink(), [
        structMenuWith({ selected: true }, [
          structNoPlaceholderSearch,
          structSearchResultsWith([
            structSearchLeafItem({ selected: false }),
            structSearchLeafItem({ selected: false }),
            structSearchParentItem({ selected: false, expanded: false }),
            structSearchParentItem({ selected: true, expanded: false })
          ])
        ])
      ]);

      // Now press <enter> to expand that element
      await pSendKeysToActiveInput(hook.root(), [ RealKeys.text('enter') ]);
      onActiveElement(
        hook.root(),
        assertCursorAtEndOfText('Ph ')
      );
      await pAssertTieredMenuStructure('After <enter>', extrasHook.access().getPopupSink(), [
        structMenuWith({ selected: false }, [
          structNoPlaceholderSearch,
          structSearchResultsWith([
            structSearchLeafItem({ selected: false }),
            structSearchLeafItem({ selected: false }),
            structSearchParentItem({ selected: false, expanded: false }),
            structSearchParentItem({ selected: true, expanded: true })
          ])
        ]),
        structMenuWith({ selected: true }, [
          ApproxStructure.build((s, _str, _arr) => {
            return s.element('div', {
              children: [
                structSearchLeafItem({ selected: true }),
                structSearchLeafItem({ selected: false }),
                structSearchLeafItem({ selected: false }),
                structSearchParentItem({ selected: false, expanded: false })
              ]
            });
          })
        ])
      ]);

      // Now press <left>. It should just move the cursor in the input field
      // and not collapse anything.
      await pSendKeysToActiveInput(hook.root(), [ RealKeys.text('arrowleft') ]);
      onActiveElement(
        hook.root(),
        assertTextState({ text: 'Ph ', start: 'Ph'.length, end: 'Ph'.length })
      );
      await pAssertTieredMenuStructure('After <left>', extrasHook.access().getPopupSink(), [
        structMenuWith({ selected: false }, [
          structNoPlaceholderSearch,
          structSearchResultsWith([
            structSearchLeafItem({ selected: false }),
            structSearchLeafItem({ selected: false }),
            structSearchParentItem({ selected: false, expanded: false }),
            structSearchParentItem({ selected: true, expanded: true })
          ])
        ]),
        structMenuWith({ selected: true }, [
          ApproxStructure.build((s, _str, _arr) => {
            return s.element('div', {
              children: [
                structSearchLeafItem({ selected: true }),
                structSearchLeafItem({ selected: false }),
                structSearchLeafItem({ selected: false }),
                structSearchParentItem({ selected: false, expanded: false })
              ]
            });
          })
        ])
      ]);

      // Now press <down>. It should navigate in the menu
      await pSendKeysToActiveInput(hook.root(), [ RealKeys.text('arrowdown') ]);
      onActiveElement(
        hook.root(),
        assertTextState({ text: 'Ph ', start: 'Ph'.length, end: 'Ph'.length })
      );
      await pAssertTieredMenuStructure('After <down>', extrasHook.access().getPopupSink(), [
        structMenuWith({ selected: false }, [
          structNoPlaceholderSearch,
          structSearchResultsWith([
            structSearchLeafItem({ selected: false }),
            structSearchLeafItem({ selected: false }),
            structSearchParentItem({ selected: false, expanded: false }),
            structSearchParentItem({ selected: true, expanded: true })
          ])
        ]),
        structMenuWith({ selected: true }, [
          ApproxStructure.build((s, _str, _arr) => {
            return s.element('div', {
              children: [
                structSearchLeafItem({ selected: false }),
                structSearchLeafItem({ selected: true }),
                structSearchLeafItem({ selected: false }),
                structSearchParentItem({ selected: false, expanded: false })
              ]
            });
          })
        ])
      ]);

      // Now press <escape>. It should collapse the menu.
      await pSendKeysToActiveInput(hook.root(), [ RealKeys.text('escape') ]);

      onActiveElement(
        hook.root(),
        assertTextState({ text: 'Ph ', start: 'Ph'.length, end: 'Ph'.length })
      );
      await pAssertTieredMenuStructure('After <escape>', extrasHook.access().getPopupSink(), [
        structMenuWith({ selected: true }, [
          structNoPlaceholderSearch,
          structSearchResultsWith([
            structSearchLeafItem({ selected: false }),
            structSearchLeafItem({ selected: false }),
            structSearchParentItem({ selected: false, expanded: false }),
            // The menu is collapsed now, due to the Escape.
            structSearchParentItem({ selected: true, expanded: false })
          ])
        ])
      ]);
    });
  });
});
