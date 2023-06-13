import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('Browser Test: .RemoveTrailingBlockquoteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    plugins: 'lists',
    toolbar: '',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TINY-8592: backspace from p outside of table with no change', () => {
    const editor = hook.editor();
    const content = '<table>' +
        '<tbody>' +
          '<tr>' +
            '<td>' +
              '<ul>' +
                '<li>a</li>' +
              '</ul>' +
            '</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>' +
      '<p>&nbsp;</p>';
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 1 ], 0);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertCursor(editor, [ 1 ], 0);
    TinyAssertions.assertContent(editor, content);
  });

  it('TINY-8592: backspace inside cell', () => {
    const editor = hook.editor();
    editor.setContent('<table>' +
        '<tbody>' +
          '<tr>' +
            '<td>' +
              '<ul>' +
                '<li>a</li>' +
              '</ul>' +
              '<p>&nbsp;</p>' +
            '</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 1 ], 0);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0, 0, 0, 0 ], 1);
    TinyAssertions.assertContent(editor, '<table>' +
        '<tbody>' +
          '<tr>' +
            '<td>' +
              '<ul>' +
                '<li>a</li>' +
              '</ul>' +
            '</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>');
  });

  it('TINY-8592: backspace inside different cells', () => {
    const editor = hook.editor();
    const content = '<table>' +
        '<tbody>' +
          '<tr>' +
            '<td>' +
              '<ul>' +
                '<li>a</li>' +
              '</ul>' +
            '</td>' +
            '<td>' +
              '&nbsp;' +
            '</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>';
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 0, 0, 0, 1, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 1 ], 0);
    TinyAssertions.assertContent(editor, content);
  });

  it('TBA: backspace from p inside div into li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li></ul><div><p><br /></p></div>');
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, '<ul><li>a</li></ul>');
  });

  it('TBA: backspace from p inside blockquote into li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li></ul><blockquote><p><br /></p></blockquote>');
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, '<ul><li>a</li></ul>');
  });

  it('TBA: backspace from b inside p inside blockquote into li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li></ul><blockquote><p><b><br /></b></p></blockquote>');
    TinySelections.setCursor(editor, [ 1, 0, 0, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, '<ul><li>a</li></ul>');
  });

  it('TBA: backspace from span inside p inside blockquote into li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li></ul><blockquote><p><span class="x"><br /></span></p></blockquote>');
    TinySelections.setCursor(editor, [ 1, 0, 0, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, '<ul><li>a</li></ul>');
  });

  it('TBA: backspace from p into li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li></ul><p><br /></p>');
    TinySelections.setCursor(editor, [ 1, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, '<ul><li>a</li></ul>');
  });

  it('TINY-6888: delete a `li` with a `br` and a `br` with `data-mce-bogus', () => {
    const editor = hook.editor();
    editor.setContent('<ol><li>aaa</li><li><br><br data-mce-bogus="1"></li><li>ccc</li></ol>', { format: 'raw' });
    TinySelections.setCursor(editor, [ 0, 1 ], 0);
    TinyContentActions.keystroke(editor, Keys.delete());
    TinyAssertions.assertContent(editor, '<ol><li>aaa</li><li>ccc</li></ol>');

    editor.setContent('<ol><li>aaa</li><li>foo<br><br></li><li>ccc</li></ol>', { format: 'raw' });
    TinySelections.setSelection(editor, [ 0, 1 ], 0, [ 0, 2 ], 0);
    TinyContentActions.keystroke(editor, Keys.delete());
    TinyAssertions.assertContent(editor, '<ol><li>aaa</li><li>ccc</li></ol>');

    editor.setContent('<ol><li>aaa</li><li>foo<br><br><br></li><li>ccc</li></ol>', { format: 'raw' });
    TinySelections.setSelection(editor, [ 0, 1 ], 0, [ 0, 2 ], 0);
    TinyContentActions.keystroke(editor, Keys.delete());
    TinyAssertions.assertContent(editor, '<ol><li>aaa</li><li>ccc</li></ol>');
  });
});
