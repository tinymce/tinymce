import { describe, it } from '@ephox/bedrock-client';
import { McEditor, TinyAssertions, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as InsertNewline from 'tinymce/core/newline/InsertNewLine';

// With a few exceptions, it is considered invalid for the cursor to be immediately before a block level element. These tests address
// known cases where it was possible to position the cursor in one of those locations.
describe('browser.tinymce.core.selection.SelectBeforeBlock', () => {

  const settings = {
    base_url: '/project/tinymce/js/tinymce'
  };

  it('TINY-4058: Ensure that pressing enter while inside PRE does not move cursor to invalid position', async () => {
    const editor = await McEditor.pFromSettings<Editor>({ ...settings, br_in_pre: false });
    editor.setContent('<pre>Hello world</pre>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    InsertNewline.insert(editor, {} as EditorEvent<KeyboardEvent>);
    TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);
    McEditor.remove(editor);
  });

  it('TINY-4058: Ensure that calling setcontent does not move cursor to invalid position', async () => {
    const editor = await McEditor.pFromSettings<Editor>(settings);
    editor.focus();
    editor.setContent('<pre>Hello world</pre>');
    editor.selection.setCursorLocation();
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
    McEditor.remove(editor);
  });
});
