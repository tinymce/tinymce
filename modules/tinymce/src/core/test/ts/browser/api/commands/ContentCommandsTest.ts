import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.api.commands.ContentCommandsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  it('TINY-7829: mceCleanup command', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p><b>a</b></p>';
    editor.execCommand('mceCleanup');
    TinyAssertions.assertContent(editor, '<p><strong>a</strong></p>');
  });

  it('TINY-7829: InsertImage command', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.execCommand('InsertImage', false, 'about:blank#<b>');
    TinyAssertions.assertContent(editor, '<p>a<img src="about:blank#&lt;b&gt;"></p>');
  });

  it('TINY-7829: InsertHorizontalRule command', () => {
    const editor = hook.editor();
    editor.setContent('<p>ab</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.execCommand('InsertHorizontalRule');
    TinyAssertions.assertContent(editor, '<p>a</p><hr><p>b</p>');
  });

  it('TINY-7829: InsertText command', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.execCommand('InsertText', false, 'bc<b>');
    TinyAssertions.assertContent(editor, '<p>abc&lt;b&gt;</p>');
  });

  it('TINY-7829: insertHTML command', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');

    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.execCommand('insertHTML', false, '<em>b</em>');
    TinyAssertions.assertContent(editor, '<p>a<em>b</em></p>');
  });

  it('TINY-7829: mceInsertContent command', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');

    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.execCommand('mceInsertContent', false, '<em>b</em>');
    TinyAssertions.assertContent(editor, '<p>a<em>b</em></p>');
  });

  it('TINY-7829: mceSetContent command', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    editor.execCommand('mceSetContent', false, '<p>b</p>');
    TinyAssertions.assertContent(editor, '<p>b</p>');
  });

  it('TINY-7829: mceReplaceContent command', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);
    editor.execCommand('mceReplaceContent', false, 'X{$selection}Y');
    TinyAssertions.assertContent(editor, '<p>aXbYc</p>');
  });

  it('TINY-7829: mceNewDocument command', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    editor.execCommand('mceNewDocument');
    TinyAssertions.assertContent(editor, '');
  });

  it('TINY-9839: mceNewDocument command with newdocument_content option', () => {
    const editor = hook.editor();
    editor.options.set('newdocument_content', '<p>initial</p>');
    editor.setContent('<p>a</p>');
    editor.execCommand('mceNewDocument');
    TinyAssertions.assertContent(editor, '<p>initial</p>');
    editor.options.unset('newdocument_content');
  });
});
