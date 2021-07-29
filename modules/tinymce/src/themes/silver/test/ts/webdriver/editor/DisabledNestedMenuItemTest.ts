import { Keys, Mouse, RealKeys, UiFinder, Waiter } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';

import { Editor } from 'tinymce/core/api/PublicApi';
import Theme from 'tinymce/themes/silver/Theme';

describe('webdriver.tinymce.themes.silver.editor.menubar.DisabledNestedMenuItemTest', () => {

  const preferencesMenuItemSelector = '[title="Preferences"]';
  const codeMenuItemSelector = '[role="menuitem"]:contains("Code")';

  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    menu: {
      custom: { title: 'Code', items: 'about restart preferences' }
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
        getSubmenuItems: () => {
          return [
            {
              type: 'menuitem',
              text: 'Settings',
            }
          ];
        }
      });
    }
  }, [ Theme ]);

  const pOpenCodeMenu = () => {
    const editor = hook.editor();
    TinyUiActions.keydown(editor, Keys.escape()); // to close "Code" menu before opening
    TinyUiActions.clickOnMenu(editor, codeMenuItemSelector);
    return Waiter.pTryUntil('Wait for Code menu to open', () => UiFinder.exists(SugarBody.body(), preferencesMenuItemSelector));
  };

  beforeEach(async () => {
    await pOpenCodeMenu();
  });

  const assertPreferencesMenuIsNotOpen = () => {
    UiFinder.notExists(SugarBody.body(), '[role="menuitem"]:contains("Settings")');
  };

  it('TINY-7700: Disabled menu item with children should not open on mouse hover', () => {
    Mouse.hoverOn(SugarBody.body(), '[role="menuitem"]:contains("Preferences")');
    assertPreferencesMenuIsNotOpen();
  });

  it('TINY-7700: Disabled menu item with children should not open on keyboard arrow right', async () => {
    await RealKeys.pSendKeysOn(preferencesMenuItemSelector, [ RealKeys.combo({}, 'arrowright') ]);
    assertPreferencesMenuIsNotOpen();
  });
});
