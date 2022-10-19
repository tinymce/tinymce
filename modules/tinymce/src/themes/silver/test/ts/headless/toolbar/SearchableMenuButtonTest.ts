import { ApproxStructure, Assertions, FocusTools, Keyboard, Keys, Mouse, UiFinder } from '@ephox/agar';
import { AlloyTriggers, GuiFactory, NativeEvents, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';
import { Attribute, SugarDocument, SugarElement } from '@ephox/sugar';

import { renderMenuButton } from 'tinymce/themes/silver/ui/button/MenuButton';

import { fetchMailMergeData } from '../../module/CommonMailMergeFetch';
import { structMenuWith, structSearchField, structSearchLeafItem, structSearchParentItem, structSearchResultsWith } from '../../module/CommonMenuTestStructures';
import * as TestExtras from '../../module/TestExtras';

describe('headless.tinymce.themes.silver.toolbar.SearchableMenuButtonTest', () => {
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

  const structNoPlaceholderSearch = structSearchField(Optional.none());

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
            // If a search pattern is present, collapse into one menu
            collapseSearchResults: true
          }, store)
        },
        'prefix',
        extrasHook.access().extras.backstages.popup,
        Optional.none()
      )
    )

  );

  const pAssertAriaConsistent = async () => {
    // So find the field.
    const inputField: SugarElement<HTMLElement> = await UiFinder.pWaitForVisible(
      'Waiting for search widget to appear (testing aria consistency)',
      extrasHook.access().getPopupSink(),
      '.tox-menu input'
    );

    const activeResults = await UiFinder.pWaitForVisible(
      'Waiting for selected menu to appear',
      extrasHook.access().getPopupSink(),
      '.tox-selected-menu .tox-collection--results__js, .tox-selected-menu.tox-collection--results__js'
    );

    // Invariant: aria-controls points to active results
    const inputFieldControlling = Attribute.get(inputField, 'aria-controls');
    const activeResultsId = Attribute.get(activeResults, 'id');
    Assertions.assertEq(
      'Invariant: aria-controls points to active results',
      activeResultsId,
      inputFieldControlling
    );

    // Invariant: aria-activedescendant points to active item
    const activeItem = await UiFinder.pWaitForVisible(
      'Waiting for selected item to appear',
      extrasHook.access().getPopupSink(),
      '.tox-selected-menu .tox-collection__item--active'
    );
    const inputFieldDescendant = Attribute.get(inputField, 'aria-activedescendant');
    const activeItemId = Attribute.get(activeItem, 'id');
    Assertions.assertEq(
      'Invariant: aria-activedescendant points to active item',
      activeItemId,
      inputFieldDescendant
    );

    // Invariant: current item must have aria-selected
    Assertions.assertEq(
      'Invariant: active item must have aria-selected=true',
      'true',
      Attribute.get(activeItem, 'aria-selected')
    );
  };

  it('TINY-8952: Basic key navigation with ARIA', async () => {
    const menuButtonComp = hook.component();

    // Open the dropdown.
    Mouse.click(menuButtonComp.element);
    // That should focus the search widget
    await FocusTools.pTryOnSelector(
      'Waiting until the input has focus',
      hook.root(),
      '.tox-menu input'
    );

    const tmenu = await UiFinder.pWaitForVisible(
      'Waiting until the dropdown appears (it should have appeared already if input has focus',
      hook.body(),
      '.tox-tiered-menu'
    );

    // Now, let's do some structure assertions.
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: true }, [
              structNoPlaceholderSearch,
              structSearchResultsWith([
                structSearchLeafItem({ selected: true }),
                structSearchLeafItem({ selected: false }),
                structSearchParentItem({ selected: false, expanded: false }),
                structSearchParentItem({ selected: false, expanded: false })
              ])
            ])
          ]
        });
      }),
      tmenu
    );
    await pAssertAriaConsistent();

    // Now, let's press down twice, and see if the down is processed by the menu.
    Keyboard.activeKeystroke(hook.root(), Keys.down(), { });
    Keyboard.activeKeystroke(hook.root(), Keys.down(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <down> twice)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: true }, [
              structNoPlaceholderSearch,
              structSearchResultsWith([
                structSearchLeafItem({ selected: false }),
                structSearchLeafItem({ selected: false }),
                structSearchParentItem({ selected: true, expanded: false }),
                structSearchParentItem({ selected: false, expanded: false })
              ])
            ])
          ]
        });
      }),
      tmenu
    );
    await pAssertAriaConsistent();

    // Now, let's press <right>. The expectation is that it is swallowed by the input
    // so it will do nothing.
    Keyboard.activeKeystroke(hook.root(), Keys.right(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <right>)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: true }, [
              structNoPlaceholderSearch,
              structSearchResultsWith([
                structSearchLeafItem({ selected: false }),
                structSearchLeafItem({ selected: false }),
                structSearchParentItem({ selected: true, expanded: false }),
                structSearchParentItem({ selected: false, expanded: false })
              ])
            ])
          ]
        });
      }),
      tmenu
    );
    await pAssertAriaConsistent();

    // Now, let's press <enter>. The expectation is that it should trigger the submenu
    Keyboard.activeKeystroke(hook.root(), Keys.enter(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <enter>)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: false }, [
              structNoPlaceholderSearch,
              structSearchResultsWith([
                structSearchLeafItem({ selected: false }),
                structSearchLeafItem({ selected: false }),
                structSearchParentItem({ selected: true, expanded: true }),
                structSearchParentItem({ selected: false, expanded: false })
              ])
            ]),
            structMenuWith({ selected: true }, [
              s.element('div', {
                children: [
                  structSearchLeafItem({ selected: true }),
                  structSearchLeafItem({ selected: false })
                ]
              })
            ])
          ]
        });
      }),
      tmenu
    );
    await pAssertAriaConsistent();

    // Now let's press <left> and check that it does nothing (swallowed by input)
    Keyboard.activeKeystroke(hook.root(), Keys.left(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <left> which should be ignored)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: false }, [
              structNoPlaceholderSearch,
              structSearchResultsWith([
                structSearchLeafItem({ selected: false }),
                structSearchLeafItem({ selected: false }),
                structSearchParentItem({ selected: true, expanded: true }),
                structSearchParentItem({ selected: false, expanded: false })
              ])
            ]),
            structMenuWith({ selected: true }, [
              s.element('div', {
                children: [
                  structSearchLeafItem({ selected: true }),
                  structSearchLeafItem({ selected: false })
                ]
              })
            ])
          ]
        });
      }),
      tmenu
    );
    await pAssertAriaConsistent();

    // Now let's press <space> and check it does nothing
    Keyboard.activeKeydown(hook.root(), Keys.space(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <space> which should be ignored)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: false }, [
              structNoPlaceholderSearch,
              structSearchResultsWith([
                structSearchLeafItem({ selected: false }),
                structSearchLeafItem({ selected: false }),
                structSearchParentItem({ selected: true, expanded: true }),
                structSearchParentItem({ selected: false, expanded: false })
              ])
            ]),
            structMenuWith({ selected: true }, [
              s.element('div', {
                children: [
                  structSearchLeafItem({ selected: true }),
                  structSearchLeafItem({ selected: false })
                ]
              })
            ])
          ]
        });
      }),
      tmenu
    );
    await pAssertAriaConsistent();
    // Also, make sure <space> didn't close the menu
    UiFinder.exists(hook.body(), '.tox-tiered-menu');

    // Now let's press <escape>, which should collapse the menu back to the third item
    // Remember: <escape> is on keyup currently (2022-08-19)
    Keyboard.activeKeystroke(hook.root(), Keys.escape(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <escape>)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: true }, [
              structNoPlaceholderSearch,
              structSearchResultsWith([
                structSearchLeafItem({ selected: false }),
                structSearchLeafItem({ selected: false }),
                structSearchParentItem({ selected: true, expanded: false }),
                structSearchParentItem({ selected: false, expanded: false })
              ])
            ])
          ]
        });
      }),
      tmenu
    );
    await pAssertAriaConsistent();

    // Now let's press <down> and ensure that it moves the actve focus down to
    // the fourth item.
    Keyboard.activeKeystroke(hook.root(), Keys.down(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <down>)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: true }, [
              structNoPlaceholderSearch,
              structSearchResultsWith([
                structSearchLeafItem({ selected: false }),
                structSearchLeafItem({ selected: false }),
                structSearchParentItem({ selected: false, expanded: false }),
                structSearchParentItem({ selected: true, expanded: false })
              ])
            ])
          ]
        });
      }),
      tmenu
    );
    await pAssertAriaConsistent();

    // Now, press <enter> to open the first submenu for this item
    Keyboard.activeKeystroke(hook.root(), Keys.enter(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <down>)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
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
              s.element('div', {
                children: [
                  structSearchLeafItem({ selected: true }),
                  structSearchLeafItem({ selected: false }),
                  structSearchLeafItem({ selected: false }),
                  structSearchParentItem({ selected: false, expanded: false })
                ]
              })
            ])
          ]
        });
      }),
      tmenu
    );
    await pAssertAriaConsistent();

    // Now, press <up> to select last item
    Keyboard.activeKeystroke(hook.root(), Keys.up(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <down>)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
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
              s.element('div', {
                children: [
                  structSearchLeafItem({ selected: false }),
                  structSearchLeafItem({ selected: false }),
                  structSearchLeafItem({ selected: false }),
                  structSearchParentItem({ selected: true, expanded: false })
                ]
              })
            ])
          ]
        });
      }),
      tmenu
    );
    await pAssertAriaConsistent();

    // And press <enter> to open the submenu for this last item. We should now
    // have three menus open.
    Keyboard.activeKeystroke(hook.root(), Keys.enter(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <enter>)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: false }, [
              structNoPlaceholderSearch,
              structSearchResultsWith([
                structSearchLeafItem({ selected: false }),
                structSearchLeafItem({ selected: false }),
                structSearchParentItem({ selected: false, expanded: false }),
                structSearchParentItem({ selected: true, expanded: true })
              ])
            ]),
            structMenuWith({ selected: false }, [
              s.element('div', {
                children: [
                  structSearchLeafItem({ selected: false }),
                  structSearchLeafItem({ selected: false }),
                  structSearchLeafItem({ selected: false }),
                  // TINY-9000: this is a general TieredMenu bug.
                  // It should be aria-expanded: true
                  structSearchParentItem({ selected: true, expanded: false })
                ]
              })
            ]),
            structMenuWith({ selected: true }, [
              s.element('div', {
                children: [
                  structSearchLeafItem({ selected: true }),
                  structSearchLeafItem({ selected: false })
                ]
              })
            ])
          ]
        });
      }),
      tmenu
    );
    await pAssertAriaConsistent();

    // Now, prepare to do trigger the item with <enter>. Firstly, check the store
    // has no events.
    const store = hook.store();
    store.assertEq('No events should be stored yet', []);
    Keyboard.activeKeystroke(hook.root(), Keys.enter(), { });
    store.assertEq('Item should have been triggered', [
      'Triggering: Person.Email.Work'
    ]);

    // Also check that all menus have disappeared. Don't test
    // for aria consistency
    UiFinder.notExists(hook.body(), '.tox-tiered-menu');

  });

  it('TINY-8952: Basic searching', async () => {
    const menuButtonComp = hook.component();

    const updateInputAndEmit = (newValue: string): void => {
      FocusTools.setActiveValue(hook.root(), newValue);
      FocusTools.getFocused(hook.root()).each((input) => {
        extrasHook.access().getPopupMothership().getByDom(input).each((inputComp) => {
          AlloyTriggers.emit(inputComp, NativeEvents.input());
        });
      });
    };

    // Open the dropdown.
    Mouse.click(menuButtonComp.element);
    // That should focus the search widget
    await FocusTools.pTryOnSelector(
      'Waiting until the input has focus',
      hook.root(),
      '.tox-menu input'
    );

    updateInputAndEmit('Pho');
    await UiFinder.pWaitForVisible(
      'Waiting for the Phone.Home to appear',
      extrasHook.access().getPopupSink(),
      'div:contains(Phone.Home)'
    );

    const tmenu = await UiFinder.pWaitFor(
      'Searching for TieredMenu',
      hook.body(),
      '.tox-tiered-menu'
    );

    Assertions.assertStructure(
      'Expected results after setting search pattern to "Pho"',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: true }, [
              structNoPlaceholderSearch,
              structSearchResultsWith([
                structSearchLeafItem({ selected: true }),
                structSearchLeafItem({ selected: false })
              ])
            ])
          ]
        });
      }),
      tmenu
    );

    // Now, set the value to just P
    updateInputAndEmit('P');
    await UiFinder.pWaitForVisible(
      'Waiting for the Person.Email to appear',
      extrasHook.access().getPopupSink(),
      'div:contains(Person.Email)'
    );

    const refetchedMenu = await UiFinder.pWaitFor(
      'Searching for TieredMenu',
      hook.body(),
      '.tox-tiered-menu'
    );
    Assertions.assertStructure(
      'Expected results after setting search pattern to "P"',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: true }, [
              structNoPlaceholderSearch,
              structSearchResultsWith([
                structSearchLeafItem({ selected: true }),
                structSearchLeafItem({ selected: false }),
                structSearchLeafItem({ selected: false }),
                structSearchLeafItem({ selected: false }),
                structSearchLeafItem({ selected: false }),
                structSearchLeafItem({ selected: false }),
                structSearchLeafItem({ selected: false }),
                structSearchLeafItem({ selected: false })
              ])
            ])
          ]
        });
      }),
      refetchedMenu
    );
  });
});
