import { describe, it } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as DeleteCommands from 'tinymce/core/delete/DeleteCommands';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.delete.DeleteCommandsTest', () => {
  const caret = Cell<Text>(null);
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [ Theme ], true);

  it('Delete should merge blocks', () => {
    const editor = hook.editor();
    editor.setContent('<h1>a</h1><p><span style="color: red;">b</span></p>');
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
    DeleteCommands.deleteCommand(editor, caret);
    TinyAssertions.assertContent(editor, '<h1>a<span style="color: red;">b</span></h1>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('ForwardDelete should merge blocks', () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="color: red;">a</span></p><h1>b</h1>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    DeleteCommands.forwardDeleteCommand(editor, caret);
    TinyAssertions.assertContent(editor, '<p><span style="color: red;">a</span>b</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
  });
});
