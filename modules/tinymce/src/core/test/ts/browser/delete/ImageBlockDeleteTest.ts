import { Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.delete.ImageBlockDeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    content_style: 'img.block { display: block }',
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  context('Delete keys for image block element', () => {
    it('Should place the selection on the image block element on delete before (inline)', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<img src="about:blank" class="block">b</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.delete());
      TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 2);
    });

    it('Should place the selection on the image block element on delete before', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p><p><img src="about:blank" class="block"></p><p>b</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.delete());
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 1);
    });
  });

  describe('Backspace keys for image block element', () => {
    it('Should place the selection on the image block element on backspace after (inline)', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<img src="about:blank" class="block">b</p>');
      TinySelections.setCursor(editor, [ 0, 2 ], 0);
      TinyContentActions.keystroke(editor, Keys.backspace());
      TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 2);
    });

    it('Should place the selection on the image block element on backspace after', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p><p><img src="about:blank" class="block"></p><p>b</p>');
      TinySelections.setCursor(editor, [ 2, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.backspace());
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 1);
    });
  });

  context('Backspace/delete before on non block images should not select the image', () => {
    it('Should place the selection on the image block element on delete before', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<img src="about:blank">b</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.delete());
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    });

    it('Should place the selection on the image block element on backspace after', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<img src="about:blank">b</p>');
      TinySelections.setCursor(editor, [ 0, 2 ], 0);
      TinyContentActions.keystroke(editor, Keys.backspace());
      TinyAssertions.assertSelection(editor, [ 0, 2 ], 0, [ 0, 2 ], 0);
    });
  });
});
