import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.selection.MultiClickSelectionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ], true);

  const fakeMultiClick = (editor: Editor, clickCount) => {
    editor.fire('click', { detail: clickCount } as MouseEvent);
  };

  for (let clickCount = 3; clickCount <= 10; clickCount++) {
    it(`Normalize selection from index text node to text node offsets with ${clickCount} clicks`, () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p>');
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
      fakeMultiClick(editor, clickCount);
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    });

    it(`Normalize selection start in text node end after paragraph with ${clickCount} clicks`, () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [], 1);
      fakeMultiClick(editor, clickCount);
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    });
  }
});
