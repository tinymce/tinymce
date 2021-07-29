import { Keys, Mouse, RealKeys, UiFinder, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';

import { Editor } from 'tinymce/core/api/PublicApi';
import Theme from 'tinymce/themes/silver/Theme';

describe('webdriver.tinymce.themes.silver.editor.menubar.DisabledNestedMenuItemTest', () => {

  const preferencesMenuItemSelector = '[title="Preferences"]';
  const servicesMenuItemSelector = '[title="Services"]';
  const codeMenuItemSelector = '[role="menuitem"]:contains("Code")';

  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    menu: {
      custom: { title: 'Code', items: 'about restart preferences services' }
    },
    menubar: 'custom',
    setup: (editor: Editor) => {
      editor.ui.registry.addMenuItem('about', {
        text: 'About',
      });

      editor.ui.registry.addMenuItem('restart', {
        text: 'Restart',
      });

      editor.ui.registry.addNestedMenuItem('preferences', {
        text: 'Preferences',
        disabled: true,
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
  }, [ Theme ]);

  const pOpenCodeMenu = () => {
    TinyUiActions.clickOnMenu(hook.editor(), codeMenuItemSelector);
    return Waiter.pTryUntil('Wait for Code menu to open', () => UiFinder.exists(SugarBody.body(), preferencesMenuItemSelector));
  };

  const closeCodeMenu = () => {
    TinyUiActions.keydown(hook.editor(), Keys.escape());
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
    Mouse.hoverOn(SugarBody.body(), '[role="menuitem"]:contains("Preferences")');
    assertPreferencesMenuIsNotOpen();
  });

  it('TINY-7700: Disabled menu item with children should not open on keyboard arrow right', async () => {
    await pOpenCodeMenu();
    await RealKeys.pSendKeysOn(preferencesMenuItemSelector, [ RealKeys.combo({}, 'arrowright') ]);
    assertPreferencesMenuIsNotOpen();
  });

  it('TINY-7700: Enabled menu item with children should open on mouse hover', async () => {
    await pOpenCodeMenu();
    Mouse.hoverOn(SugarBody.body(), '[role="menuitem"]:contains("Services")');
    assertServicesMenuIsOpen();
  });

  it('TINY-7700: Enabled menu item with children should open on keyboard arrow right', async () => {
    await pOpenCodeMenu();
    await RealKeys.pSendKeysOn(servicesMenuItemSelector, [ RealKeys.combo({}, 'arrowright') ]);
    assertServicesMenuIsOpen();
  });
});
