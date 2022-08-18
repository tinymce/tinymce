import { ApproxStructure, Assertions, FocusTools, Keyboard, Keys, Mouse, UiFinder } from '@ephox/agar';
import { AlloyTriggers, GuiFactory, NativeEvents, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Toolbar } from '@ephox/bridge';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { Attribute, SugarDocument, SugarElement } from '@ephox/sugar';

import { renderMenuButton } from 'tinymce/themes/silver/ui/button/MenuButton';

import { structMenuWith, structSearchField, structSearchLeafItem, structSearchParentItem, structSearchResultsWith } from '../../module/CommonMenuTestStructures';
import * as TestExtras from '../../module/TestExtras';

const fetch = (store: TestHelpers.TestStore): Toolbar.ToolbarMenuButtonSpec['fetch'] => (callback, fetchContext) => {
  const makeMailMerge = (info: { value: string; title?: string}) => ({
    type: 'menuitem',
    text: info.title ?? info.value,
    onAction: () => {
      store.adder('Triggering: ' + info.value)();
    }
  });

  const makeCategory = (title: string, items: any[]) => ({
    type: 'nestedmenuitem',
    text: title,
    getSubmenuItems: () => items
  });

  const currentDateMerge = {
    value: 'Current.Date',
    title: 'Current date in DD/MM/YYYY format'
  };

  const tocMerge = {
    value: 'Campaign.Toc',
    title: 'Linked table of contents in your campaign'
  };

  const phoneHomeMerge = { value: 'Phone.Home' };
  const phoneWorkMerge = { value: 'Phone.Work' };

  const personFirstnameMerge = { value: 'Person.Name.First' };
  const personSurnameMerge = { value: 'Person.Name.Last' };
  const personFullnameMerge = { value: 'Person.Name.Full' };

  const personWorkEmail = { value: 'Person.Email.Work' };
  const personHomeEmail = { value: 'Person.Email.Home' };

  if (!fetchContext || (fetchContext && fetchContext.pattern.length === 0)) {
    callback([
      makeMailMerge(currentDateMerge),
      makeMailMerge(tocMerge),
      makeCategory(
        'Phone',
        [
          makeMailMerge(phoneHomeMerge),
          makeMailMerge(phoneWorkMerge)
        ]
      ),
      makeCategory(
        'Person',
        [
          makeMailMerge(personFirstnameMerge),
          makeMailMerge(personSurnameMerge),
          makeMailMerge(personFullnameMerge),
          makeCategory(
            'Email',
            [
              makeMailMerge(personWorkEmail),
              makeMailMerge(personHomeEmail)
            ]
          )
        ]
      )
    ] as any);
  } else {
    const allMerges: Array<{value: string; title?: string}> = [
      currentDateMerge,
      tocMerge,
      phoneHomeMerge,
      phoneWorkMerge,
      personFirstnameMerge,
      personSurnameMerge,
      personFullnameMerge,
      personWorkEmail,
      personHomeEmail
    ];

    const matches = Arr.filter(allMerges, (m): boolean => {
      const valueMatches = m.value.toLowerCase().indexOf(fetchContext.pattern.toLowerCase()) > -1;
      return valueMatches || (
        m.title !== undefined && (m.title.toLowerCase().indexOf(fetchContext.pattern.toLowerCase()) > -1)
      );
    });

    if (matches.length > 0) {
      callback(
        Arr.map(matches, makeMailMerge) as any
      );
    } else {
      callback([
        {
          type: 'menuitem',
          text: 'No Results',
          enabled: false,
          onAction: () => {
            // eslint-disable-next-line no-console
            console.log('No results');
          }
        }
      ]);
    }
  }
};

// TODO: These are generic

describe('headless.tinymce.themes.silver.toolbar.SearchableMenuButtonTest', () => {
  const helpers = TestExtras.bddSetup();

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

  const hook = TestHelpers.GuiSetup.bddSetup(
    (store, _doc, _body) => GuiFactory.build(
      renderMenuButton(
        {
          text: Optional.some('MailMerge'),
          icon: Optional.none(),
          tooltip: Optional.none(),
          onSetup: Fun.constant(Fun.noop),
          searchable: true,
          fetch: fetch(store)
        },
        'prefix',
        helpers.backstage(),
        Optional.none()
      )
    )

  );

  const assertAriaConsistent = async () => {
    // So find the field.
    const inputField: SugarElement<HTMLElement> = await UiFinder.pWaitForVisible(
      'Waiting for search widget to appear (testing aria consistency)',
      helpers.uiMothership().element,
      '.tox-menu input'
    );

    const activeResults = await UiFinder.pWaitForVisible(
      'Waiting for selected menu to appear',
      helpers.uiMothership().element,
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
      helpers.uiMothership().element,
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

  it('Basic key navigation with ARIA', async () => {
    const menuButtonComp = hook.component();

    // Open the dropdown.
    Mouse.click(menuButtonComp.element);
    // That should focus the search widget
    FocusTools.pTryOnSelector(
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
              structSearchField(''),
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
    await assertAriaConsistent();

    // Now, let's press down twice, and see if the down is processed by the menu.
    Keyboard.activeKeystroke(hook.root(), Keys.down(), { });
    Keyboard.activeKeystroke(hook.root(), Keys.down(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <down> twice)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: true }, [
              structSearchField(''),
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
    await assertAriaConsistent();

    // Now, let's press <right>. The expectation is that it is swallowed by the input
    // so it will do nothing.
    Keyboard.activeKeystroke(hook.root(), Keys.right(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <right>)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: true }, [
              structSearchField(''),
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
    await assertAriaConsistent();

    // Now, let's press <enter>. The expectation is that it should trigger the submenu
    Keyboard.activeKeystroke(hook.root(), Keys.enter(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <enter>)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: false }, [
              structSearchField(''),
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
    await assertAriaConsistent();

    // Now let's press <left> and check that it does nothing (swallowed by input)
    Keyboard.activeKeystroke(hook.root(), Keys.left(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <left> which should be ignored)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: false }, [
              structSearchField(''),
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
    await assertAriaConsistent();

    // Now let's press <space> and check it does nothing
    Keyboard.activeKeydown(hook.root(), Keys.space(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <space> which should be ignored)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: false }, [
              structSearchField(''),
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
    await assertAriaConsistent();
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
              structSearchField(''),
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
    await assertAriaConsistent();

    // Now let's press <down> and ensure that it moves the actve focus down to
    // the fourth item.
    Keyboard.activeKeystroke(hook.root(), Keys.down(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <down>)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: true }, [
              structSearchField(''),
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
    await assertAriaConsistent();

    // Now, press <enter> to open the first submenu for this item
    Keyboard.activeKeystroke(hook.root(), Keys.enter(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <down>)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: false }, [
              structSearchField(''),
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
    await assertAriaConsistent();

    // Now, press <up> to select last item
    Keyboard.activeKeystroke(hook.root(), Keys.up(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <down>)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: false }, [
              structSearchField(''),
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
    await assertAriaConsistent();

    // And press <enter> to open the submenu for this last item. We should now
    // have three menus open.
    Keyboard.activeKeystroke(hook.root(), Keys.enter(), { });
    Assertions.assertStructure(
      'Checking structure of mailmerge dropdown (after pressing <enter>)',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: false }, [
              structSearchField(''),
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
                  // This expanded=false looks like a bug. The submenu is
                  // still expanded! But our formatting menus are the same.
                  // INVESTIGATE
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
    await assertAriaConsistent();

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

  it('Basic searching', async () => {
    const menuButtonComp = hook.component();

    const updateInputAndEmit = (newValue: string): void => {
      FocusTools.setActiveValue(hook.root(), newValue);
      FocusTools.getFocused(hook.root()).each((input) => {
        helpers.uiMothership().getByDom(input).each((inputComp) => {
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
      helpers.uiMothership().element,
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
              structSearchField(''),
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
      helpers.uiMothership().element,
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
              structSearchField(''),
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