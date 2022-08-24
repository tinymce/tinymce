import { Keys, Mouse, RealKeys, UiFinder, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('webdriver.tinymce.themes.silver.editor.menubar.DisabledNestedMenuItemTest', () => {

  const codeMenuItemSelector = '[role="menuitem"]:contains("Code")';
  const preferencesMenuItemSelector = '[title="Preferences"]';
  const servicesMenuItemSelector = '[title="Services"]';
  const highlightedCodeMenuSelector = '.tox-mbtn--active .tox-mbtn__select-label:contains("Code")';
  const highlightedEditMenuSelector = '.tox-mbtn--active .tox-mbtn__select-label:contains("Edit")';
  const disabledClass = '.tox-collection__item--state-disabled';

  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    menu: {
      custom: { title: 'Code', items: 'about restart preferences services' }
    },
    menubar: 'file custom edit',
    setup: (editor: Editor) => {
      editor.ui.registry.addMenuItem('about', {
        text: 'About',
      });

      editor.ui.registry.addMenuItem('restart', {
        text: 'Restart',
      });

      editor.ui.registry.addNestedMenuItem('preferences', {
        text: 'Preferences',
        enabled: false,
        getSubmenuItems: () => [{
          type: 'menuitem',
          text: 'Settings',
        }]
      });

      editor.ui.registry.addNestedMenuItem('services', {
        text: 'Services',
        getSubmenuItems: () => [{
          type: 'menuitem',
          text: 'Services Preferences...',
        }]
      });
    }
  }, []);

  const pOpenCodeMenu = () => {
    TinyUiActions.clickOnMenu(hook.editor(), codeMenuItemSelector);
    return Waiter.pTryUntil('Wait for Code menu to open', () => UiFinder.exists(SugarBody.body(), preferencesMenuItemSelector));
  };

  // two `Escape` to close submenus
  const closeCodeMenu = () => {
    TinyUiActions.keyup(hook.editor(), Keys.escape());
    TinyUiActions.keyup(hook.editor(), Keys.escape());
  };

  const assertPreferencesMenuIsNotOpen = () => {
    UiFinder.notExists(SugarBody.body(), '[role="menuitem"]:contains("Settings")');
  };

  const assertServicesMenuIsOpen = () => {
    UiFinder.exists(SugarBody.body(), '[role="menuitem"]:contains("Services Preferences...")');
  };

  afterEach(() => {
    closeCodeMenu();
  });

  it('TINY-7700: Disabled menu item with children should not open on mouse hover', async () => {
    await pOpenCodeMenu();
    Mouse.hoverOn(SugarBody.body(), preferencesMenuItemSelector);
    assertPreferencesMenuIsNotOpen();
  });

  it('TINY-7700: Disabled menu item with children should not open on keyboard arrow right', async () => {
    await pOpenCodeMenu();
    await RealKeys.pSendKeysOn(preferencesMenuItemSelector, [ RealKeys.combo({}, 'arrowright') ]);
    assertPreferencesMenuIsNotOpen();
  });

  it('TINY-7700: Disabled menu item with children should not navigate to top level menu on keyboard arrow right', async () => {
    await pOpenCodeMenu();
    await RealKeys.pSendKeysOn(preferencesMenuItemSelector, [ RealKeys.combo({}, 'arrowright') ]);
    UiFinder.exists(SugarBody.body(), highlightedCodeMenuSelector);
    UiFinder.notExists(SugarBody.body(), highlightedEditMenuSelector);
  });

  it('TINY-7700: Enabled menu item with children should open on mouse hover', async () => {
    await pOpenCodeMenu();
    Mouse.hoverOn(SugarBody.body(), servicesMenuItemSelector);
    assertServicesMenuIsOpen();
  });

  it('TINY-7700: Enabled menu item with children should open on keyboard arrow right', async () => {
    await pOpenCodeMenu();
    await RealKeys.pSendKeysOn(servicesMenuItemSelector, [ RealKeys.combo({}, 'arrowright') ]);
    assertServicesMenuIsOpen();
  });

  it('TINY-7700: Enabled menu item with children should have arrow icon enabled', async () => {
    await pOpenCodeMenu();
    UiFinder.notExists(SugarBody.body(), `${disabledClass}${servicesMenuItemSelector}`);
    UiFinder.exists(SugarBody.body(), servicesMenuItemSelector);
  });

  it('TINY-7700: Disabled menu item with children should have arrow icon disabled', async () => {
    await pOpenCodeMenu();
    UiFinder.exists(SugarBody.body(), `${disabledClass}${preferencesMenuItemSelector}`);
  });
});
