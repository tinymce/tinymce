import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.selection.InlineBoundarySelectionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const assertInlineBoundarySelectionCount = (expectedCount: number) => (editor: Editor) => {
    TinyAssertions.assertContentPresence(editor, {
      '[data-mce-selected="inline-boundary"]': expectedCount
    });
  };

  const assertInlineBoundarySelection = assertInlineBoundarySelectionCount(1);
  const assertNoInlineBoundarySelection = assertInlineBoundarySelectionCount(0);

  it('Should have inline boundary when caret is inside an anchor', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="#">a</a></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    assertInlineBoundarySelection(editor);
  });

  it('TINY-9471: Should not have a inline boundary when caret is inside an noneditable anchor', () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false"><a href="#">a</a></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    assertNoInlineBoundarySelection(editor);
  });

  it('TINY-9471: Should not have a inline boundary when caret is inside an noneditable root', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<p><a href="#">a</a></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
      assertNoInlineBoundarySelection(editor);
    });
  });
});
