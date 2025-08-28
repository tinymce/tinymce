import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.content.insert.CaretPlaceholderTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
  }, [], true);

  it('TINY-10370: should position the cursor at the beginning', () => {
    const editor = hook.editor();
    editor.setContent('<p>cd</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    editor.insertContent('{$caret}ab');
    TinyAssertions.assertContent(editor, '<p>abcd</p>');
    TinyAssertions.assertCursor(editor, [ 0 ], 0);
  });

  it('TINY-10370: should position the cursor in the middle', () => {
    const editor = hook.editor();
    editor.setContent('<p>ad</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.insertContent('b{$caret}c');
    TinyAssertions.assertContent(editor, '<p>abcd</p>');
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 2);
  });

  it('TINY-10370: should position the cursor in the end', () => {
    const editor = hook.editor();
    editor.setContent('<p>ab</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 2);
    editor.insertContent('cd{$caret}');
    TinyAssertions.assertContent(editor, '<p>abcd</p>');
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 4);
  });

  it('TINY-10370: should handle only first placeholder', () => {
    const editor = hook.editor();
    editor.setContent('<p>ae</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.insertContent('b{$caret}c{$caret}d');
    TinyAssertions.assertContent(editor, '<p>abc{$caret}de</p>');
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 2);
  });

  it('TINY-10370: should pass over the placeholder in the content', () => {
    const editor = hook.editor();
    editor.setContent('<p>a{$caret}be</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 10);
    editor.insertContent('c{$caret}d');
    TinyAssertions.assertContent(editor, '<p>a{$caret}bcde</p>');
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 11);
  });

  it('TINY-10370: more complex nested content', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>abc</li></ul>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
    editor.insertContent('<p><strong>d{$caret}<em>ef</em></strong></p>');
    TinyAssertions.assertContent(editor, '<ul><li>ab<p><strong>d<em>ef</em></strong></p>c</li></ul>');
    TinyAssertions.assertCursor(editor, [ 0, 0, 1, 0, 0 ], 1);
  });
});
