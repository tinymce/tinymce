import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.api.commands.NewlineCommandTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  it('TINY-7829: InsertParagraph command', () => {
    const editor = hook.editor();
    editor.setContent('<p>123</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 2);
    editor.execCommand('InsertParagraph');
    TinyAssertions.assertContent(editor, '<p>12</p><p>3</p>');
    TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);
  });

  it('TINY-8606: InsertParagraph command should delete the selection', () => {
    const editor = hook.editor();
    editor.setContent('<p>This is a test</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 'This'.length, [ 0, 0 ], 'This is a '.length);
    editor.execCommand('InsertParagraph');
    TinyAssertions.assertContent(editor, '<p>This</p><p>test</p>');
    TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);
  });

  it('TINY-8606: mceInsertNewLine command should delete the selection', () => {
    const editor = hook.editor();
    editor.setContent('<p>This is a test</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 'This'.length, [ 0, 0 ], 'This is a '.length);
    editor.execCommand('mceInsertNewLine');
    TinyAssertions.assertContent(editor, '<p>This</p><p>test</p>');
    TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);
  });

  it('TINY-7829: mceInsertNewLine command', () => {
    const editor = hook.editor();
    editor.setContent('<p>123</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 2);
    editor.execCommand('mceInsertNewLine');
    TinyAssertions.assertContent(editor, '<p>12</p><p>3</p>');
    TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);
  });

  it('InsertLineBreak command', () => {
    const editor = hook.editor();
    editor.setContent('<p>123</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 2);
    editor.execCommand('InsertLineBreak');
    TinyAssertions.assertContent(editor, '<p>12<br>3</p>');

    editor.setContent('<p>123</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    editor.execCommand('InsertLineBreak');
    TinyAssertions.assertContent(editor, '<p><br>123</p>');

    editor.setContent('<p>123</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 3);
    editor.execCommand('InsertLineBreak');
    TinyAssertions.assertContent(editor, '<p>123<br><br></p>');
  });
});
