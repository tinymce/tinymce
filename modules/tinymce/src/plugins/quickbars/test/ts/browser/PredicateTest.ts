import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/quickbars/Plugin';

import { pAssertToolbarNotVisible } from '../module/test/Utils';

describe('browser.tinymce.plugins.quickbars.PredicateTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'quickbars link',
    inline: true,
    toolbar: false,
    menubar: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);


  it('TINY-9190: Toolbar is not shown when the ancestor element has a data-mce-bogus attribute', async () => {
    const editor = hook.editor();
    editor.setContent('<p>one two three <span data-mce-bogus="all"><span><span></span></span></span></p>', { format: 'raw' });
    // Set selection in the deepest span
    TinySelections.setCursor(editor, [ 0, 1, 0, 0 ], 0);
    await pAssertToolbarNotVisible();
  });

  it('TINY-9190: Toolbar is not shown when the ancestor element is a table', async () => {
    const editor = hook.editor();
    const table = '<table><tbody>' +
    '<tr><td></td></tr>' +
    '</tbody></table>';
    editor.setContent(`${table}`, { format: 'raw' });
    // Select C1
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    await pAssertToolbarNotVisible();
  });

  it('TINY-9190: Toolbar is not shown on the elements that have "data-mce-bogus" attribute', async () => {
    const editor = hook.editor();
    editor.setContent('<p><span data-mce-bogus="1"></span></p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    await pAssertToolbarNotVisible();
  });

  it('TINY-9190: Toolbar is not shown on non-empty element', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Not an empty element</p>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 0 ], 0);
    await pAssertToolbarNotVisible();
  });
});
