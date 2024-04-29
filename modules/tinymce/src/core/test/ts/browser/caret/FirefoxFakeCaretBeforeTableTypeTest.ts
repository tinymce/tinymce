import { before, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import TablePlugin from 'tinymce/plugins/table/Plugin';

import * as KeyUtils from '../../module/test/KeyUtils';

const assertUndoManagerDataLength = (editor: Editor, expected: number) =>
  assert.lengthOf(editor.undoManager.data, expected, 'should have correct length');

describe('browser.tinymce.core.FirefoxFakeCaretBeforeTableTypeTest', () => {
  before(function () {
    // This test is only relevant on Firefox
    if (!Env.browser.isFirefox()) {
      this.skip();
    }
  });

  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'table'
  }, [ TablePlugin ]);

  it('cursor before table type', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table style="border-collapse: collapse; width: 100%;" border="1">' +
      '<tbody><tr>' +
      '<td style="width: 50%;">&nbsp;</td>' +
      '<td style="width: 50%;">&nbsp;</td>' +
      '</tr><tr>' +
      '<td style="width: 50%;">&nbsp;</td>' +
      '<td style="width: 50%;">&nbsp;</td>' +
      '</tr></tbody>' +
      '</table>'
    );
    TinySelections.setCursor(editor, [], 0);
    assertUndoManagerDataLength(editor, 1);
    KeyUtils.type(editor, 'a');
    assertUndoManagerDataLength(editor, 3);
  });

  it('TINY-9459: should not render a fake caret before tables inside a noneditable root', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<table><tbody><tr><td></td></tr></tbody></table>');
      TinySelections.setCursor(editor, [], 0);
      editor.nodeChanged();
      TinyAssertions.assertContentPresence(editor, { '.mce-visual-caret': 0 });
    });
  });
});
