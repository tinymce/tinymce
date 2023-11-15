import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as Zwsp from 'tinymce/core/text/Zwsp';

describe('browser.tinymce.core.text.ZwspInsertTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  });

  it('TINY-10305: Can insert zwsp in empty editor', () => {
    const editor = hook.editor();
    TinySelections.setCursor(editor, [ 0 ], 0);
    Zwsp.insert(editor);
    TinyAssertions.assertRawContent(editor, '<p>\ufeff</p>');
  });

  it('TINY-10305: Can insert zwsp at start of paragraph', () => {
    const editor = hook.editor();
    editor.setContent('<p>test<p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    Zwsp.insert(editor);
    TinyAssertions.assertRawContent(editor, '<p>\ufefftest</p><p><br data-mce-bogus="1"></p>');
  });

  it('TINY-10305: Can insert zwsp in middle of paragraph', () => {
    const editor = hook.editor();
    editor.setContent('<p>test<p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 2);
    Zwsp.insert(editor);
    TinyAssertions.assertRawContent(editor, '<p>te\ufeffst</p><p><br data-mce-bogus="1"></p>');
  });

  it('TINY-10305: Can insert zwsp at end of paragraph', () => {
    const editor = hook.editor();
    editor.setContent('<p>test<p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 4);
    Zwsp.insert(editor);
    TinyAssertions.assertRawContent(editor, '<p>test\ufeff</p><p><br data-mce-bogus="1"></p>');
  });
});
