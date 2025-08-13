import { Keys } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.lists.ReadOnlyModeListTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'bold',
    indent: false,
    statusbar: false,
  }, [], true);

  const setMode = (editor: Editor, mode: string) => {
    editor.mode.set(mode);
  };

  beforeEach(() => setMode(hook.editor(), 'design'));

  it('TINY-10981: Pressing tab/shift+tab on list item should not indent list item', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li><li>b</li><li>c</li></ul>');
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.tab());
    TinyAssertions.assertContent(editor, '<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>');

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0, 0, 1, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.tab());
    TinyAssertions.assertContent(editor, '<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>');

    TinySelections.setCursor(editor, [ 0, 0, 1, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.tab(), { shiftKey: true });
    TinyAssertions.assertContent(editor, '<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>');

    setMode(editor, 'design');
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.tab());
    TinyAssertions.assertContent(editor, '<ul><li>a<ul><li>b</li><li>c</li></ul></li></ul>');
  });

  it('TINY-10981: mceListUpdate command should not be permitted in readonly mode', () => {
    const editor = hook.editor();
    editor.setContent(`<ol><li>test</li></ol><ol><li>test2</li></ol>`);
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
    editor.execCommand('mceListUpdate', false, { attrs: { contenteditable: false }});
    TinyAssertions.assertContent(editor, '<ol contenteditable="false"><li>test</li></ol><ol><li>test2</li></ol>');

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 4);
    editor.execCommand('mceListUpdate', false, { attrs: { contenteditable: false }});
    TinyAssertions.assertContent(editor, '<ol contenteditable="false"><li>test</li></ol><ol><li>test2</li></ol>');
  });

  it('TINY-10981: RemoveList command should not be permitted in readonly mode', () => {
    const editor = hook.editor();
    editor.setContent(`<ol><li>test</li></ol><ol><li>test2</li></ol>`);
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
    editor.execCommand('RemoveList');
    TinyAssertions.assertContent(editor, '<p>test</p><ol><li>test2</li></ol>');

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 4);
    editor.execCommand('RemoveList');
    TinyAssertions.assertContent(editor, '<p>test</p><ol><li>test2</li></ol>');
  });
});
