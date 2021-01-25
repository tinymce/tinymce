import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { SetContentEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as InsertContent from 'tinymce/core/content/InsertContent';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.content.InsertContentTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  it('TBA: insertAtCaret - i inside text, converts to em', () => {
    const editor = hook.editor();
    editor.setContent('<p>1234</p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
    InsertContent.insertAtCaret(editor, '<i>a</i>');
    TinyAssertions.assertContent(editor, '<p>12<em>a</em>34</p>');
  });

  it('TBA: insertAtCaret - ul at beginning of li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>12</li></ul>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li></ul>', paste: true });
    TinyAssertions.assertContent(editor, '<ul><li>a</li><li>12</li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 0, [ 0, 1, 0 ], 0);
  });

  it('TBA: insertAtCaret - ul with multiple items at beginning of li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>12</li></ul>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li><li>b</li></ul>', paste: true });
    TinyAssertions.assertContent(editor, '<ul><li>a</li><li>b</li><li>12</li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 2, 0 ], 0, [ 0, 2, 0 ], 0);
  });

  it('TBA: insertAtCaret - ul at end of li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>12</li></ul>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 2, [ 0, 0, 0 ], 2);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li></ul>', paste: true });
    TinyAssertions.assertContent(editor, '<ul><li>12</li><li>a</li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 1, [ 0, 1, 0 ], 1);
  });

  it('TBA: insertAtCaret - ul with multiple items at end of li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>12</li></ul>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 2, [ 0, 0, 0 ], 2);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li><li>b</li><li>c</li></ul>', paste: true });
    TinyAssertions.assertContent(editor, '<ul><li>12</li><li>a</li><li>b</li><li>c</li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 3, 0 ], 1, [ 0, 3, 0 ], 1);
  });

  it('TBA: insertAtCaret - ul with multiple items in middle of li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>12</li></ul>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li><li>b</li></ul>', paste: true });
    TinyAssertions.assertContent(editor, '<ul><li>1</li><li>a</li><li>b</li><li>2</li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 2, 0 ], 1, [ 0, 2, 0 ], 1);
  });

  it('TBA: insertAtCaret - ul in middle of li with formatting', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li><em><strong>12</strong></em></li></ul>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 1, [ 0, 0, 0, 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li></ul>', paste: true });
    TinyAssertions.assertContent(editor, '<ul><li><em><strong>1</strong></em></li><li>a</li><li><em><strong>2</strong></em></li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 1, [ 0, 1, 0 ], 1);
  });

  it('TBA: insertAtCaret - ul with trailing empty block in middle of li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li><li>d</li></ul>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>b</li><li>c</li></ul><p>\u00a0</p>', paste: true });
    TinyAssertions.assertContent(editor, '<ul><li>a</li><li>b</li><li>c</li><li>d</li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 2, 0 ], 1, [ 0, 2, 0 ], 1);
  });

  it('TBA: insertAtCaret - ul at beginning of li with empty end li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>12</li></ul>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li><li></li></ul>', paste: true });
    TinyAssertions.assertContent(editor, '<ul><li>a</li><li>12</li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 0, [ 0, 1, 0 ], 0);
  });

  it('TBA: insertAtCaret - merge inline elements', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong><em>abc</em></strong></p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 1, [ 0, 0, 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, { content: '<em><strong>123</strong></em>', merge: true });
    TinyAssertions.assertContent(editor, '<p><strong><em>a123bc</em></strong></p>');
  });

  it('TINY-1231: insertAtCaret - list into empty table cell with invalid contents', () => {
    const editor = hook.editor();
    editor.setContent('<table class="mce-item-table"><tbody><tr><td><br></td></tr></tbody></table>', { format: 'raw' });
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, {
      content: '<meta http-equiv="content-type" content="text/html; charset=utf-8"><ul><li>a</li></ul>',
      paste: true
    });
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td><ul><li>a</li></ul></td></tr></tbody></table>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0, 0, 0 ], 1, [ 0, 0, 0, 0, 0, 0, 0 ], 1);
  });

  it('TBA: insertAtCaret - content into single table cell with all content selected', () => {
    const editor = hook.editor();
    editor.setContent('<table class="mce-item-table"><tbody><tr><td>content</td></tr></tbody></table>', { format: 'raw' });
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 7);
    InsertContent.insertAtCaret(editor, { content: 'replace', paste: true });
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td>replace</td></tr></tbody></table>');
  });

  it('TBA: insertAtCaret - empty paragraph pad the empty element with br on insert and nbsp on save', () => {
    const editor = hook.editor();
    editor.setContent('<p>ab</p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, { content: '<p></p>', merge: true });
    assert.equal(editor.getContent({ format: 'raw' }), '<p>a</p><p><br data-mce-bogus="1"></p><p>b</p>', 'Raw content');
    TinyAssertions.assertContent(editor, '<p>a</p><p>\u00a0</p><p>b</p>');
  });

  it('TBA: insertAtCaret prevent default of beforeSetContent', () => {
    const editor = hook.editor();
    let args: EditorEvent<SetContentEvent>;

    const handler = (e: EditorEvent<SetContentEvent>) => {
      if (e.selection === true) {
        e.preventDefault();
        e.content = '<h1>b</h1>';
        editor.getBody().innerHTML = '<h1>c</h1>';
      }
    };

    const collector = (e: EditorEvent<SetContentEvent>) => {
      args = e;
    };

    editor.on('BeforeSetContent', handler);
    editor.on('SetContent', collector);

    editor.setContent('<p>a</p>');
    editor.selection.setCursorLocation(editor.dom.select('p')[0].firstChild, 0);
    InsertContent.insertAtCaret(editor, { content: '<p>b</p>', paste: true });
    assert.equal(editor.getContent(), '<h1>c</h1>');
    assert.equal(args.content, '<h1>b</h1>');
    assert.equal(args.type, 'setcontent');
    assert.isTrue(args.paste);

    editor.off('BeforeSetContent', handler);
    editor.on('BeforeSetContent', collector);
  });

  it('TBA: insertAtCaret - text content at a text node with a trailing nbsp character', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc&nbsp;</p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 4, [ 0, 0 ], 4);
    InsertContent.insertAtCaret(editor, 'd');
    TinyAssertions.assertContent(editor, '<p>abc d</p>');
  });

  it('TBA: insertAtCaret - html at a text node with a trailing nbsp character', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc&nbsp;</p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 4, [ 0, 0 ], 4);
    InsertContent.insertAtCaret(editor, '<em>d</em>');
    TinyAssertions.assertContent(editor, '<p>abc <em>d</em></p>');
  });

  it('TBA: insertAtCaret - text in the middle of a text node with nbsp characters', () => {
    const editor = hook.editor();
    editor.setContent('<p>a&nbsp;c</p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
    InsertContent.insertAtCaret(editor, 'b');
    TinyAssertions.assertContent(editor, '<p>a bc</p>');
  });

  it('TBA: insertAtCaret - html in the middle of a text node with nbsp characters', () => {
    const editor = hook.editor();
    editor.setContent('<p>a&nbsp;c</p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
    InsertContent.insertAtCaret(editor, '<em>b</em>');
    TinyAssertions.assertContent(editor, '<p>a <em>b</em>c</p>');
  });

  it('TINY-5966:  insertAtCaret - text content at a text node with a leading nbsp character', () => {
    const editor = hook.editor();
    editor.setContent('<p>&nbsp;abc</p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, 'd');
    TinyAssertions.assertContent(editor, '<p>d abc</p>');
  });

  it('TINY-5966:  insertAtCaret - html at a text node with a leading nbsp character', () => {
    const editor = hook.editor();
    editor.setContent('<p>&nbsp;abc</p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, '<em>d</em>');
    TinyAssertions.assertContent(editor, '<p><em>d</em> abc</p>');
  });

  it('TINY-5966:  insertAtCaret - text content at a text node with a only a nbsp character', () => {
    const editor = hook.editor();
    editor.setContent('<p>&nbsp;</p>', { format: 'raw' });
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, 'a');
    TinyAssertions.assertContent(editor, '<p>\u00a0a</p>');

    editor.setContent('<p>&nbsp;</p>', { format: 'raw' });
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, 'a');
    TinyAssertions.assertContent(editor, '<p>a\u00a0</p>');
  });

  it('TINY-5966:  insertAtCaret - html at a text node with a only a nbsp character', () => {
    const editor = hook.editor();
    editor.setContent('<p>&nbsp;</p>', { format: 'raw' });
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, '<em>a</em>');
    TinyAssertions.assertContent(editor, '<p>\u00a0<em>a</em></p>');

    editor.setContent('<p>&nbsp;</p>', { format: 'raw' });
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, '<em>a</em>');
    TinyAssertions.assertContent(editor, '<p><em>a</em>\u00a0</p>');
  });

  it('TINY-5966:  insertAtCaret - text content at a empty block with leading/trailing spaces', () => {
    const editor = hook.editor();
    editor.setContent('<p></p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, ' a ');
    TinyAssertions.assertContent(editor, '<p>\u00a0a\u00a0</p>');
  });

  it('TINY-5966:  insertAtCaret - text content at a text node between 2 spaces with leading/trailing spaces', () => {
    const editor = hook.editor();
    editor.setContent('<p>a&nbsp; c</p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
    InsertContent.insertAtCaret(editor, ' b ');
    TinyAssertions.assertContent(editor, '<p>a\u00a0 b\u00a0 c</p>');
  });

  it('TINY-5966:  insertAtCaret - text content at a text node before br', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<br>b</p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, ' c ');
    TinyAssertions.assertContent(editor, '<p>a c\u00a0<br />b</p>');

    editor.setContent('<p>a&nbsp;<br>&nbsp;b</p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
    InsertContent.insertAtCaret(editor, 'c');
    TinyAssertions.assertContent(editor, '<p>a c<br />\u00a0b</p>');
  });

  it('TINY-5966:  insertAtCaret - html content at a text node before br', () => {
    const editor = hook.editor();
    editor.setContent('<p>a&nbsp;<br>&nbsp;b</p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
    InsertContent.insertAtCaret(editor, '<em>c</em>');
    TinyAssertions.assertContent(editor, '<p>a <em>c</em><br />\u00a0b</p>');
  });

  it('TINY-5966:  insertAtCaret - text content at a text node after br', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<br>b</p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 2 ], 0, [ 0, 2 ], 0);
    InsertContent.insertAtCaret(editor, ' c ');
    TinyAssertions.assertContent(editor, '<p>a<br />\u00a0c b</p>');

    editor.setContent('<p>a&nbsp;<br>&nbsp;b</p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 2 ], 0, [ 0, 2 ], 0);
    InsertContent.insertAtCaret(editor, 'c');
    TinyAssertions.assertContent(editor, '<p>a\u00a0<br />c b</p>');
  });

  it('TINY-5966:  insertAtCaret - html content at a text node after br', () => {
    const editor = hook.editor();
    editor.setContent('<p>a&nbsp;<br>&nbsp;b</p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 2 ], 0, [ 0, 2 ], 0);
    InsertContent.insertAtCaret(editor, '<em>c</em>');
    TinyAssertions.assertContent(editor, '<p>a\u00a0<br /><em>c</em> b</p>');
  });

  it('TINY-5966:  insertAtCaret - text content with spaces in pre', () => {
    const editor = hook.editor();
    editor.setContent('<pre></pre>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, '  a  ');
    TinyAssertions.assertContent(editor, '<pre>  a  </pre>');

    editor.setContent('<pre>a b c</pre>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 3);
    InsertContent.insertAtCaret(editor, ' b ');
    TinyAssertions.assertContent(editor, '<pre>a  b  c</pre>');
  });

  it('TINY-5966:  insertAtCaret - html content with spaces in pre', () => {
    const editor = hook.editor();
    editor.setContent('<pre></pre>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, ' <strong> a </strong> ');
    TinyAssertions.assertContent(editor, '<pre> <strong> a </strong> </pre>');
  });
});
