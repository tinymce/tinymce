import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('tinymce.src.core.test.ts.browser.content.EditorNbspTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, []);

  it('TINY-8588: Add one space just before a block', () => {
    const editor = hook.editor();
    editor.setContent('<p>s<span style="display: block;" contenteditable="false">a</span></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.selection.setContent(' ');
    TinyAssertions.assertContent(editor, '<p>s&nbsp;<span style="display: block;" contenteditable="false">a</span></p>');
  });

  it('TINY-8588: Add two spaces just before a block', () => {
    const editor = hook.editor();
    editor.setContent('<p>s<span style="display: block;" contenteditable="false">a</span></p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.selection.setContent(' ');
    editor.selection.setContent(' ');
    TinyAssertions.assertContent(editor, '<p>s &nbsp;<span style="display: block;" contenteditable="false">a</span></p>');
  });

  it('TINY-8588: Add one space before a block while in a span', () => {
    const editor = hook.editor();
    editor.setContent('<p><span class="filler">s</span><span style="display: block;" contenteditable="false">a</span></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    editor.selection.setContent(' ');
    TinyAssertions.assertContent(editor, '<p><span class="filler">s&nbsp;</span><span style="display: block;" contenteditable="false">a</span></p>');
  });
});
