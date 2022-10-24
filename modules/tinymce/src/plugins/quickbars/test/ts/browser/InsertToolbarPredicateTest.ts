import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/quickbars/Plugin';

import { pAssertToolbarNotVisible, pAssertToolbarVisible } from '../module/test/Utils';

describe('browser.tinymce.plugins.quickbars.InsertToolbarPredicateTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'quickbars link code',
    inline: true,
    toolbar: false,
    menubar: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  it('TINY-9190: Toolbar is shown when the pagragraph is empty', async () => {
    const editor = hook.editor();
    editor.setContent('<p></p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 0 ], 0);
    await pAssertToolbarVisible();
  });

  it('TINY-9190: Toolbar is shown when the cursor is in an empty element', async () => {
    const editor = hook.editor();
    editor.setContent('<p><span><span><span></span></span></span></p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
    await pAssertToolbarVisible();
  });

  it('TINY-9190: Toolbar is shown when the ancesor element has a data-mce-bogus="1" attribute', async () => {
    const editor = hook.editor();
    editor.setContent('<p><span><span data-mce-bogus="1"><span></span></span></span></p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
    await pAssertToolbarVisible();
  });

  it('TINY-9190: Toolbar is not shown on the element that has "data-mce-bogus" attribute', async () => {
    const editor = hook.editor();
    editor.setContent('<p><span data-mce-bogus="1"></span></p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    await pAssertToolbarNotVisible();
  });

  it('TINY-9190: Toolbar is not shown when the ancestor element has a data-mce-bogus="all" attribute', async () => {
    const editor = hook.editor();
    editor.setContent('<p><span><span data-mce-bogus="all"><span><span></span></span></span></span></p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    await pAssertToolbarNotVisible();
  });

  it('TINY-9190: Toolbar is not shown when the ancestor element is a table', async () => {
    const editor = hook.editor();
    const table = '<table><tbody>' +
    '<tr><td></td></tr>' +
    '</tbody></table>';
    editor.setContent(`${table}`);
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    await pAssertToolbarNotVisible();
  });

  it('TINY-9190: Toolbar is not shown on non-empty element', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Not an empty element</p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 0 ], 0);
    await pAssertToolbarNotVisible();
  });
});
