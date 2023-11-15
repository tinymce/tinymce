import { context, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { SetContentEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as InsertContent from 'tinymce/core/content/InsertContent';

describe('browser.tinymce.core.content.InsertContentTest', () => {
  const isSafari = PlatformDetection.detect().browser.isSafari();

  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    custom_elements: '~foo-bar'
  }, [], true);

  it('TBA: insertAtCaret - i inside text, converts to em', () => {
    const editor = hook.editor();
    editor.setContent('<p>1234</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
    InsertContent.insertAtCaret(editor, '<i>a</i>');
    TinyAssertions.assertContent(editor, '<p>12<em>a</em>34</p>');
  });

  it('TBA: insertAtCaret - ul at beginning of li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>12</li></ul>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li></ul>', paste: true });
    TinyAssertions.assertContent(editor, '<ul><li>a</li><li>12</li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 0, [ 0, 1, 0 ], 0);
  });

  it('TBA: insertAtCaret - ul with multiple items at beginning of li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>12</li></ul>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li><li>b</li></ul>', paste: true });
    TinyAssertions.assertContent(editor, '<ul><li>a</li><li>b</li><li>12</li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 2, 0 ], 0, [ 0, 2, 0 ], 0);
  });

  it('TBA: insertAtCaret - ul at end of li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>12</li></ul>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 2, [ 0, 0, 0 ], 2);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li></ul>', paste: true });
    TinyAssertions.assertContent(editor, '<ul><li>12</li><li>a</li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 1, [ 0, 1, 0 ], 1);
  });

  it('TBA: insertAtCaret - ul with multiple items at end of li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>12</li></ul>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 2, [ 0, 0, 0 ], 2);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li><li>b</li><li>c</li></ul>', paste: true });
    TinyAssertions.assertContent(editor, '<ul><li>12</li><li>a</li><li>b</li><li>c</li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 3, 0 ], 1, [ 0, 3, 0 ], 1);
  });

  it('TBA: insertAtCaret - ul with multiple items in middle of li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>12</li></ul>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li><li>b</li></ul>', paste: true });
    TinyAssertions.assertContent(editor, '<ul><li>1</li><li>a</li><li>b</li><li>2</li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 2, 0 ], 1, [ 0, 2, 0 ], 1);
  });

  it('TBA: insertAtCaret - ul in middle of li with formatting', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li><em><strong>12</strong></em></li></ul>');
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 1, [ 0, 0, 0, 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li></ul>', paste: true });
    TinyAssertions.assertContent(editor, '<ul><li><em><strong>1</strong></em></li><li>a</li><li><em><strong>2</strong></em></li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 1, [ 0, 1, 0 ], 1);
  });

  it('TBA: insertAtCaret - ul with trailing empty block in middle of li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li><li>d</li></ul>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>b</li><li>c</li></ul><p>\u00a0</p>', paste: true });
    TinyAssertions.assertContent(editor, '<ul><li>a</li><li>b</li><li>c</li><li>d</li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 2, 0 ], 1, [ 0, 2, 0 ], 1);
  });

  it('TBA: insertAtCaret - ul at beginning of li with empty end li', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>12</li></ul>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li><li></li></ul>', paste: true });
    TinyAssertions.assertContent(editor, '<ul><li>a</li><li>12</li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 0, [ 0, 1, 0 ], 0);
  });

  it('TBA: insertAtCaret - merge inline elements', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong><em>abc</em></strong></p>');
    TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 1, [ 0, 0, 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, { content: '<em><strong>123</strong></em>', merge: true });
    TinyAssertions.assertContent(editor, '<p><strong><em>a123bc</em></strong></p>');
  });

  it('TINY-1231: insertAtCaret - list into empty table cell with invalid contents', () => {
    const editor = hook.editor();
    editor.setContent('<table class="mce-item-table"><tbody><tr><td><br></td></tr></tbody></table>', { format: 'raw' });
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
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 7);
    InsertContent.insertAtCaret(editor, { content: 'replace', paste: true });
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td>replace</td></tr></tbody></table>');
  });

  it('TBA: insertAtCaret - empty paragraph pad the empty element with br on insert and nbsp on save', () => {
    const editor = hook.editor();
    editor.setContent('<p>ab</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, { content: '<p></p>', merge: true });
    assert.equal(editor.getContent({ format: 'raw' }), '<p>a</p><p><br data-mce-bogus="1"></p><p>b</p>', 'Raw content');
    TinyAssertions.assertContent(editor, '<p>a</p><p>\u00a0</p><p>b</p>');
  });

  it('TBA: insertAtCaret prevent default of beforeSetContent', () => {
    const editor = hook.editor();
    let args: EditorEvent<SetContentEvent> | undefined;

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
    editor.selection.setCursorLocation(editor.dom.select('p')[0].firstChild as Text, 0);
    InsertContent.insertAtCaret(editor, { content: '<p>b</p>', paste: true });
    TinyAssertions.assertContent(editor, '<h1>c</h1>');
    assert.equal(args?.content, '<h1>b</h1>');
    assert.equal(args?.type, 'setcontent');
    assert.isTrue(args?.paste);

    editor.off('BeforeSetContent', handler);
    editor.on('BeforeSetContent', collector);
  });

  it('TBA: insertAtCaret - text content at a text node with a trailing nbsp character', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc&nbsp;</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 4, [ 0, 0 ], 4);
    InsertContent.insertAtCaret(editor, 'd');
    TinyAssertions.assertContent(editor, '<p>abc d</p>');
  });

  it('TBA: insertAtCaret - html at a text node with a trailing nbsp character', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc&nbsp;</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 4, [ 0, 0 ], 4);
    InsertContent.insertAtCaret(editor, '<em>d</em>');
    TinyAssertions.assertContent(editor, '<p>abc <em>d</em></p>');
  });

  it('TBA: insertAtCaret - text in the middle of a text node with nbsp characters', () => {
    const editor = hook.editor();
    editor.setContent('<p>a&nbsp;c</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
    InsertContent.insertAtCaret(editor, 'b');
    TinyAssertions.assertContent(editor, '<p>a bc</p>');
  });

  it('TBA: insertAtCaret - html in the middle of a text node with nbsp characters', () => {
    const editor = hook.editor();
    editor.setContent('<p>a&nbsp;c</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
    InsertContent.insertAtCaret(editor, '<em>b</em>');
    TinyAssertions.assertContent(editor, '<p>a <em>b</em>c</p>');
  });

  it('TINY-5966:  insertAtCaret - text content at a text node with a leading nbsp character', () => {
    const editor = hook.editor();
    editor.setContent('<p>&nbsp;abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, 'd');
    TinyAssertions.assertContent(editor, '<p>d abc</p>');
  });

  it('TINY-5966:  insertAtCaret - html at a text node with a leading nbsp character', () => {
    const editor = hook.editor();
    editor.setContent('<p>&nbsp;abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, '<em>d</em>');
    TinyAssertions.assertContent(editor, '<p><em>d</em> abc</p>');
  });

  it('TINY-5966:  insertAtCaret - text content at a text node with a only a nbsp character', () => {
    const editor = hook.editor();
    editor.setContent('<p>&nbsp;</p>', { format: 'raw' });
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, 'a');
    TinyAssertions.assertContent(editor, '<p>\u00a0a</p>');

    editor.setContent('<p>&nbsp;</p>', { format: 'raw' });
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, 'a');
    TinyAssertions.assertContent(editor, '<p>a\u00a0</p>');
  });

  it('TINY-5966:  insertAtCaret - html at a text node with a only a nbsp character', () => {
    const editor = hook.editor();
    editor.setContent('<p>&nbsp;</p>', { format: 'raw' });
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, '<em>a</em>');
    TinyAssertions.assertContent(editor, '<p>\u00a0<em>a</em></p>');

    editor.setContent('<p>&nbsp;</p>', { format: 'raw' });
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, '<em>a</em>');
    TinyAssertions.assertContent(editor, '<p><em>a</em>\u00a0</p>');
  });

  it('TINY-5966:  insertAtCaret - text content at a empty block with leading/trailing spaces', () => {
    const editor = hook.editor();
    editor.setContent('<p></p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, ' a ');
    TinyAssertions.assertContent(editor, '<p>\u00a0a\u00a0</p>');
  });

  it('TINY-5966:  insertAtCaret - text content at a text node between 2 spaces with leading/trailing spaces', () => {
    const editor = hook.editor();
    editor.setContent('<p>a&nbsp; c</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
    InsertContent.insertAtCaret(editor, ' b ');
    TinyAssertions.assertContent(editor, '<p>a\u00a0 b\u00a0 c</p>');
  });

  it('TINY-5966:  insertAtCaret - text content at a text node before br', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<br>b</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, ' c ');
    TinyAssertions.assertContent(editor, '<p>a c\u00a0<br>b</p>');

    editor.setContent('<p>a&nbsp;<br>&nbsp;b</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
    InsertContent.insertAtCaret(editor, 'c');
    TinyAssertions.assertContent(editor, '<p>a c<br>\u00a0b</p>');
  });

  it('TINY-5966:  insertAtCaret - html content at a text node before br', () => {
    const editor = hook.editor();
    editor.setContent('<p>a&nbsp;<br>&nbsp;b</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
    InsertContent.insertAtCaret(editor, '<em>c</em>');
    TinyAssertions.assertContent(editor, '<p>a <em>c</em><br>\u00a0b</p>');
  });

  it('TINY-5966:  insertAtCaret - text content at a text node after br', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<br>b</p>');
    TinySelections.setSelection(editor, [ 0, 2 ], 0, [ 0, 2 ], 0);
    InsertContent.insertAtCaret(editor, ' c ');
    TinyAssertions.assertContent(editor, '<p>a<br>\u00a0c b</p>');

    editor.setContent('<p>a&nbsp;<br>&nbsp;b</p>');
    TinySelections.setSelection(editor, [ 0, 2 ], 0, [ 0, 2 ], 0);
    InsertContent.insertAtCaret(editor, 'c');
    TinyAssertions.assertContent(editor, '<p>a\u00a0<br>c b</p>');
  });

  it('TINY-5966:  insertAtCaret - html content at a text node after br', () => {
    const editor = hook.editor();
    editor.setContent('<p>a&nbsp;<br>&nbsp;b</p>');
    TinySelections.setSelection(editor, [ 0, 2 ], 0, [ 0, 2 ], 0);
    InsertContent.insertAtCaret(editor, '<em>c</em>');
    TinyAssertions.assertContent(editor, '<p>a\u00a0<br><em>c</em> b</p>');
  });

  it('TINY-5966:  insertAtCaret - text content with spaces in pre', () => {
    const editor = hook.editor();
    editor.setContent('<pre></pre>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, '  a  ');
    TinyAssertions.assertContent(editor, '<pre>  a  </pre>');

    editor.setContent('<pre>a b c</pre>');
    TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 3);
    InsertContent.insertAtCaret(editor, ' b ');
    TinyAssertions.assertContent(editor, '<pre>a  b  c</pre>');
  });

  it('TINY-5966:  insertAtCaret - html content with spaces in pre', () => {
    const editor = hook.editor();
    editor.setContent('<pre></pre>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    InsertContent.insertAtCaret(editor, ' <strong> a </strong> ');
    TinyAssertions.assertContent(editor, '<pre> <strong> a </strong> </pre>');
  });

  it('TINY-8860: insertAtCaret - insert pre block on empty p', () => {
    const editor = hook.editor();
    editor.setContent('<p></p>');
    TinySelections.setCursor(editor, [ 0 ], 0);
    InsertContent.insertAtCaret(editor, { content: '<pre>abc</pre>', paste: true });
    TinyAssertions.assertContent(editor, '<pre>abc</pre>');
  });

  it('TINY-8860: insertAtCaret - insert styled pre block', () => {
    const editor = hook.editor();
    editor.setContent('<pre>abc</pre>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, { content: '<pre><strong>123</strong></pre>', paste: true });
    TinyAssertions.assertContent(editor, '<pre>a<strong>123</strong>bc</pre>');
  });

  it('TINY-8860: insertAtCaret - insert plain pre in styled pre block', () => {
    const editor = hook.editor();
    editor.setContent('<pre><strong>123</strong>abc</pre>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, { content: '<pre>abc</pre>', paste: true });
    TinyAssertions.assertContent(editor, '<pre><strong>1abc23</strong>abc</pre>');
  });

  it('TINY-8860: insertAtCaret - insert styled pre in differently styled pre block', () => {
    const editor = hook.editor();
    editor.setContent('<pre><strong>1abc23</strong>abc</pre>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 5);
    InsertContent.insertAtCaret(editor, { content: '<pre><em>abc</em></pre>', paste: true });
    TinyAssertions.assertContent(editor, '<pre><strong>1abc2<em>abc</em>3</strong>abc</pre>');
  });

  it('TINY-8860: insertAtCaret - insert cef pre in pre block', () => {
    const editor = hook.editor();
    editor.setContent('<pre>abc</pre>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    InsertContent.insertAtCaret(editor, { content: '<pre contenteditable="false">123</pre>', paste: true });
    TinyAssertions.assertContent(editor, '<pre>a</pre><pre contenteditable="false">123</pre><pre>bc</pre>');
  });

  it('TINY-8860: insertAtCaret - insert pre over cef pre block', () => {
    const editor = hook.editor();
    editor.setContent('<pre contenteditable="false">abc</pre>');
    TinySelections.setSelection(editor, [], 1, [], 2);
    InsertContent.insertAtCaret(editor, { content: '<pre>123</pre>', paste: true });
    TinyAssertions.assertContent(editor, '<pre>123</pre>');
  });

  it('TINY-6263: insertAtCaret - merge font-size spans', () => {
    const editor = hook.editor();
    editor.setContent('');
    TinySelections.setCursor(editor, [ 0 ], 0);
    InsertContent.insertAtCaret(editor, {
      content: '<p>' +
        '<span style="font-size: 9pt;">' +
        '<span style="font-size: 14pt;">' +
        '<span style="font-size: 9pt;">' +
        '<span style="font-size: 9pt;">test</span>' +
        '</span>' +
        '</span>' +
        '</span>' +
        '</p>',
      merge: true
    });
    TinyAssertions.assertContent(editor, '<p>' +
      '<span style="font-size: 9pt;">' +
      '<span style="font-size: 14pt;">' +
      '<span style="font-size: 9pt;">test</span>' +
      '</span>' +
      '</span>' +
      '</p>');
  });

  it('TINY-6263: insertAtCaret - merge spans with similar node in-between', () => {
    const editor = hook.editor();
    editor.setContent('');
    TinySelections.setCursor(editor, [ 0 ], 0);
    InsertContent.insertAtCaret(editor, {
      content: '<p>' +
        '<span style="color: red; font-size: 9pt;">' +
        '<span style="background-color: red; color: red;">' +
        '<span style="color: red; font-size: 9pt;">test</span>' +
        '</span>' +
        '</span>' +
        '</p>',
      merge: true
    });
    TinyAssertions.assertContent(editor, '<p>' +
      '<span style="color: red; font-size: 9pt;">' +
      '<span style="background-color: red; color: red;">test</span>' +
      '</span>' +
      '</p>');
  });

  it('TINY-6263: insertAtCaret - merge font colors with other surrounding inline elements in-between', () => {
    const editor = hook.editor();
    editor.setContent('');
    TinySelections.setCursor(editor, [ 0 ], 0);
    InsertContent.insertAtCaret(editor, {
      content: '<p>' +
        '<span style="color: yellow;">' +
        '<span style="background-color: red;">' +
        '<span style="color: yellow;">' +
        '<span style="color: red;">red</span>' +
        'yellow' +
        '<span style="color: blue;">' +
        '<strong>' +
        '<span style="color: blue;">blue</span>' +
        '</strong>' +
        '</span>' +
        '</span>' +
        '</span>' +
        '</span>' +
        '</p>',
      merge: true
    });
    TinyAssertions.assertContent(editor, '<p>' +
    '<span style="color: yellow;">' +
    '<span style="background-color: red;">' +
    '<span style="color: red;">red</span>' +
    'yellow' +
    '<span style="color: blue;"><strong>blue</strong></span>' +
    '</span>' +
    '</span>' +
    '</p>');
  });

  it('TINY-6263: insertAtCaret - spans with non-inheritable styles should not merge', () => {
    const editor = hook.editor();
    editor.setContent('');
    TinySelections.setCursor(editor, [ 0 ], 0);
    InsertContent.insertAtCaret(editor, {
      content: '<p>' +
        '<span style="margin: 5px;">' +
        '<span style="margin-left: 5px; margin-right: 5px;">' +
        '<span style="margin: 5px;">test</span>' +
        '</span>' +
        '</span>' +
        '</p>' +
        '<p>' +
        '<span style="border-style: solid;">' +
        '<span style="border: solid red;">' +
        '<span style="border-style: solid;">test</span>' +
        '</span>' +
        '</span>' +
        '</p>',
      merge: true
    });
    TinyAssertions.assertContent(editor, '<p>' +
    '<span style="margin: 5px;">' +
    '<span style="margin-left: 5px; margin-right: 5px;">' +
    '<span style="margin: 5px;">test</span>' +
    '</span>' +
    '</span>' +
    '</p>' +
    '<p>' +
    '<span style="border-style: solid;">' +
    '<span style="border: solid red;">' +
    '<span style="border-style: solid;">test</span>' +
    '</span>' +
    '</span>' +
    '</p>');
  });

  it('TINY-6263: insertAtCaret - shorthand styles with longhand properties in-between', () => {
    const editor = hook.editor();
    editor.setContent('');
    TinySelections.setCursor(editor, [ 0 ], 0);
    InsertContent.insertAtCaret(editor, {
      content: '<p>' +
        '<span style="font: italic 10px sans-serif;">' +
        '<span style="font-size: 10px;">' +
        '<span style="font: italic 10px sans-serif;">test</span>' +
        '</span>' +
        '</span>' +
        '</p>' +
        '<p>' +
        '<span style="font: italic 10px sans-serif;">' +
        '<span style="font-size: 12px;">' +
        '<span style="font: italic 10px sans-serif;">test</span>' +
        '</span>' +
        '</span>' +
        '</p>',
      merge: true
    });
    TinyAssertions.assertContent(editor, '<p>' +
      '<span style="font: italic 10px sans-serif;">' +
      '<span style="font-size: 10px;">test</span>' +
      '</span>' +
      '</p>' +
      '<p>' +
      '<span style="font: italic 10px sans-serif;">' +
      '<span style="font-size: 12px;">' +
      '<span style="font: italic 10px sans-serif;">test</span>' +
      '</span>' +
      '</span>' +
      '</p>');
  });

  it('TINY-6263: insertAtCaret - longhand style spans with shorthand style span in-between', () => {
    const editor = hook.editor();
    editor.setContent('');
    TinySelections.setCursor(editor, [ 0 ], 0);
    InsertContent.insertAtCaret(editor, {
      content: '<p>' +
        '<span style="font-style: italic;">' +
        '<span style="font: italic 12px sans-serif;">' +
        '<span style="font-style: italic;">test</span>' +
        '</span>' +
        '</span>' +
        '</span>' +
        '</span>' +
        '</p>' +
        '<p>' +
        '<span style="font-size: 10px;">' +
        '<span style="font: italic 12px sans-serif;">' +
        '<span style="font-size: 10px;">test</span>' +
        '</span>' +
        '</span>' +
        '</p>',
      merge: true
    });
    TinyAssertions.assertContent(editor, '<p>' +
      '<span style="font-style: italic;">' +
      '<span style="font: italic 12px sans-serif;">test</span>' +
      '</span>' +
      '</p>' +
      '<p>' +
      '<span style="font-size: 10px;">' +
      '<span style="font: italic 12px sans-serif;">' +
      '<span style="font-size: 10px;">test</span>' +
      '</span>' +
      '</span>' +
      '</p>');
  });

  it('TINY-7756: Content with nested elements that will be invalid if parent is unwrapped', () => {
    const editor = hook.editor();
    editor.setContent('');
    TinySelections.setCursor(editor, [ 0 ], 0);
    InsertContent.insertAtCaret(
      editor,
      '<table>' +
        '<button>' +
          '<a>' +
            '<meta>' +
            '</meta>' +
          '</a>' +
        '</button>' +
      '</table>'
    );
    TinyAssertions.assertContent(editor, '');

    editor.setContent('');
    TinySelections.setCursor(editor, [ 0 ], 0);
    InsertContent.insertAtCaret(
      editor,
      '<table>' +
        '<tbody>' +
          '<tr>' +
            '<td>' +
              '<meta>' +
                '<button>' +
                  '<img/>' +
                  '<button>' +
                    '<a>' +
                      '<meta></meta>' +
                    '</a>' +
                  '</button>' +
                  '<img/>' +
                '</button>' +
              '</meta>' +
            '</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>'
    );

    TinyAssertions.assertContent(
      editor,
      '<table>' +
        '<tbody>' +
          '<tr>' +
            '<td>' +
              '<button>' +
                '<img>' +
              '</button>' +
              '<button></button>' +
              '<img>' +
            '</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>'
    );
  });

  it('TINY-7842: Inserting content into a contenteditable=true block within a contenteditable=false parent', () => {
    const editor = hook.editor();
    editor.setContent(
      '<p>some content to stop the fake caret rendering before the CEF element</p>' +
      '<div contenteditable="false">' +
        '<p>Non editable content</p>' +
        '<div contenteditable="true">' +
          '<p>Editablecontent</p>' +
        '</div>' +
      '</div>'
    );
    TinySelections.setCursor(editor, [ 1, 1, 0, 0 ], 8);
    InsertContent.insertAtCaret(editor, ' pasted ');
    TinyAssertions.assertContent(
      editor,
      '<p>some content to stop the fake caret rendering before the CEF element</p>' +
      '<div contenteditable="false">' +
        '<p>Non editable content</p>' +
        '<div contenteditable="true">' +
          '<p>Editable pasted content</p>' +
        '</div>' +
      '</div>'
    );
    TinyAssertions.assertCursor(editor, [ 1, 1, 0, 0 ], 16);
  });

  it('TINY-8444: Inserting block content runs the node filters', () => {
    const editor = hook.editor();
    editor.setContent('<p>Content</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 3);

    let numNodesFiltered = 0;
    editor.parser.addNodeFilter('div', (nodes) => {
      numNodesFiltered += nodes.length;
    });

    editor.insertContent('<div>inserted content</div>');
    assert.equal(numNodesFiltered, 1, 'Node filters should have run');
    TinyAssertions.assertContent(editor, '<p>Con</p><div>inserted content</div><p>tent</p>');
  });

  it('TINY-4784: An empty custom element should not be removed when inserted', () => {
    const editor = hook.editor();
    editor.setContent('<p></p>');

    editor.insertContent('<foo-bar contenteditable="false" data-name="foobar"></foo-bar>');
    TinyAssertions.assertContent(editor, '<p><foo-bar contenteditable="false" data-name="foobar"></foo-bar></p>');
  });

  it('TINY-9193: it should keep the caret in the same paragraph where insertion occurred', () => {
    const editor = hook.editor();
    editor.setContent('<p>foo</p><p>bar<span></span>baz</p>', { format: 'raw' });
    TinySelections.setSelection(editor, [ 1 ], 0, [ 1 ], 1);
    editor.insertContent('X');
    TinyAssertions.assertRawContent(editor, '<p>foo</p><p>X<span></span>baz</p>');
  });

  context('Transparent blocks', () => {
    it('TINY-9172: Insert block anchor in regular block', () => {
      const editor = hook.editor();

      editor.setContent('<div>a</div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      editor.insertContent('<a href="#"><p>b</p></a>');
      TinyAssertions.assertContent(editor, '<div><a href="#"><p>b</p></a>a</div>');
      assert.isTrue(editor.dom.select('a[data-mce-block="true"]').length === 1, 'Should have data-mce-block set to true');
    });

    it('TINY-9172: Insert block anchor in transparent block should split the block', () => {
      const editor = hook.editor();

      editor.setContent('<a href="#1"><div>ac</div></a>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      editor.insertContent('<a href="#2"><p>b</p></a>');
      TinyAssertions.assertContent(editor, '<div><a href="#1">a</a><a href="#2"><p>b</p></a>c</div>');
    });

    it('TINY-9172: Insert inline anchor in anchor block should unwrap the inline anchor', () => {
      const editor = hook.editor();

      editor.setContent('<a href="#1"><div>ac</div></a>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      editor.insertContent('<a href="#2">b</a>');
      TinyAssertions.assertContent(editor, '<a href="#1"><div>abc</div></a>');
    });

    it('TINY-9172: Insert block in anchor should work and annotate the element with data-mce-block', () => {
      const editor = hook.editor();

      editor.setContent('<div><a href="#1">ac</a></div>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      editor.insertContent('<p>b</p>');
      TinyAssertions.assertContent(editor, '<div><a href="#1">a<p>b</p>c</a></div>');
      assert.isTrue(editor.dom.select('a[data-mce-block="true"]').length === 1, 'Should have data-mce-block set to true');
    });

    it('TINY-9172: Insert block in regular anchor should annotate the block with data-mce-block', () => {
      const editor = hook.editor();

      editor.setContent('<div><a href="#1">ac</a></div>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      editor.insertContent('<p>b</p>');
      TinyAssertions.assertContent(editor, '<div><a href="#1">a<p>b</p>c</a></div>');
      TinyAssertions.assertContentPresence(editor, { 'a[data-mce-block]': 1 });
    });

    it('TINY-9172: Insert block mixed with inlines in regular anchor should annotate the block with data-mce-block', () => {
      const editor = hook.editor();

      editor.setContent('<div><a href="#1">ad</a></div>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      editor.insertContent('<p>b</p><strong><em>c</em></strong>');
      TinyAssertions.assertContent(editor, '<div><a href="#1">a<p>b</p><strong><em>c</em></strong>d</a></div>');
      TinyAssertions.assertContentPresence(editor, { 'a[data-mce-block]': 1 });
    });

    it('TINY-9232: Insert paragraphs in anchor inside paragraph should split the paragraph and anchor', () => {
      const editor = hook.editor();

      editor.setContent('<p><a href="#1">ad</a></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      editor.insertContent('<p>b</p><p>c</p>');
      TinyAssertions.assertContent(editor, '<p><a href="#1">a</a></p><p>b</p><p>c</p><p><a href="#1">d</a></p>');
    });
  });

  context('Noneditable parents', () => {
    it('TINY-9462: insertContent in noneditable element should be a noop', () => {
      const editor = hook.editor();
      const content = '<div contenteditable="false">text</div>';

      editor.setContent(content);
      // Shifted since fake caret is before div
      TinySelections.setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 2);
      editor.insertContent('hello');
      TinyAssertions.assertContent(editor, content);
    });

    it('TINY-9462: insertContent in normal element in noneditable root should be a noop', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        const content = '<div>text</div>';

        editor.setContent(content);
        TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);
        editor.insertContent('hello');
        TinyAssertions.assertContent(editor, content);
      });
    });

    it('TINY-9462: insertContent in editable element in noneditable root should insert content', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        editor.setContent('<div contenteditable="true">text</div>');
        TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);
        editor.insertContent('hello');
        TinyAssertions.assertContent(editor, '<div contenteditable="true">thelloxt</div>');
      });
    });

    it('TINY-9595: insert paragraphs in a paragraph editing host paragraph should unwrap the paragraphs and not split the div and em', () => {
      const editor = hook.editor();
      const content = '<div contenteditable="false"><p contenteditable="true"><em>ad</em></p></div>';

      editor.setContent(content);
      // Shifted since fake caret is before div
      TinySelections.setCursor(editor, [ 1, 0, 0, 0 ], 1);
      editor.insertContent('<p>b</p><p>c</p>');
      TinyAssertions.assertContent(editor, '<div contenteditable="false"><p contenteditable="true"><em>abcd</em></p></div>');
    });

    it('TINY-9595: insert paragraphs in a div editing host with an em should split the em but not the div editing host', () => {
      const editor = hook.editor();
      const content = '<div contenteditable="false"><div contenteditable="true"><em>ad</em></div></div>';

      editor.setContent(content);
      // Shifted since fake caret is before div
      TinySelections.setCursor(editor, [ 1, 0, 0, 0 ], 1);
      editor.insertContent('<p>b</p><p>c</p>');
      TinyAssertions.assertContent(editor, '<div contenteditable="false"><div contenteditable="true"><em>a</em><p>b</p><p>c</p><em>d</em></div></div>');
    });

    it('TINY-9595: insert paragraphs in a paragraph editing host in a noneditable root editor should unwrap the paragraphs', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        const content = '<p contenteditable="true"><em>ad</em></p>';

        editor.setContent(content);
        TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
        editor.insertContent('<p>b</p><p>c</p>');
        TinyAssertions.assertContent(editor, '<p contenteditable="true"><em>abcd</em></p>');
      });
    });
  });

  context('Summary elements', () => {
    it('TINY-9885: Should not be able to insert HR block into summary', () => {
      const editor = hook.editor();
      const initialContent = '<details><summary>helloworld</summary><div>body</div></details>';
      editor.setContent(initialContent);
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 'hello'.length);
      editor.execCommand('InsertHorizontalRule');
      TinyAssertions.assertContent(editor, initialContent);
    });

    it('TINY-9885: Should unwrap H1 element when inserting into summary element', () => {
      const editor = hook.editor();
      editor.setContent('<details><summary>helloworld</summary><div>body</div></details>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 'hello'.length);
      editor.insertContent('<h1>wonderful</h1>');
      TinyAssertions.assertContent(editor, '<details><summary>hellowonderfulworld</summary><div>body</div></details>');
    });
  });

  context('ZWNBSP', () => {
    it('TINY-10305: Should strip all ZWNBSP characters before inserting content', () => {
      const editor = hook.editor();
      editor.setContent('<p>initial</p>');
      TinySelections.setCursor(editor, [ 0 ], 0);
      editor.insertContent('<p>inser\uFEFFtion</p>');
      TinyAssertions.assertRawContent(editor, '<p>insertion</p><p>initial</p>');
    });

    it('TINY-10305: Should sanitize content that can cause mXSS via ZWNBSP trimming', () => {
      const editor = hook.editor();
      editor.setContent('<p>initial</p>');
      TinySelections.setCursor(editor, [ 0 ], 0);
      editor.insertContent('<!--\ufeff><iframe onload=alert(document.domain)>-></body>-->');
      // TINY-10305: Safari escapes text nodes within <iframe>.
      TinyAssertions.assertRawContent(editor, isSafari
        ? '<p><!----><iframe>-&gt;&lt;/body&gt;--&gt;&lt;span id="mce_marker" data-mce-type="bookmark"&gt;&amp;#xFEFF;&lt;/span&gt;&lt;/body&gt;</iframe>initial</p>'
        : '<p><!---->initial</p>');
    });
  });

  context('SVG elements', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      indent: false,
      base_url: '/project/tinymce/js/tinymce',
      extended_valid_elements: 'svg[width|height]'
    }, [], true);

    it('TINY-10237: Inserting SVG elements but filter out things like scripts', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      editor.insertContent('<svg><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"><desc><script>alert(1)</script><p>hello</p></circle></a></svg>');
      TinyAssertions.assertContent(editor, '<p>a<svg><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"><desc><p>hello</p></desc></circle></svg>b</p>');
    });
  });
});
