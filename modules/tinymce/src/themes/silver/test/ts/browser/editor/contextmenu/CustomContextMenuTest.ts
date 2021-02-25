import { Keyboard, Keys, UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/mcagar';
import { SugarBody, SugarDocument } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.editor.contextmenu.CustomContextMenuTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, [ Theme ], true);

  before(() => {
    const editor = hook.editor();
    editor.ui.registry.addMenuItem('customMenuItem', {
      icon: 'image',
      text: 'Custom Context Menu',
    });
    editor.ui.registry.addContextMenu('customContextMenu', {
      update: () => 'customMenuItem'
    });
  });

  const closeContextMenu = async () => {
    Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.escape());
    await Waiter.pTryUntil('Close context menu', () => UiFinder.notExists(SugarBody.body(), 'div[role="menu"]'));
  };

  it('TINY-7072: Support custom context menu items with lowercase names', async () => {
    const editor = hook.editor();
    editor.settings.contextmenu = 'customcontextmenu';
    editor.setContent('<p><a href="http://tiny.cloud/">Tiny</a></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 'Ti'.length);
    await TinyUiActions.pTriggerContextMenu(editor, 'a', '.tox-silver-sink .tox-menu.tox-collection [role="menuitem"]');
    UiFinder.exists(SugarBody.body(), '.tox-collection__item-label:contains("Custom Context Menu")');
    await closeContextMenu();
  });

  it('TINY-7072: Support custom context menu items with mixed case names', async () => {
    const editor = hook.editor();
    editor.settings.contextmenu = 'customContextMenu';
    editor.setContent('<p><a href="http://tiny.cloud/">Tiny</a></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 'Ti'.length);
    await TinyUiActions.pTriggerContextMenu(editor, 'a', '.tox-silver-sink .tox-menu.tox-collection [role="menuitem"]');
    UiFinder.exists(SugarBody.body(), '.tox-collection__item-label:contains("Custom Context Menu")');
    await closeContextMenu();
  });
});
