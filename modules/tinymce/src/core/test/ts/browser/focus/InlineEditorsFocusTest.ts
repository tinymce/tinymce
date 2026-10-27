import { Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { McEditor, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.focus.InlineEditorsFocusTest', () => {
  const pCreateInlineEditor = (html: string) => McEditor.pFromHtml<Editor>(html, {
    menubar: false,
    toolbar: false,
    inline: true,
    base_url: '/project/tinymce/js/tinymce'
  });

  it('TINYMCE-14953: An inline editor whose content was replaced does not take focus back', async () => {
    const editor1 = await pCreateInlineEditor('<div><p>See <a href="#">the link</a></p></div>');
    const editor2 = await pCreateInlineEditor('<div><p>b</p></div>');
    try {
      editor1.focus();
      TinySelections.setCursor(editor1, [ 0, 1, 0 ], 'the link'.length);
      await Waiter.pTryUntil('Wait for the inline boundary caret in the link', () =>
        assert.isNotNull(editor1.getBody().querySelector('a[data-mce-selected="inline-boundary"]')));

      // Replacing the content and moving focus in the same task leaves editor1's caret container
      // stale when the page's selectionchange arrives, so dispatch it rather than wait for the browser's.
      editor1.setContent('<p>See <a href="#">the link</a></p>');
      editor2.focus();
      TinySelections.setCursor(editor2, [ 0, 0 ], 0);
      document.dispatchEvent(new Event('selectionchange'));

      const focusState = `editor1.hasFocus=${editor1.hasFocus()} editor2.hasFocus=${editor2.hasFocus()} activeElement=${document.activeElement?.nodeName}`;
      assert.isTrue(editor2.hasFocus() && !editor1.hasFocus(), `The editor focused last should keep focus: ${focusState}`);
    } finally {
      McEditor.remove(editor2);
      McEditor.remove(editor1);
    }
  });
});
