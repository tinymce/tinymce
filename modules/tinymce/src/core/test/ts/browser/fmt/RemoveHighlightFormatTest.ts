import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.fmt.RemoveHighlightFormatTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  context('We remove a block', () => {
    it('Which starts in the color, but ends outside of it', () => {
      const editor = hook.editor();
      editor.setContent('<p>Part 1 <span style="background-color: #e03e2d;">Part 2 Part 3</span> Part 4');
      TinySelections.setSelection(editor, [ 0, 1, 0 ], 6, [ 0, 2 ], 4);
      editor.execCommand('RemoveFormat');
      TinyAssertions.assertContent(editor, '<p>Part 1 <span style="background-color: #e03e2d;">Part 2</span> Part 3 Part 4</p>');
      TinyAssertions.assertSelection(editor, [ 0, 1 ], 1, [ 0, 3 ], 4);
    });

    it('Which starts outside the color, but ends inside of it', () => {
      const editor = hook.editor();
      editor.setContent('<p>Part 1 <span style="background-color: #e03e2d;">Part 2 Part 3</span> Part 4');
      TinySelections.setSelection(editor, [ 0, 0 ], 3, [ 0, 1, 0 ], 4);
      editor.execCommand('RemoveFormat');
      TinyAssertions.assertContent(editor, '<p>Part 1 Part<span style="background-color: #e03e2d;"> 2 Part 3</span> Part 4</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 3, [ 0, 2 ], 0);
    });

    it('Which starts and ends in the color', () => {
      const editor = hook.editor();
      editor.setContent('<p>Part 1 <span style="background-color: #e03e2d;">Part 2 Part 3</span> Part 4');
      TinySelections.setSelection(editor, [ 0, 1, 0 ], 6, [ 0, 1, 0 ], 7);
      editor.execCommand('RemoveFormat');
      TinyAssertions.assertContent(editor, '<p>Part 1 <span style="background-color: #e03e2d;">Part 2</span> <span style="background-color: #e03e2d;">Part 3</span> Part 4</p>');
      TinyAssertions.assertSelection(editor, [ 0, 1 ], 1, [ 0, 3 ], 0);
    });

    it('Which starts and ends outside the color', () => {
      const editor = hook.editor();
      editor.setContent('<p>Part 1 <span style="background-color: #e03e2d;">Part 2 Part 3</span> Part 4');
      TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 2 ], 4);
      editor.execCommand('RemoveFormat');
      TinyAssertions.assertContent(editor, '<p>Part 1 Part 2 Part 3 Part 4</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 2 ], 4);
    });
  });
});
