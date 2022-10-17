import { UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/quickbars/Plugin';

describe('browser.tinymce.plugins.quickbars.ContentEditableTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'quickbars link',
    inline: true,
    toolbar: false,
    menubar: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const pAssertToolbarVisible = () => Waiter.pTryUntil('toolbar should exist', () => UiFinder.exists(SugarBody.body(), '.tox-toolbar'));

  const pAssertToolbarNotVisible = async () => {
    await Waiter.pWait(50);
    UiFinder.notExists(SugarBody.body(), '.tox-pop__dialog .tox-toolbar');
  };

  it('TBA: Text selection toolbar is not shown with contenteditable=false', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p><p contenteditable="false">cab</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    await pAssertToolbarVisible();
    TinySelections.select(editor, 'p[contenteditable=false]', []);
    await pAssertToolbarNotVisible();
  });

  it('TBA: Text selection toolbar is not shown with contenteditable=false parent, select parent', async () => {
    const editor = hook.editor();
    editor.setContent('<div><p>abc</p></div><div contenteditable="false"><p>cab</p></div>');
    TinySelections.select(editor, 'div', []);
    await pAssertToolbarVisible();
    TinySelections.select(editor, 'div[contenteditable=false]', []);
    await pAssertToolbarNotVisible();
  });

  it('TBA: Text selection toolbar is not shown with contenteditable=false parent, select child of parent', async () => {
    const editor = hook.editor();
    editor.setContent('<div><p>abc</p></div><div contenteditable="false"><p>cab</p></div>');
    TinySelections.select(editor, 'div p', []);
    await pAssertToolbarVisible();
    TinySelections.select(editor, 'div[contenteditable=false] p', []);
    await pAssertToolbarNotVisible();
  });

  it('TBA: Text selection toolbar is not shown with contenteditable=false span, select span', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p><p>abc <span contenteditable="false">click on me</span> 123</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    await pAssertToolbarVisible();
    TinySelections.select(editor, 'p span', []);
    await pAssertToolbarNotVisible();
  });

  it('TINY-9190: Toolbar is not shown in the fake caret', async () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false">CEF element</p>');
    // Selection is in the fake caret
    TinyAssertions.assertCursor(editor, [ 0 ], 0);
    TinyAssertions.assertContentPresence(editor, { 'p[data-mce-bogus="all"]': 1, 'p[data-mce-caret="before"]': 1 });
    await pAssertToolbarNotVisible();
  });

  it('TINY-9190: Toolbar is not shown when the parent element has data-mce-bogus="all"', async () => {
    const editor = hook.editor();
    editor.setContent('<p>one two three <span data-mce-bogus="all"><span><span></span></span></span></p>', { format: 'raw' });
    // Set selection in the deepest span
    TinySelections.setSelection(editor, [ 0, 1, 0, 0 ], 0, [ 0, 1, 0, 0 ], 0);
    await pAssertToolbarNotVisible();
  });
});
