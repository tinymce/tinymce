import { FocusTools, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyContentActions, TinyHooks, TinyUi, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/searchreplace/Plugin';

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
  }, [ Plugin ], true);

  const doc = SugarDocument.getDocument();

  const pressTab = (editor: Editor) => TinyUiActions.keydown(editor, Keys.tab());
  const pressEsc = (editor: Editor) => TinyUiActions.keyup(editor, Keys.escape());
  const pressDown = (editor: Editor) => TinyUiActions.keydown(editor, Keys.down());
  const pressRight = (editor: Editor) => TinyUiActions.keydown(editor, Keys.right());
  const pressEnter = (editor: Editor) => TinyUiActions.keydown(editor, Keys.enter());

  const focusToolbar = (editor: Editor) => TinyContentActions.keydown(editor, 120, { altKey: true });

  const pAssertFocused = (name: string, selector: string) => FocusTools.pTryOnSelector(name, doc, selector);

  it('TINY-3914: Reaching find and replace via the keyboard', async () => {
    const editor = hook.editor();
    focusToolbar(editor);
    await pAssertFocused('File', '.tox-mbtn:contains("File")');
    pressRight(editor);
    await pAssertFocused('Edit', '.tox-mbtn:contains("Edit")');
    pressDown(editor); // select all
    await TinyUiActions.pWaitForPopup(editor, '.tox-menu');
    pressDown(editor); // find and replace
    await pAssertFocused('Find and replace edit menu item', '.tox-collection__item:contains("Find and replace")'); // Menu item can be reached by keyboard
    pressEsc(editor);
    pressTab(editor);
    await pAssertFocused('Find and replace button', '.tox-tbtn'); // Button can be reached by keyboard
  });

  it('TINY-3914: Dialog keyboard navigation', async () => {
    const editor = hook.editor();
    await Utils.pOpenDialog(editor);
    await pAssertFocused('Find input', '.tox-textfield[placeholder="Find"]');
    pressTab(editor);
    await pAssertFocused('Replace with input', '.tox-textfield[placeholder="Replace with"]');
    pressTab(editor);
    await pAssertFocused('Placeholder menu button', '.tox-tbtn--select[title="Preferences"]');
    pressDown(editor);
    await pAssertFocused('Match case menu item', '.tox-collection__item:contains("Match case")'); // Menu items can be reached by keyboard
    pressEnter(editor);
    await pAssertFocused('Placeholder menu button', '.tox-tbtn--select[title="Preferences"]');
    pressTab(editor);
    await pAssertFocused('Find button', '.tox-button[title="Find"]');
    pressEsc(editor);
  });

  it('TINY-3961: Dialog keyboard focus is returned to find input', async () => {
    const editor = hook.editor();
    editor.setContent('<p>fish fish fish</p>');
    await Utils.pOpenDialog(editor);
    await pAssertFocused('Find input', '.tox-textfield[placeholder="Find"]');
    pressTab(editor);
    await pAssertFocused('Replace with input', '.tox-textfield[placeholder="Replace with"]');
    pressTab(editor);
    await pAssertFocused('Placeholder menu button', '.tox-tbtn--select[title="Preferences"]');
    pressTab(editor);
    await pAssertFocused('Find button', '.tox-button[title="Find"]');
    await Utils.pSetFieldValue(editor, 'input.tox-textfield[placeholder="Find"]', 'fish');
    pressEnter(editor);
    pressTab(editor);
    await pAssertFocused('Find button', '.tox-button[title="Replace"]');
    pressTab(editor);
    await pAssertFocused('Find button', '.tox-button[title="Replace all"]');
    pressEnter(editor);
    await pAssertFocused('Find input', '.tox-textfield[placeholder="Find"]');
    pressEsc(editor);
  });

  it('TINY-4014: Dialog keyboard focus is returned to find input after displaying an alert', async () => {
    const editor = hook.editor();
    editor.setContent('<p>fish fish fish</p>');
    await Utils.pOpenDialog(editor);
    await pAssertFocused('Find input', '.tox-textfield[placeholder="Find"]');
    await Utils.pSetFieldValue(editor, 'input.tox-textfield[placeholder="Find"]', 'notfound');
    pressEnter(editor);
    await TinyUi(editor).pWaitForUi('.tox-notification.tox-notification--error:contains("Could not find the specified string.")');
    await pAssertFocused('Find input', '.tox-textfield[placeholder="Find"]');
    pressEsc(editor);
  });
});
