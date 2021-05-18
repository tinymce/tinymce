import { FocusTools, Keyboard, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { SugarDocument } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import Plugin from 'tinymce/plugins/searchreplace/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.searchreplace.SearchReplaceKeyboardNavigationTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'searchreplace',
    toolbar: 'searchreplace',
    menubar: 'file edit',
    menu: {
      file: { title: 'File', items: 'newdocument' },
      edit: { title: 'Edit', items: 'selectall searchreplace' }
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

  const doc = SugarDocument.getDocument();

  const pressTab = () => Keyboard.activeKeydown(doc, Keys.tab());
  const pressEsc = () => Keyboard.activeKeydown(doc, Keys.escape());
  const pressDown = () => Keyboard.activeKeydown(doc, Keys.down());
  const pressRight = () => Keyboard.activeKeydown(doc, Keys.right());
  const pressEnter = () => Keyboard.activeKeydown(doc, Keys.enter());

  const focusToolbar = (editor: Editor) => {
    const args = Tools.extend({
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false
    }, { altKey: true, keyCode: 120 });
    editor.fire('keydown', args);
  };

  const pAssertFocused = (name: string, selector: string) => FocusTools.pTryOnSelector(name, doc, selector);

  it('TINY-3914: Reaching find and replace via the keyboard', async () => {
    const editor = hook.editor();
    focusToolbar(editor);
    await pAssertFocused('File', '.tox-mbtn:contains("File")');
    pressRight();
    await pAssertFocused('Edit', '.tox-mbtn:contains("Edit")');
    pressDown(); // select all
    await TinyUiActions.pWaitForPopup(editor, '.tox-menu');
    pressDown(); // find and replace
    await pAssertFocused('Find and replace edit menu item', '.tox-collection__item:contains("Find and replace")'); // Menu item can be reached by keyboard
    pressEsc();
    pressTab();
    await pAssertFocused('Find and replace button', '.tox-tbtn'); // Button can be reached by keyboard
  });

  it('TINY-3914: Dialog keyboard navigation', async () => {
    const editor = hook.editor();
    await Utils.pOpenDialog(editor);
    await pAssertFocused('Find input', '.tox-textfield[placeholder="Find"]');
    pressTab();
    await pAssertFocused('Replace with input', '.tox-textfield[placeholder="Replace with"]');
    pressTab();
    await pAssertFocused('Placeholder menu button', '.tox-tbtn--select[title="Preferences"]');
    pressDown();
    await pAssertFocused('Match case menu item', '.tox-collection__item:contains("Match case")'); // Menu items can be reached by keyboard
    pressEnter();
    await pAssertFocused('Placeholder menu button', '.tox-tbtn--select[title="Preferences"]');
    pressTab();
    await pAssertFocused('Find button', '.tox-button[title="Find"]');
    pressEsc();
  });

  it('TINY-3961: Dialog keyboard focus is returned to find input', async () => {
    const editor = hook.editor();
    editor.setContent('<p>fish fish fish</p>');
    await Utils.pOpenDialog(editor);
    await pAssertFocused('Find input', '.tox-textfield[placeholder="Find"]');
    pressTab();
    await pAssertFocused('Replace with input', '.tox-textfield[placeholder="Replace with"]');
    pressTab();
    await pAssertFocused('Placeholder menu button', '.tox-tbtn--select[title="Preferences"]');
    pressTab();
    await pAssertFocused('Find button', '.tox-button[title="Find"]');
    await Utils.pSetFieldValue(editor, 'input.tox-textfield[placeholder="Find"]', 'fish');
    pressEnter();
    pressTab();
    await pAssertFocused('Find button', '.tox-button[title="Replace"]');
    pressTab();
    await pAssertFocused('Find button', '.tox-button[title="Replace all"]');
    pressEnter();
    await pAssertFocused('Find input', '.tox-textfield[placeholder="Find"]');
    pressEsc();
  });

  it('TINY-4014: Dialog keyboard focus is returned to find input after displaying an alert', async () => {
    const editor = hook.editor();
    editor.setContent('<p>fish fish fish</p>');
    await Utils.pOpenDialog(editor);
    await pAssertFocused('Find input', '.tox-textfield[placeholder="Find"]');
    await Utils.pSetFieldValue(editor, 'input.tox-textfield[placeholder="Find"]', 'notfound');
    pressEnter();
    await pAssertFocused('Alert dialog OK button', '.tox-alert-dialog .tox-button[title="OK"]');
    pressEnter();
    await pAssertFocused('Find input', '.tox-textfield[placeholder="Find"]');
    pressEsc();
  });
});
