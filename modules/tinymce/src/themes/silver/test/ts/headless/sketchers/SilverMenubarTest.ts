import { ApproxStructure, Assertions, FocusTools, Keyboard, Keys, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Strings } from '@ephox/katamari';
import { SelectorFind, Selectors, SugarDocument } from '@ephox/sugar';
import { assert } from 'chai';

import SilverMenubar from 'tinymce/themes/silver/ui/menus/menubar/SilverMenubar';

import * as TestExtras from '../../module/TestExtras';

describe('headless.tinymce.themes.silver.sketchers.SilverMenubar Test', () => {
  const extrasHook = TestExtras.bddSetup();

  const hook = TestHelpers.GuiSetup.bddSetup((store, _doc, _body) => GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ 'silvermenubar-test-container' ]
    },
    components: [
      SilverMenubar.sketch({
        dom: {
          tag: 'div',
          classes: [ 'test-menubar' ]
        },
        onEscape: store.adder('Menubar.escape'),
        onSetup: store.adder('Menubar.setup'),
        backstage: extrasHook.access().extras.backstages.popup
      })
    ]
  }));

  const getMenubar = () => {
    const testContainer = hook.component();
    const menubarEl = SelectorFind.descendant(testContainer.element, '.test-menubar').getOrDie('Could not find menubar to test');
    return testContainer.getSystem().getByDom(menubarEl).getOrDie();
  };

  const pAssertFocusOnToggleItem = (itemText: string) =>
    FocusTools.pTryOnSelector(
      'Focus should be on a toggle menu item containing: ' + itemText,
      SugarDocument.getDocument(),
      '.tox-selected-menu [role=menuitemcheckbox]:contains("' + itemText + '")'
    );

  const assertActiveToggleItemHasOneCheckmark = (itemText: string) => {
    UiFinder.findIn(
      extrasHook.access().getPopupSink(),
      '.tox-selected-menu [role=menuitemcheckbox]:contains("' + itemText + '")'
    ).getOrDie();
    const checkMarks = Selectors.all('.tox-collection__item-checkmark');
    assert.lengthOf(checkMarks, 1, 'only one check mark is displayed for active toggled menu items');
  };

  const pAssertFocusOnItem = (itemText: string) =>
    FocusTools.pTryOnSelector(
      'Focus should be on item containing: ' + itemText,
      SugarDocument.getDocument(),
      '.tox-selected-menu [role=menuitem]:contains("' + itemText + '")'
    );

  const pAssertFocusOnMenuButton = (buttonText: string) =>
    FocusTools.pTryOnSelector(
      'Focus should be on menubar button containing: ' + buttonText,
      SugarDocument.getDocument(),
      '[role=menubar] button[role=menuitem]:contains("' + buttonText + '")'
    );

  const pWaitForMenuToAppear = () =>
    // Wait for menu to appear
    Waiter.pTryUntil(
      'Waiting for menu to be in DOM',
      () => UiFinder.exists(extrasHook.access().getPopupSink(), '.tox-menu')
    );

  const pWaitForMenuToDisappear = () =>
    Waiter.pTryUntil(
      'Waiting for menu to NO LONGER be in DOM',
      () => UiFinder.notExists(extrasHook.access().getPopupSink(), '.tox-menu')
    );

  const assertMenuItemGroups = (label: string, groups: string[][], hasIcons: boolean, hasCheckmark: boolean) => {
    const menu = UiFinder.findIn(
      extrasHook.access().getPopupSink(),
      '.tox-selected-menu'
    ).getOrDie();
    Assertions.assertStructure(
      label + '. Checking contents of menu',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        children: Arr.map(groups, (items) => s.element('div', {
          classes: [ arr.has('tox-collection__group') ],
          children: Arr.map(items, (itemText) => {
            // itemText can have a trailing >, which means it has a caret
            const hasCaret = Strings.endsWith(itemText, '>');
            const caretOrCheckmark = hasCaret || hasCheckmark ? [
              s.element('div', {
                classes: [ arr.has(hasCaret ? 'tox-collection__item-caret' : 'tox-collection__item-checkmark') ]
              })
            ] : [];

            return s.element('div', {
              classes: [ arr.has('tox-collection__item') ],
              children: [
                ...hasIcons ? [ s.element('div', { classes: [ arr.has('tox-collection__item-icon') ] }) ] : [],
                s.element('div', {
                  classes: [ arr.has('tox-collection__item-label') ],
                  html: str.is(hasCaret ? itemText.substring(0, itemText.length - 1) : itemText)
                })
              ].concat(caretOrCheckmark)
            });
          })
        }))
      })),
      menu
    );
  };

  it('Check initial event state', () => {
    const store = hook.store();
    store.assertEq('setup should have been called', [ 'Menubar.setup' ]);
  });

  it('Check initial structure for menubar', () => {
    Assertions.assertStructure(
      'Checking initial structure for menubar',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('test-menubar') ],
        attrs: {
          role: str.is('menubar')
        },
        children: []
      })),
      getMenubar().element
    );
  });

  context('with some menubar groups', () => {
    before(() => {
      const store = hook.store();
      SilverMenubar.setMenus(getMenubar(), [
        {
          text: 'Changes',
          getItems: () => [
            {
              type: 'togglemenuitem',
              text: 'Remember me',
              onAction: store.adder('remember.me'),
              onSetup: (api) => {
                // Set twice to check for a bug where two checkmarks appear
                api.setActive(true);
                api.setActive(true);
                return Fun.noop;
              }
            }
          ]
        },
        {
          text: 'Basic Menu Button',
          getItems: () => [
            {
              type: 'menuitem',
              text: 'Item1',
              icon: 'drop',
              onAction: store.adder('menuitem-1-action')
            },
            {
              type: 'separator'
            },
            {
              type: 'menuitem',
              icon: 'drop',
              text: 'Item2',
              onAction: () => {
                store.adder('menuitem-2 action')();
              }
            },
            {
              type: 'nestedmenuitem',
              icon: 'drop',
              text: 'Nested menu',
              getSubmenuItems: () => [
                {
                  type: 'nestedmenuitem',
                  icon: 'drop',
                  text: 'Nested menu x 2',
                  getSubmenuItems: () => [
                    {
                      type: 'menuitem',
                      icon: 'drop',
                      text: 'Nested menu x 3',
                      onAction: Fun.noop
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]);
    });

    beforeEach(() => {
      hook.store().clear();
    });

    it('Check keyboard actions open/close/activate menus', async () => {
      const doc = hook.root();
      const store = hook.store();
      SilverMenubar.focus(getMenubar());

      await pAssertFocusOnMenuButton('Changes');
      Keyboard.activeKeydown(doc, Keys.space());
      await pWaitForMenuToAppear();
      await pAssertFocusOnToggleItem('Remember me');
      assertActiveToggleItemHasOneCheckmark('Remember me');
      Keyboard.activeKeyup(doc, Keys.escape());
      await pAssertFocusOnMenuButton('Changes');
      await pWaitForMenuToDisappear();

      Keyboard.activeKeydown(doc, Keys.right());
      await pAssertFocusOnMenuButton('Basic Menu Button');

      Keyboard.activeKeydown(doc, Keys.space());
      await pWaitForMenuToAppear();
      await pAssertFocusOnItem('Item1');

      Keyboard.activeKeydown(doc, Keys.down());
      await pAssertFocusOnItem('Item2');

      Keyboard.activeKeydown(doc, Keys.down());
      await pAssertFocusOnItem('Nested');

      Keyboard.activeKeydown(doc, Keys.right());
      await pAssertFocusOnItem('Nested menu x 2');

      Keyboard.activeKeydown(doc, Keys.right());
      await pAssertFocusOnItem('Nested menu x 3');

      Keyboard.activeKeydown(doc, Keys.left());
      await pAssertFocusOnItem('Nested menu x 2');

      Keyboard.activeKeyup(doc, Keys.escape());
      await pAssertFocusOnItem('Nested');

      Keyboard.activeKeyup(doc, Keys.escape());
      await pAssertFocusOnMenuButton('Basic Menu Button');
      await pWaitForMenuToDisappear();

      Keyboard.activeKeydown(doc, Keys.enter());
      await pWaitForMenuToAppear();
      await pAssertFocusOnItem('Item1');

      Keyboard.activeKeydown(doc, Keys.up());
      await pAssertFocusOnItem('Nested');
      Keyboard.activeKeydown(doc, Keys.enter());
      await pAssertFocusOnItem('Nested menu x 2');

      Keyboard.activeKeyup(doc, Keys.escape());
      await pAssertFocusOnItem('Nested');
      Keyboard.activeKeydown(doc, Keys.up());
      Keyboard.activeKeydown(doc, Keys.enter());

      // Pressing <enter> on an item without a submenu should trigger it and close the menu',
      await pWaitForMenuToDisappear();
      store.assertEq('Store should have evidence of item triggered', [ 'menuitem-2 action' ]);

      store.clear();
      SilverMenubar.focus(getMenubar());
      await pAssertFocusOnMenuButton('Changes');

      Keyboard.activeKeyup(doc, Keys.escape());
      store.assertEq('Pressing escape in menubar should fire event', [ 'Menubar.escape' ]);
    });

    it('AP-307: Once a menu is expanded, hovering on buttons should switch which menu is expanded', async () => {
      const doc = hook.root();
      const menubar = getMenubar();
      const sink = extrasHook.access().getPopupSink();
      Mouse.hoverOn(menubar.element, 'button[role="menuitem"]:contains("Basic Menu Button")');
      await Waiter.pWait(100);
      UiFinder.notExists(sink, '[role="menu"]');
      Mouse.clickOn(menubar.element, 'button[role="menuitem"]:contains("Changes")');
      await UiFinder.pWaitForVisible(
        'Waiting for changes menu',
        sink,
        '.tox-collection__item:contains("Remember me")'
      );
      assertMenuItemGroups('After clicking on "Changes"', [
        [ 'Remember me' ]
      ], false, true);

      Mouse.hoverOn(menubar.element, 'button[role="menuitem"]:contains("Basic Menu Button")');
      await UiFinder.pWaitForVisible(
        'Waiting for basic menu',
        sink,
        '.tox-collection__item:contains("Item1")'
      );
      // Focus the menu item, not the toolbar item
      Keyboard.activeKeydown(doc, Keys.down());
      await UiFinder.pWaitForVisible(
        'Wait for basic menu to get selected class',
        sink,
        '.tox-selected-menu .tox-collection__item:contains("Item1")'
      );
      // This is failing because tox-selected-menu is not set.
      assertMenuItemGroups('After hovering on Basic (after another menu was open)', [
        [ 'Item1' ],
        [ 'Item2', 'Nested menu>' ]
      ], true, false);
    });
  });
});
