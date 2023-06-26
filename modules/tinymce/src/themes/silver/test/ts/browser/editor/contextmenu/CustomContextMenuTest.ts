import { Keyboard, Keys, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.contextmenu.CustomContextMenuTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, [], true);

  const pOpenContextMenu = async (editor: Editor, selector: string) =>
    await TinyUiActions.pTriggerContextMenu(editor, selector, '.tox-silver-sink .tox-menu.tox-collection [role="menuitem"]');

  const pCloseContextMenu = async () => {
    Keyboard.activeKeyup(SugarDocument.getDocument(), Keys.escape());
    await Waiter.pTryUntil('Close context menu', () => UiFinder.notExists(SugarBody.body(), 'div[role="menu"]'));
  };

  context('Menu item names', () => {
    before(() => {
      const editor = hook.editor();
      editor.ui.registry.addMenuItem('customMenuItem', {
        icon: 'image',
        text: 'Custom Context Menu',
      });
      editor.ui.registry.addContextMenu('customContextMenu', {
        update: Fun.constant('customMenuItem')
      });
    });

    it('TINY-7072: Support custom context menu items with lowercase names', async () => {
      const editor = hook.editor();
      editor.options.set('contextmenu', 'customcontextmenu');
      editor.setContent('<p>Tiny</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 'Ti'.length);
      await pOpenContextMenu(editor, 'p');
      UiFinder.exists(SugarBody.body(), '.tox-collection__item-label:contains("Custom Context Menu")');
      await pCloseContextMenu();
    });

    it('TINY-7072: Support custom context menu items with mixed case names', async () => {
      const editor = hook.editor();
      editor.options.set('contextmenu', 'customcontextmenu');
      editor.setContent('<p>Tiny</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 'Ti'.length);
      await pOpenContextMenu(editor, 'p');
      UiFinder.exists(SugarBody.body(), '.tox-collection__item-label:contains("Custom Context Menu")');
      await pCloseContextMenu();
    });
  });

  context('Menu item properties', () => {
    before(() => {
      const editor = hook.editor();
      editor.options.set('contextmenu', 'customcontextmenu');
      editor.ui.registry.addContextMenu('customContextMenu', {
        update: () => [
          {
            type: 'submenu',
            text: 'customSubMenuItem',
            shortcut: 'custom-shortcut',
            enabled: true,
            getSubmenuItems: () => [
              {
                text: 'disabledCustomNestedMenuItem',
                enabled: false,
              },
              {
                text: 'customNestedMenuItem',
                shortcut: 'custom-nested-shortcut',
                enabled: true,
              }
            ],
          },
          {
            text: 'disabledCustomMenuItem',
            enabled: false,
          }
        ],
      });
    });

    it('TINY-7073: Support for disabled property on menu items', async () => {
      const editor = hook.editor();
      editor.setContent('<p>Tiny</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 'Ti'.length);
      await pOpenContextMenu(editor, 'p');
      // Open submenu
      Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.right());
      await Waiter.pTryUntil('menu items visible', () => {
        UiFinder.exists(SugarBody.body(), 'div[title="customSubMenuItem"][aria-disabled="false"]');
        UiFinder.exists(SugarBody.body(), 'div[title="disabledCustomNestedMenuItem"][aria-disabled="true"]');
        UiFinder.exists(SugarBody.body(), 'div[title="customNestedMenuItem"][aria-disabled="false"]');
        UiFinder.exists(SugarBody.body(), 'div[title="disabledCustomMenuItem"][aria-disabled="true"]');
      });
    });

    it('TINY-7073: Support shortcut property on menu items', async () => {
      const editor = hook.editor();
      editor.setContent('<p>Tiny</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 'Ti'.length);
      await pOpenContextMenu(editor, 'p');
      // Open submenu
      Keyboard.activeKeydown(SugarDocument.getDocument(), Keys.right());
      await Waiter.pTryUntil('menu items visible', () => {
        UiFinder.exists(SugarBody.body(), 'div[title="customSubMenuItem"] div.tox-collection__item-accessory:contains("custom-shortcut")');
        UiFinder.exists(SugarBody.body(), 'div[title="customNestedMenuItem"] div.tox-collection__item-accessory:contains("custom-nested-shortcut")');
      });
    });
  });

  context('Multiple empty context menus', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
    }, [], true);
    before(() => {
      const editor = hook.editor();
      editor.ui.registry.addContextMenu('one', {
        update: Fun.constant('')
      });
      editor.ui.registry.addContextMenu('two', {
        update: Fun.constant('')
      });
      editor.ui.registry.addContextMenu('three', {
        update: Fun.constant('')
      });
      editor.options.set('contextmenu', 'one two three');
    });

    it('TINY-9842: Multiple empty custom context menus should fallback to native context menu', () => {
      const editor = hook.editor();
      editor.setContent('abc');
      TinySelections.setCursor(editor, [ 0, 0 ], 2);
      Mouse.contextMenuOn(TinyDom.body(editor), 'p');
      UiFinder.exists(SugarBody.body(), '.tox.tox-silver-sink.tox-tinymce-aux:empty');
    });
  });
});
