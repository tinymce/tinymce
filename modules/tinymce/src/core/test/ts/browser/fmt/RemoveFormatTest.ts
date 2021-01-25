import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import { Format } from 'tinymce/core/fmt/FormatTypes';
import * as RemoveFormat from 'tinymce/core/fmt/RemoveFormat';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.fmt.RemoveFormatTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ], true);

  const removeFormat = [{
    selector: 'strong, em',
    remove: 'all',
    split: true,
    expand: false
  }];
  const boldFormat = [{
    inline: 'strong',
    remove: 'all',
    preserve_attributes: [ 'style', 'class' ]
  }];

  const doRemoveFormat = (editor: Editor, format: Format[]) => {
    editor.formatter.register('format', format);
    RemoveFormat.remove(editor, 'format');
    editor.formatter.unregister('format');
  };

  context('Remove format with collapsed selection', () => {
    it('In middle of single word wrapped in strong', () => {
      const editor = hook.editor();
      editor.setContent('<p><strong>ab</strong></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      doRemoveFormat(editor, removeFormat);
      TinyAssertions.assertContent(editor, '<p>ab</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    });

    it('In middle of first of two words wrapped in strong', () => {
      const editor = hook.editor();
      editor.setContent('<p><strong>ab cd</strong></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      doRemoveFormat(editor, removeFormat);
      TinyAssertions.assertContent(editor, '<p>ab <strong>cd</strong></p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    });

    it('In middle of last of two words wrapped in strong', () => {
      const editor = hook.editor();
      editor.setContent('<p><strong>ab cd</strong></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
      doRemoveFormat(editor, removeFormat);
      TinyAssertions.assertContent(editor, '<p><strong>ab</strong> cd</p>');
      TinyAssertions.assertSelection(editor, [ 0, 1 ], 2, [ 0, 1 ], 2);
    });

    it('In middle of first of two words wrapped in strong, with the first wrapped in em as well', () => {
      const editor = hook.editor();
      editor.setContent('<p><strong><em>ab</em> cd</strong></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 1);
      doRemoveFormat(editor, removeFormat);
      TinyAssertions.assertContent(editor, '<p>ab <strong>cd</strong></p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    });

    it('After first of two words, with multiple spaces wrapped in strong', () => {
      const editor = hook.editor();
      editor.setContent('<p><strong>ab&nbsp; &nbsp;cd</strong></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
      doRemoveFormat(editor, removeFormat);
      TinyAssertions.assertContent(editor, '<p>ab&nbsp; &nbsp;<strong>cd</strong></p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
    });

    it('Multiple spaces wrapped in strong and a letter', () => {
      const editor = hook.editor();
      editor.setContent('<p>t<strong>&nbsp; t</strong></p>');
      TinySelections.setSelection(editor, [ 0, 1, 0 ], 2, [ 0, 1, 0 ], 3);
      doRemoveFormat(editor, removeFormat);
      TinyAssertions.assertContent(editor, '<p>t<strong>&nbsp; </strong>t</p>');
      TinyAssertions.assertSelection(editor, [ 0, 1 ], 1, [ 0 ], 3);
    });

    it('Before last of two words, with multiple spaces wrapped in strong', () => {
      const editor = hook.editor();
      editor.setContent('<p><strong>ab&nbsp; &nbsp;cd</strong></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 5);
      doRemoveFormat(editor, removeFormat);
      TinyAssertions.assertContent(editor, '<p><strong>ab</strong>&nbsp; &nbsp;cd</p>');
      TinyAssertions.assertSelection(editor, [ 0, 1 ], 3, [ 0, 1 ], 3);
    });
  });

  context('Remove single format with collapsed selection', () => {
    it('In middle of first of two words wrapped in strong and em', () => {
      const editor = hook.editor();
      editor.setContent('<p><em><strong>ab cd</strong></em></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 1);
      doRemoveFormat(editor, boldFormat);
      TinyAssertions.assertContent(editor, '<p><em>ab <strong>cd</strong></em></p>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
    });

    it('After first of two words, with multiple spaces wrapped in strong and em', () => {
      const editor = hook.editor();
      editor.setContent('<p><em><strong>ab&nbsp; &nbsp;cd</strong></em></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 2);
      doRemoveFormat(editor, boldFormat);
      TinyAssertions.assertContent(editor, '<p><em>ab&nbsp; &nbsp;<strong>cd</strong></em></p>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 2, [ 0, 0, 0 ], 2);
    });
  });
});
