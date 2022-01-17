import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.commands.OutdentCommandTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  const assertOutdentCommandState = (editor: Editor, expectedState: boolean) => {
    assert.equal(editor.queryCommandState('outdent'), expectedState);
  };

  const setReadOnly = (editor: Editor, state: boolean) => {
    editor.mode.set(state ? 'readonly' : 'design');
  };

  it('Outdent on single paragraph without margin/padding', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    assertOutdentCommandState(editor, false);
    editor.execCommand('outdent');
    TinyAssertions.assertContent(editor, '<p>a</p>');
  });

  it('Outdent on multiple paragraphs without margin/padding', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 1, 0 ], 1);
    assertOutdentCommandState(editor, true);
    editor.execCommand('outdent');
    TinyAssertions.assertContent(editor, '<p>a</p><p>b</p>');
  });

  it('Outdent on single paragraph with margin', () => {
    const editor = hook.editor();
    editor.options.set('indent_use_margin', true);
    editor.setContent('<p style="margin-left: 40px;">a</p>');
    assertOutdentCommandState(editor, true);
    editor.execCommand('outdent');
    TinyAssertions.assertContent(editor, '<p>a</p>');
  });

  it('Outdent on single paragraph with padding', () => {
    const editor = hook.editor();
    editor.options.set('indent_use_margin', false);
    editor.setContent('<p style="padding-left: 40px;">a</p>');
    assertOutdentCommandState(editor, true);
    editor.execCommand('outdent');
    TinyAssertions.assertContent(editor, '<p>a</p>');
  });

  it('Outdent on single paragraph with margin x 2', () => {
    const editor = hook.editor();
    editor.options.set('indent_use_margin', false);
    editor.setContent('<p style="padding-left: 80px;">a</p>');
    assertOutdentCommandState(editor, true);
    editor.execCommand('outdent');
    TinyAssertions.assertContent(editor, '<p style="padding-left: 40px;">a</p>');
  });

  it('Outdent on single paragraph with padding x 2', () => {
    const editor = hook.editor();
    editor.options.set('indent_use_margin', true);
    editor.setContent('<p style="margin-left: 80px;">a</p>');
    assertOutdentCommandState(editor, true);
    editor.execCommand('outdent');
    TinyAssertions.assertContent(editor, '<p style="margin-left: 40px;">a</p>');
  });

  it('Outdent on mutiple paragraphs with margin', () => {
    const editor = hook.editor();
    editor.options.set('indent_use_margin', true);
    editor.setContent('<p style="margin-left: 80px;">a</p><p style="margin-left: 40px;">b</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 1, 0 ], 1);
    assertOutdentCommandState(editor, true);
    editor.execCommand('outdent');
    TinyAssertions.assertContent(editor, '<p style="margin-left: 40px;">a</p><p>b</p>');
  });

  it('Outdent on multiple paragraphs with padding', () => {
    const editor = hook.editor();
    editor.options.set('indent_use_margin', false);
    editor.setContent('<p style="padding-left: 80px;">a</p><p style="padding-left: 40px;">b</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 1, 0 ], 1);
    assertOutdentCommandState(editor, true);
    editor.execCommand('outdent');
    TinyAssertions.assertContent(editor, '<p style="padding-left: 40px;">a</p><p>b</p>');
  });

  it('Outdent on single paragraph with padding and rtl', () => {
    const editor = hook.editor();
    editor.options.set('indent_use_margin', false);
    editor.setContent('<p style="padding-right: 80px; direction: rtl;">a</p>');
    assertOutdentCommandState(editor, true);
    editor.execCommand('outdent');
    TinyAssertions.assertContent(editor, '<p style="padding-right: 40px; direction: rtl;">a</p>');
  });

  it('Outdent on single paragraph with margin and rtl', () => {
    const editor = hook.editor();
    editor.options.set('indent_use_margin', true);
    editor.setContent('<p style="margin-right: 80px; direction: rtl;">a</p>');
    assertOutdentCommandState(editor, true);
    editor.execCommand('outdent');
    TinyAssertions.assertContent(editor, '<p style="margin-right: 40px; direction: rtl;">a</p>');
  });

  it('Outdent on single paragraph with margin in readonly mode', () => {
    const editor = hook.editor();
    setReadOnly(editor, true);
    editor.options.set('indent_use_margin', true);
    editor.setContent('<p style="margin-left: 40px;">a</p>');
    assertOutdentCommandState(editor, false);
    editor.execCommand('outdent');
    TinyAssertions.assertContent(editor, '<p style="margin-left: 40px;">a</p>');
    setReadOnly(editor, false);
  });

  it('Outdent on selected table using margin', () => {
    const editor = hook.editor();
    editor.options.set('indent_use_margin', true);
    editor.setContent('<table style="margin-left: 80px;"><tr><td>a</td></tr></table>');
    editor.execCommand('SelectAll');
    assertOutdentCommandState(editor, true);
    editor.execCommand('outdent');
    TinyAssertions.assertContent(editor, '<table style="margin-left: 40px;"><tbody><tr><td>a</td></tr></tbody></table>');
  });

  it('Outdent on selected table always using margin', () => {
    const editor = hook.editor();
    editor.options.set('indent_use_margin', false);
    editor.setContent('<table style="margin-left: 80px;"><tr><td>a</td></tr></table>');
    editor.execCommand('SelectAll');
    assertOutdentCommandState(editor, true);
    editor.execCommand('outdent');
    TinyAssertions.assertContent(editor, '<table style="margin-left: 40px;"><tbody><tr><td>a</td></tr></tbody></table>');
  });

  it('Outdent on contentEditable=false', () => {
    const editor = hook.editor();
    editor.options.set('indent_use_margin', true);
    editor.setContent('<p style="margin-left: 80px;" contenteditable="false"><span contenteditable="true">a</span></p>');
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
    editor.execCommand('outdent');
    TinyAssertions.assertContent(editor, '<p style="margin-left: 80px;" contenteditable="false"><span contenteditable="true">a</span></p>');
  });
});
