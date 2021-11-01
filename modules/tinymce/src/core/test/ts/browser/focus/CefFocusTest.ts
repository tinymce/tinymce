import { Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { McEditor, TinyAssertions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.focus.CefFocusTest', () => {

  const pCreateInlineEditor = (html: string) => McEditor.pFromHtml<Editor>(html, {
    menubar: false,
    inline: true,
    base_url: '/project/tinymce/js/tinymce'
  });

  it('Focus editors', async () => {
    const editor1 = await pCreateInlineEditor('<div class="tinymce"><p contenteditable="false">a</p></div>');
    const editor2 = await pCreateInlineEditor('<div class="tinymce"><p contenteditable="false">b</p></div>');
    editor1.getBody().focus();
    editor2.getBody().focus();

    await Waiter.pTryUntil('Wait for selection to move', () => {
      TinyAssertions.assertSelection(editor2, [ 0 ], 0, [ 0 ], 0);
    });
    const caretElm0 = editor1.getBody().querySelector('[data-mce-caret]');
    const caretElm1 = editor2.getBody().querySelector('[data-mce-caret]');

    assert.isNull(caretElm0, 'Should not be a caret element present editor q');
    assert.isNotNull(caretElm1, 'Should be a caret element present editor 1');

    McEditor.remove(editor2);
    McEditor.remove(editor1);
  });
});
