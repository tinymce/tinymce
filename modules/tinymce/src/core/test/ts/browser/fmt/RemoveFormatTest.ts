import { context, describe, it } from '@ephox/bedrock-client';
import { Hierarchy } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { Format } from 'tinymce/core/fmt/FormatTypes';
import * as RemoveFormat from 'tinymce/core/fmt/RemoveFormat';

describe('browser.tinymce.core.fmt.RemoveFormatTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const removeFormat: Format[] = [{
    selector: 'strong, em',
    remove: 'all',
    split: true,
    expand: false
  }];
  const boldFormat: Format[] = [{
    inline: 'strong',
    remove: 'all',
    preserve_attributes: [ 'style', 'class' ]
  }];

  const doRemoveFormat = (editor: Editor, format: Format[]) => {
    editor.formatter.register('format', format);
    RemoveFormat.removeFormat(editor, 'format');
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
  });

  context('Remove single format with range selection', () => {
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

      RemoveFormat.removeFormat(editor, 'aligncenter');
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
              '<li style="text-align: center;"><strong>b</strong>' +
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

      RemoveFormat.removeFormat(editor, 'aligncenter');
      TinyAssertions.assertContent(editor,
        '<ul>' +
          '<li>1</li>' +
          '<li>2' +
            '<ul>' +
              '<li>a</li>' +
              '<li><strong>b</strong>' +
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

    it('TINY-8308: Change format on selected img element and not surrounding elements', () => {
      const editor = hook.editor();
      editor.setContent('<p style="text-align: right;">Test text<img src="link" width="40" height="40"></p>');
      TinySelections.setSelection(editor, [ 0 ], 1, [ 0 ], 2);

      RemoveFormat.removeFormat(editor, 'alignright');

      TinyAssertions.assertContent(editor, '<p style="text-align: right;">Test text<img src="link" width="40" height="40"></p>');
      TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 2);
    });

    it('TINY-8308: Change format on selected img element when the same format is present on both', () => {
      const editor = hook.editor();
      editor.setContent('<p style="text-align: right;">Test text<img src="link" width="40" height="40" style="float: right"></p>');
      TinySelections.setSelection(editor, [ 0 ], 1, [ 0 ], 2);

      RemoveFormat.removeFormat(editor, 'alignright');

      TinyAssertions.assertContent(editor, '<p style="text-align: right;">Test text<img src="link" width="40" height="40"></p>');
      TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 2);
    });
  });

  it('TINY-9678: Should be a noop if selection is not in an editable context', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      const initialContent = '<p><strong>test</strong></p><p contenteditable="true"><strong>editable</strong></p>';
      editor.setContent(initialContent);
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 4);
      editor.formatter.remove('bold');
      TinyAssertions.assertContent(editor, initialContent);
    });
  });

  it('TINY-9887: Should not be a noop if selection is not in an editable context but a custom editable node is specified', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<p><strong>test</strong></p><p contenteditable="true"><strong>editable</strong></p>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 4);
      editor.formatter.remove('bold', {}, Hierarchy.follow(TinyDom.body(editor), [ 1, 0 ]).getOrDie().dom);
      TinyAssertions.assertContent(editor, '<p><strong>test</strong></p><p contenteditable="true">editable</p>');
    });
  });
});
