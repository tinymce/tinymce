import { UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/quickbars/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.quickbars.ContentEditableTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'quickbars link',
    inline: true,
    toolbar: false,
    menubar: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme, Plugin ], true);

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
});
