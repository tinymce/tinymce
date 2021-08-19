import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.delete.OutdentForcedRootBlockFalseTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    forced_root_block: false
  }, [ Theme ], true);

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

  const normalizeBody = (editor: Editor) => {
    editor.getBody().normalize();
  };

  const testBackspace = testDeleteOrBackspaceKey(Keys.backspace());

  it('Backspace key on text with forced_root_block: false', () => {
    testBackspace('a', [ 0 ], 0, '<div>a</div>', [ 0, 0 ], 0); // outdent
    testBackspace('aa', [ 0 ], 1, '<div style="padding-left: 40px;">aa</div>', [ 0, 0 ], 1); // no outdent
    testBackspace('a <br>b', [ 2 ], 0, 'a\n<div>b</div>', [ 1, 0 ], 0); // outdent
    testBackspace(
      'aa<br>bb',
      [ 2 ],
      1,
      'aa\n<div style="padding-left: 40px;">bb</div>',
      [ 1, 0 ],
      1
    ); // no outdent
  });
});
