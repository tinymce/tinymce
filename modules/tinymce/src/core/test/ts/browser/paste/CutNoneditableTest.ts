import { Clipboard, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.paste.CutNoneditableTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: false,
    statusbar: false,
    extended_valid_elements: 'svg[*]'
  }, []);

  it('TINY-10346: Cut event should not delete content inside svg elements', async () => {
    const editor = hook.editor();
    const initialContent = '<svg width="200" height="100"><text x="20" y="60" font-family="Arial" font-size="24" fill="blue">text</text></svg>';
    editor.setContent(initialContent);
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 2);
    const dataTransfer = Clipboard.cut(TinyDom.body(editor));
    assert.equal(dataTransfer.getData('text/html'), '', 'Should be empty since there is no editable content selected');
    await Waiter.pWait(1); // The execCommand('Delete') inside the cut handler is executed using setTimeout(.., 0) to avoid command recursion.
    TinyAssertions.assertContent(editor, initialContent);
  });
});
