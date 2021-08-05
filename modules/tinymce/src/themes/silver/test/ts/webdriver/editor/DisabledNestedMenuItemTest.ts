import { Keys, Mouse, RealKeys, UiFinder, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { Css, SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import { Editor } from 'tinymce/core/api/PublicApi';
import Theme from 'tinymce/themes/silver/Theme';

describe('webdriver.tinymce.themes.silver.editor.menubar.DisabledNestedMenuItemTest', () => {

  const codeMenuItemSelector = '[role="menuitem"]:contains("Code")';
  const preferencesMenuItemSelector = '[title="Preferences"]';
  const servicesMenuItemSelector = '[title="Services"]';
  const rightArrowSelector = '.tox-collection__item-caret svg';
  const disabledColour = 'rgba(34, 47, 62, 0.5)';
  const enabledColour = 'rgb(34, 47, 62)';
  const highligthedCodeMenuSelector = '.tox-mbtn--active .tox-mbtn__select-label:contains("Code")';
  const highligthedToolsMenuSelector = '.tox-mbtn--active .tox-mbtn__select-label:contains("Tools")';

  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'code',
    menu: {
      custom: { title: 'Code', items: 'about restart preferences services' }
    },
    menubar: 'file custom tools',
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

  // two `Escape` to close submenus
  const closeCodeMenu = () => {
    TinyUiActions.keydown(hook.editor(), Keys.escape());
    TinyUiActions.keydown(hook.editor(), Keys.escape());
  };

  const assertPreferencesMenuIsNotOpen = () => {
    UiFinder.notExists(SugarBody.body(), '[role="menuitem"]:contains("Settings")');
  };

  const assertServicesMenuIsOpen = () => {
    UiFinder.exists(SugarBody.body(), '[role="menuitem"]:contains("Services Preferences...")');
  };

  const getMenuItemRightArrow = (menuItemSelector: string): SugarElement<SVGElement> => {
    const menuItem = UiFinder.findIn(SugarBody.body(), menuItemSelector).getOrDie();
    return UiFinder.findIn(menuItem, rightArrowSelector).getOrDie();
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
    UiFinder.exists(SugarBody.body(), highligthedCodeMenuSelector);
    UiFinder.notExists(SugarBody.body(), highligthedToolsMenuSelector);
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
    const servicesMenuItemRightArrow = getMenuItemRightArrow(servicesMenuItemSelector);
    assert.equal(Css.get(servicesMenuItemRightArrow, 'fill'), enabledColour);
  });

  it('TINY-7700: Disabled menu item with children should have arrow icon disabled', async () => {
    await pOpenCodeMenu();
    const preferencesMenuItemRightArrow = getMenuItemRightArrow(preferencesMenuItemSelector);
    assert.equal(Css.get(preferencesMenuItemRightArrow, 'fill'), disabledColour);
  });
});
