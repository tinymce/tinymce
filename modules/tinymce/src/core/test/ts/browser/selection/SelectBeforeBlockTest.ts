import { Chain, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { ApiChains, Editor as McEditor } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as InsertNewline from 'tinymce/core/newline/InsertNewLine';
import Theme from 'tinymce/themes/silver/Theme';

// With a few exceptions, it is considered invalid for the cursor to be immediately before a block level element. These tests address
// known cases where it was possible to position the cursor in one of those locations.
UnitTest.asynctest('browser.tinymce.core.selection.SelectBeforeBlock', (success, failure) => {
  Theme();

  const settings = {
    base_url: '/project/tinymce/js/tinymce'
  };

  Pipeline.async({}, [
    Log.chainsAsStep('TINY-4058', 'Ensure that pressing enter while inside PRE does not move cursor to invalid position', [
      McEditor.cFromSettings({ ...settings, br_in_pre: false }),
      ApiChains.cSetContent('<pre>Hello world</pre>'),
      ApiChains.cSetCursor([ 0, 0 ], 0),
      Chain.op<Editor>((editor) => InsertNewline.insert(editor, { } as EditorEvent<KeyboardEvent>)),
      ApiChains.cAssertSelection([ 1, 0 ], 0, [ 1, 0 ], 0),
      McEditor.cRemove
    ]),

    Log.chainsAsStep('TINY-4058', 'Ensure that calling setcontent does not move cursor to invalid position', [
      McEditor.cFromSettings(settings),
      ApiChains.cFocus,
      ApiChains.cSetContent('<pre>Hello world</pre>'),
      Chain.op<Editor>((editor) => editor.selection.setCursorLocation()),
      ApiChains.cAssertSelection([ 0, 0 ], 0, [ 0, 0 ], 0),
      McEditor.cRemove
    ])
  ], success, failure);
});
