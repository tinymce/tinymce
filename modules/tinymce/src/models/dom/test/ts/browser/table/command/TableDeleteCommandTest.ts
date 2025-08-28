
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.models.dom.table.command.TableDeleteCommandTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  it('Should delete table', () => {
    const editor = hook.editor();
    editor.setContent('<div><table><tbody><tr><td>cell</td></tr></tbody></table></div>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0, 0 ], 0);
    editor.execCommand('mceTableDelete');
    TinyAssertions.assertContent(editor, '');
  });

  it('TINY-9459: Should not apply mceTableDelete command on table inside a noneditable div', () => {
    const editor = hook.editor();
    const initalContent = '<div contenteditable="false"><table><tbody><tr><td>cell</td></tr></tbody></table></div>';
    editor.setContent(initalContent);
    TinySelections.setCursor(editor, [ 1, 0, 0, 0, 0, 0 ], 0); // Index off by one due to cef fake caret
    editor.execCommand('mceTableDelete');
    TinyAssertions.assertContent(editor, initalContent);
  });

  it('TINY-9459: Should not apply mceTableDelete command on table inside a noneditable root', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      const initalContent = '<table><tbody><tr><td>cell</td></tr></tbody></table>';
      editor.setContent(initalContent);
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
      editor.execCommand('mceTableDelete');
      TinyAssertions.assertContent(editor, initalContent);
    });
  });
});
