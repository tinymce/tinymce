import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import { Format } from 'tinymce/core/fmt/FormatTypes';
import * as RemoveFormat from 'tinymce/core/fmt/RemoveFormat';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.fmt.RemoveFormatTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
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

  context('DefaultFormats remove format behavior', () => {
    it('TINY-6264: Will not remove style="list-style-type: none" from list item elements (ol)', () => {
      const editor = hook.editor();
      const nestedListHtml = '<ol><li style="list-style-type: none;"><ol><li>hello</li></ol></li></ol>';
      editor.setContent(nestedListHtml);
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 5);
      editor.execCommand('RemoveFormat');
      TinyAssertions.assertContent(editor, nestedListHtml);
    });

    it('TINY-6264: Will remove other styles except for style="list-style-type: none" from list item elements', () => {
      const editor = hook.editor();
      editor.setContent('<ul><li style="list-style-type: none; background-color: #000000;"><ul><li>hello</li></ul></li></ul>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 5);
      editor.execCommand('RemoveFormat');
      TinyAssertions.assertContent(editor, '<ul><li style="list-style-type: none;"><ul><li>hello</li></ul></li></ul>');
    });

    it('TINY-6264: Removes data-mce-style attribute when short-circuiting for "list-style-type: none" retention', () => {
      const editor = hook.editor();
      editor.setContent('<ol><li data-mce-style="list-style-type: none;" style="list-style-type: none;"><ol><li>hello</li></ol></li></ol>');
      TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 5);
      editor.execCommand('RemoveFormat');
      TinyAssertions.assertContent(editor, '<ol><li style="list-style-type: none;"><ol><li>hello</li></ol></li></ol>');
    });
  });

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

    it('TINY-6567: Remove format including the final item in the list', () => {
      const editor = hook.editor();
      editor.setContent(
        '<ul>' +
          '<li style="text-align: center;">a</li>' +
          '<li style="text-align: center;">b' +
            '<ul>' +
              '<li style="text-align: center;">c</li>' +
              '<li style="text-align: center;">d</li>' +
            '</ul>' +
          '</li>' +
        '</ul>'
      );
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 1, 1, 1 ], 0);

      RemoveFormat.remove(editor, 'aligncenter');
      TinyAssertions.assertContent(editor,
        '<ul>' +
          '<li>a</li>' +
          '<li>b' +
            '<ul>' +
              '<li>c</li>' +
              '<li>d</li>' +
            '</ul>' +
          '</li>' +
        '</ul>'
      );
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 1, 1, 1 ], 0);
    });

    it('TINY-6567: Remove format including the final item in nested lists', () => {
      const editor = hook.editor();
      editor.setContent(
        '<ul>' +
          '<li style="text-align: center;">1</li>' +
          '<li style="text-align: center;">2' +
            '<ul>' +
              '<li style="text-align: center;">a</li>' +
              '<li style="text-align: center;">b' +
                '<ul>' +
                  '<li style="text-align: center;">1</li>' +
                  '<li style="text-align: center;">2</li>' +
                '</ul>' +
              '</li>' +
            '</ul>' +
          '</li>' +
        '</ul>'
      );
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 1, 1, 1, 1, 1 ], 0);

      RemoveFormat.remove(editor, 'aligncenter');
      TinyAssertions.assertContent(editor,
        '<ul>' +
          '<li>1</li>' +
          '<li>2' +
            '<ul>' +
              '<li>a</li>' +
              '<li>b' +
                '<ul>' +
                  '<li>1</li>' +
                  '<li>2</li>' +
                '</ul>' +
              '</li>' +
            '</ul>' +
          '</li>' +
        '</ul>'
      );
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 1, 1, 1, 1, 1 ], 0);
    });

    it('TINY-6567: Remove format including the final item in a div structure with partial selection', () => {
      const editor = hook.editor();
      editor.setContent(
        '<div>' +
          '<div><strong>a</strong></div>' +
          '<div><strong>b</strong>' +
            '<div><strong>c</strong></div>' +
            '<div>d</div>' +
            '<div>e</div>' +
          '</div>' +
        '</div>'
      );

      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 1, 0, 0 ], 1);
      doRemoveFormat(editor, removeFormat);
      TinyAssertions.assertContent(editor,
        '<div>' +
          '<div>a</div>' +
          '<div>b' +
            '<div>c</div>' +
            '<div>d</div>' +
            '<div>e</div>' +
          '</div>' +
        '</div>'
      );
    });
  });
});
