import { Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.delete.OutdentTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, [], true);

  const testDeleteOrBackspaceKey = (key: number) => (
    setupHtml: string,
    setupPath: number[],
    setupOffset: number,
    expectedHtml: string,
    expectedPath: number[],
    expectedOffset: number
  ) => {
    const editor = hook.editor();
    editor.setContent(setupHtml);
    TinySelections.setCursor(editor, setupPath, setupOffset);
    editor.execCommand('indent');
    editor.nodeChanged();
    TinyContentActions.keystroke(editor, key);
    normalizeBody(editor);
    TinyAssertions.assertContent(editor, expectedHtml);
    TinyAssertions.assertSelection(editor, expectedPath, expectedOffset, expectedPath, expectedOffset);
  };

  const testSelectionEnabledDeleteOrBackspaceKey = (key: number) => (
    setupHtml: string,
    setupPath: number[],
    setupOffset: number,
    expectedHtml: string,
    expectedPath: number[],
    expectedOffset: number
  ) => {
    const editor = hook.editor();
    editor.setContent(setupHtml);
    editor.mode.set('readonly');
    TinySelections.setCursor(editor, setupPath, setupOffset);
    editor.execCommand('indent');
    editor.nodeChanged();
    TinyContentActions.keystroke(editor, key);
    normalizeBody(editor);
    TinyAssertions.assertContent(editor, expectedHtml);
    TinyAssertions.assertSelection(editor, expectedPath, expectedOffset, expectedPath, expectedOffset);
    editor.mode.set('design');
  };

  const normalizeBody = (editor: Editor) => {
    editor.getBody().normalize();
  };

  const testBackspace = testDeleteOrBackspaceKey(Keys.backspace());
  const testSelectionEnabledBackspace = testSelectionEnabledDeleteOrBackspaceKey(Keys.backspace());

  context('Design mode', () => {
    it('Backspace key on text', () => {
      testBackspace('<p>a</p>', [ 0, 0 ], 0, '<p>a</p>', [ 0, 0 ], 0); // outdent
      testBackspace('<p>aa</p>', [ 0, 0 ], 1, '<p style="padding-left: 40px;">aa</p>', [ 0, 0 ], 1); // no outdent
      testBackspace('<p>a</p><p>b</p>', [ 1, 0 ], 0, '<p>a</p>\n<p>b</p>', [ 1, 0 ], 0); // outdent
      testBackspace('<p>a</p><p>bb</p>', [ 1, 0 ], 1, '<p>a</p>\n<p style="padding-left: 40px;">bb</p>', [ 1, 0 ], 1); // no outdent
    });
  });

  context('TINY-10981: readonly mode', () => {
    it('Backspace key on text', () => {
      testSelectionEnabledBackspace('<p>a</p>', [ 0, 0 ], 0, '<p>a</p>', [ 0, 0 ], 0); // no outdent
      testSelectionEnabledBackspace('<p>aa</p>', [ 0, 0 ], 1, '<p>aa</p>', [ 0, 0 ], 1); // no outdent
      testSelectionEnabledBackspace('<p>a</p><p>b</p>', [ 1, 0 ], 0, '<p>a</p>\n<p>b</p>', [ 1, 0 ], 0); // no outdent
      testSelectionEnabledBackspace('<p>a</p><p>bb</p>', [ 1, 0 ], 1, '<p>a</p>\n<p>bb</p>', [ 1, 0 ], 1); // no outdent
    });
  });
});
