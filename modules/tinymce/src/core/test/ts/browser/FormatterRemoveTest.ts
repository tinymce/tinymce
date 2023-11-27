import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyApis, TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { ZWSP } from 'tinymce/core/text/Zwsp';

import * as KeyUtils from '../module/test/KeyUtils';

describe('browser.tinymce.core.FormatterRemoveTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    extended_valid_elements: 'b[style],i,span[style|contenteditable|class]',
    entities: 'raw',
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,' +
        'margin,margin-top,margin-right,margin-bottom,margin-left,display,text-align'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const getContent = (editor: Editor) => {
    return editor.getContent().toLowerCase().replace(/[\r]+/g, '');
  };

  it('Inline element on selected text', () => {
    const editor = hook.editor();
    editor.focus();
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b>1234</b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('b')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p>1234</p>', 'Inline element on selected text');
  });

  it('Inline element on selected text with remove=all', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { selector: 'b', remove: 'all' });
    editor.getBody().innerHTML = '<p><b title="text">1234</b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('b')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p>1234</p>', 'Inline element on selected text with remove=all');
  });

  it('Inline element on selected text with remove=none', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { selector: 'span', styles: { fontWeight: 'bold' }, remove: 'none' });
    editor.getBody().innerHTML = '<p><span style="font-weight:bold">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0], 0);
    rng.setEnd(editor.dom.select('p')[0], 1);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p><span>1234</span></p>', 'Inline element on selected text with remove=none');
  });

  it('Inline element style where element is format root', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'span', styles: { fontWeight: 'bold' }});
    editor.getBody().innerHTML = '<p><span style="font-weight:bold; color:#FF0000"><em>1234</em></span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('em')[0].firstChild as Text, 1);
    rng.setEnd(editor.dom.select('em')[0].firstChild as Text, 3);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p><span style="color: #ff0000; font-weight: bold;">' +
      '<em>1</em></span><span style="color: rgb(255, 0, 0);"><em>23</em></span>' +
      '<span style=\"color: #ff0000; font-weight: bold;\"><em>4' +
      '</em></span></p>', 'Inline element style where element is format root');
  });

  it('Partially selected inline element text', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b>1234</b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild as Text, 2);
    rng.setEnd(editor.dom.select('b')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p><b>12</b>34</p>', 'Partially selected inline element text');
  });

  it('Partially selected inline element text with children', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b><em><span>1234</span></em></b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[0].firstChild as Text, 2);
    rng.setEnd(editor.dom.select('span')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p><b><em><span>12</span></em></b><em><span>34</span></em></p>', 'Partially selected inline element text with children');
  });

  it('Partially selected inline element text with complex children', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'span', styles: { fontWeight: 'bold' }});
    editor.getBody().innerHTML = '<p><span style="font-weight:bold"><em><span style="color:#ff0000;font-weight:bold">1234</span></em></span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[1].firstChild as Text, 2);
    rng.setEnd(editor.dom.select('span')[1].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p><span style="font-weight: bold;"><em><span style="color: #ff0000; font-weight: bold;">12</span>' +
      '</em></span><em><span style="color: rgb(255, 0, 0);">34</span></em></p>', 'Partially selected inline element text with complex children');
  });

  it('Inline elements with exact flag', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'span', styles: { color: '#ff0000' }, exact: true });
    editor.getBody().innerHTML = '<p><span style="font-size:10px;color:#ff0000">1234</span><span style="font-size:10px;color:#00ff00">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0], 0);
    rng.setEnd(editor.dom.select('p')[0], 2);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p><span style="font-size: 10px;">1234</span><span style="color: #00ff00; font-size: 10px;">1234</span></p>', 'Inline elements with exact flag');
  });

  it('Inline elements with variables', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'span', styles: { color: '%color' }, exact: true });
    editor.getBody().innerHTML = '<p><span style="font-size:10px;color:#ff0000">1234</span><span style="font-size:10px;color:#00ff00">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0], 0);
    rng.setEnd(editor.dom.select('p')[0], 2);
    editor.selection.setRng(rng);
    editor.formatter.remove('format', { color: '#ff0000' });
    assert.equal(getContent(editor), '<p><span style="font-size: 10px;">1234</span><span style="color: #00ff00; font-size: 10px;">1234</span></p>', 'Inline elements on selected text with variables');
  });

  it('Inline elements with functions and variables', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      styles: {
        color: (vars) => {
          return vars?.color + '00';
        }
      },
      exact: true
    });

    editor.getBody().innerHTML = '<p><span style="font-size:10px;color:#ff0000">1234</span><span style="font-size:10px;color:#00ff00">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0], 0);
    rng.setEnd(editor.dom.select('p')[0], 2);
    editor.selection.setRng(rng);
    editor.formatter.remove('format', {
      color: '#ff00'
    });
    assert.equal(getContent(editor), '<p><span style="font-size: 10px;">1234</span><span style="color: #00ff00; font-size: 10px;">1234</span></p>', 'Inline elements with functions and variables');
  });

  it('End within start element', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b>1234<b>5678</b></b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0], 0);
    rng.setEnd(editor.dom.select('b')[0], 2);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p>12345678</p>', 'End within start element');
  });

  it('Start and end within similar format 1', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b><em><b>1234<b>5678</b></b></em></b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('em')[0], 0);
    rng.setEnd(editor.dom.select('b')[1], 2);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p><em>12345678</em></p>', 'Start and end within similar format 1');
  });

  it('Start and end within similar format 2', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b><em><b>1234</b><b>5678</b></em></b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('em')[0], 0);
    rng.setEnd(editor.dom.select('em')[0], 1);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p><em>1234</em><b><em><b>5678</b></em></b></p>', 'Start and end within similar format 2');
  });

  it('Start and end within similar format 3', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b><em><b>1234</b></em></b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('em')[0], 0);
    rng.setEnd(editor.dom.select('em')[0], 1);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p><em>1234</em></p>', 'Start and end within similar format 3');
  });

  it('End within start', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b><em>x<b>abc</b>y</em></b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0], 0);
    rng.setEnd(editor.dom.select('b')[1].firstChild as Text, 3);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p><em>x</em><em>abc</em><b><em>y</em></b></p>', 'End within start');
  });

  it('Remove block format', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { block: 'h1' });
    editor.getBody().innerHTML = '<h1>text</h1>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('h1')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('h1')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p>text</p>', 'Remove block format');
  });

  it('Remove wrapper block format', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { block: 'blockquote', wrapper: true });
    editor.getBody().innerHTML = '<blockquote><p>text</p></blockquote>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p>text</p>', 'Remove wrapper block format');
  });

  it('Remove span format within block with style', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { selector: 'span', attributes: [ 'style', 'class' ], remove: 'empty', split: true, expand: false, deep: true });
    const rng = editor.dom.createRng();
    editor.getBody().innerHTML = '<p style="color:#ff0000"><span style="color:#00ff00">text</span></p>';
    rng.setStart(editor.dom.select('span')[0].firstChild as Text, 1);
    rng.setEnd(editor.dom.select('span')[0].firstChild as Text, 3);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p style="color: #ff0000;"><span style="color: #00ff00;">t</span>ex<span style="color: #00ff00;">t</span></p>', 'Remove span format within block with style');
  });

  it('Remove and verify start element', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'b' });
    const rng = editor.dom.createRng();
    editor.getBody().innerHTML = '<p><b>text</b></p>';
    rng.setStart(editor.dom.select('b')[0].firstChild as Text, 1);
    rng.setEnd(editor.dom.select('b')[0].firstChild as Text, 3);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p><b>t</b>ex<b>t</b></p>');
    assert.equal(editor.selection.getStart().nodeName, 'P');
  });

  it('Remove with selection collapsed ensure correct caret position', () => {
    const editor = hook.editor();
    const content = '<p>test</p><p>testing</p>';

    editor.formatter.register('format', { block: 'p' });
    const rng = editor.dom.createRng();
    editor.getBody().innerHTML = content;
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 4);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), content);
    LegacyUnit.equalDom(editor.selection.getStart(), editor.dom.select('p')[0]);
  });

  it('Caret format at middle of text', () => {
    const editor = hook.editor();
    editor.setContent('<p><b>abc</b></p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'b', 1, 'b', 1);
    editor.formatter.remove('format');
    TinyAssertions.assertContent(editor, '<p>abc</p>');
  });

  it('Caret format at end of text', () => {
    const editor = hook.editor();
    editor.setContent('<p><b>abc</b></p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'b', 3, 'b', 3);
    editor.formatter.remove('format');
    KeyUtils.type(editor, 'd');
    TinyAssertions.assertContent(editor, '<p><b>abc</b>d</p>');
  });

  it('Caret format at end of text inside other format', () => {
    const editor = hook.editor();
    editor.setContent('<p><em><b>abc</b></em></p>');
    editor.formatter.register('format', { inline: 'b' });
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.formatter.remove('format');
    KeyUtils.type(editor, 'd');
    TinyAssertions.assertContent(editor, '<p><em><b>abc</b>d</em></p>');
  });

  it('Caret format at end of text inside other format with text after 1', () => {
    const editor = hook.editor();
    editor.setContent('<p><em><b>abc</b></em>e</p>');
    editor.formatter.register('format', { inline: 'b' });
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.formatter.remove('format');
    KeyUtils.type(editor, 'd');
    TinyAssertions.assertContent(editor, '<p><em><b>abc</b>d</em>e</p>');
  });

  it('Caret format at end of text inside other format with text after 2', () => {
    const editor = hook.editor();
    editor.setContent('<p><em><b>abc</b></em>e</p>');
    editor.formatter.register('format', { inline: 'em' });
    LegacyUnit.setSelection(editor, 'b', 3, 'b', 3);
    editor.formatter.remove('format');
    KeyUtils.type(editor, 'd');
    TinyAssertions.assertContent(editor, '<p><em><b>abc</b></em><b>d</b>e</p>');
  });

  it(`Toggle styles at the end of the content don' removes the format where it is not needed.`, () => {
    const editor = hook.editor();
    editor.setContent('<p><em><b>abce</b></em></p>');
    editor.formatter.register('b', { inline: 'b' });
    editor.formatter.register('em', { inline: 'em' });
    LegacyUnit.setSelection(editor, 'b', 4, 'b', 4);
    editor.formatter.remove('b');
    editor.formatter.remove('em');
    TinyAssertions.assertContent(editor, '<p><em><b>abce</b></em></p>');
  });

  it('Caret format on second word in table cell', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td>one <b>two</b></td></tr></tbody></table>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'b', 2, 'b', 2);
    editor.formatter.remove('format');
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td>one two</td></tr></tbody></table>');
  });

  it('contentEditable: false on start and contentEditable: true on end', () => {
    const editor = hook.editor();
    const initialContent = '<p>abc</p><p contenteditable="false"><b>def</b></p><p><b>ghj</b></p>';
    editor.formatter.register('format', { inline: 'b' });
    editor.setContent(initialContent);
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('b')[1].firstChild as Text, 3);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    TinyAssertions.assertContent(editor, initialContent);
  });

  it('contentEditable: true on start and contentEditable: false on end', () => {
    const editor = hook.editor();
    const initialContent = '<p>abc</p><p><b>def</b></p><p contenteditable="false"><b>ghj</b></p>';
    editor.formatter.register('format', { inline: 'b' });
    editor.setContent(initialContent);
    LegacyUnit.setSelection(editor, 'p:nth-child(2) b', 0, 'p:last-of-type b', 3);
    editor.formatter.remove('format');
    TinyAssertions.assertContent(editor, initialContent);
  });

  it('contentEditable: true inside contentEditable: false', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'b' });
    editor.setContent('<p>abc</p><p contenteditable="false"><span contenteditable="true"><b>def</b></span></p>');
    LegacyUnit.setSelection(editor, 'b', 0, 'b', 3);
    editor.formatter.remove('format');
    assert.equal(editor.getContent(), '<p>abc</p><p contenteditable="false"><span contenteditable="true">def</span></p>', 'Text is not bold');
  });

  it('remove format block on contentEditable: false block', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { block: 'h1' });
    editor.setContent('<p>abc</p><h1 contenteditable="false">def</h1>');
    LegacyUnit.setSelection(editor, 'h1:nth-child(2)', 0, 'h1:nth-child(2)', 3);
    editor.formatter.remove('format');
    assert.equal(editor.getContent(), '<p>abc</p><h1 contenteditable="false">def</h1>', 'H1 is still not h1');
  });

  it('remove format on del using removeformat format', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p><del>abc</del></p>';
    LegacyUnit.setSelection(editor, 'del', 0, 'del', 3);
    editor.formatter.remove('removeformat');
    TinyAssertions.assertContent(editor, '<p>abc</p>');
  });

  it('remove format on span with class using removeformat format', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p><span class="x">abc</span></p>';
    LegacyUnit.setSelection(editor, 'span', 0, 'span', 3);
    editor.formatter.remove('removeformat');
    TinyAssertions.assertContent(editor, '<p>abc</p>');
  });

  it('remove format on span with internal class using removeformat format', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p><span class="mce-item-internal">abc</span></p>';
    LegacyUnit.setSelection(editor, 'span', 0, 'span', 3);
    editor.formatter.remove('removeformat');
    TinyAssertions.assertRawContent(editor, '<p><span class="mce-item-internal">abc</span></p>');
  });

  it('Remove format of nested elements at start', () => {
    const editor = hook.editor();
    editor.setContent('<p><b><i>ab</i>c</b></p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'i', 1, 'i', 2);
    editor.formatter.remove('format');
    TinyAssertions.assertContent(editor, '<p><b><i>a</i></b><i>b</i><b>c</b></p>');
  });

  it('Remove format of nested elements at end', () => {
    const editor = hook.editor();
    editor.setContent('<p><b>a<i>bc</i></b></p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'i', 0, 'i', 1);
    editor.formatter.remove('format');
    TinyAssertions.assertContent(editor, '<p><b>a</b><i>b</i><b><i>c</i></b></p>');
  });

  it('Remove format of nested elements at end with text after ', () => {
    const editor = hook.editor();
    editor.setContent('<p><b>a<i>bc</i></b>d</p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'i', 0, 'i', 2);
    editor.formatter.remove('format');
    TinyAssertions.assertContent(editor, '<p><b>a</b><i>bc</i>d</p>');
  });

  it('Remove format bug 2', () => {
    const editor = hook.editor();
    editor.setContent('<p>ab<b>c</b></p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'b', 0, 'b', 1);
    editor.formatter.remove('format');
    TinyAssertions.assertContent(editor, '<p>abc</p>');
  });

  it('Remove format bug 3', () => {
    const editor = hook.editor();
    editor.setContent('<p><b><i>ab</i></b></p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'i', 1, 'i', 2);
    editor.formatter.remove('format');
    TinyAssertions.assertContent(editor, '<p><b><i>a</i></b><i>b</i></p>');
  });

  it('Remove format with classes', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'span', classes: [ 'a', 'b' ] });
    editor.getBody().innerHTML = '<p><span class="a b c">a</span></p>';
    LegacyUnit.setSelection(editor, 'span', 0, 'span', 1);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p><span class="c">a</span></p>', 'Element should only have c left');
  });

  it('Remove format on specified node', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b>a</b></p>';
    editor.formatter.remove('format', {}, editor.dom.select('b')[0]);
    assert.equal(getContent(editor), '<p>a</p>', 'B should be removed');
  });

  it('Remove ceFalseOverride format', () => {
    const editor = hook.editor();
    editor.setContent('<p class="a" contenteditable="false">a</p><div class="a" contenteditable="false">b</div>');
    editor.formatter.register('format', [
      { selector: 'div', classes: [ 'a' ], ceFalseOverride: true },
      { selector: 'p', classes: [ 'a' ], ceFalseOverride: true }
    ]);
    editor.selection.select(editor.dom.select('div')[0]);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p class="a" contenteditable="false">a</p><div contenteditable="false">b</div>');
    editor.selection.select(editor.dom.select('p')[0]);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p contenteditable="false">a</p><div contenteditable="false">b</div>');
  });

  it('Remove format from first position in table cell', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<table><tbody><tr><td><b>ab</b> cd</td></tr></tbody></table>';
    LegacyUnit.setSelection(editor, 'b', 0, 'b', 2);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<table><tbody><tr><td>ab cd</td></tr></tbody></table>', 'Should have removed format.');
  });

  it('Remove format from last position in table cell', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<table><tbody><tr><td>ab <b>cd</b></td></tr></tbody></table>';
    LegacyUnit.setSelection(editor, 'b', 0, 'tr', 2);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<table><tbody><tr><td>ab cd</td></tr></tbody></table>', 'Should have removed format.');
  });

  it('Inline element on selected text with preserve_attributes flag (bold)', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'b', preserve_attributes: [ 'class', 'style' ], remove: 'all' });
    editor.getBody().innerHTML = '<p><b class="abc" style="color: red;" data-test="1">1234</b></p>';
    LegacyUnit.setSelection(editor, 'b', 2, 'b', 2);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p><span style="color: red;" class="abc">1234</span></p>', 'Inline element on selected text with preserve_attributes flag (bold)');
  });

  it('Complex inline element using ranged selection with preserve_attributes flag (bold)', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'b', preserve_attributes: [ 'class', 'style' ], remove: 'all' });
    editor.getBody().innerHTML = '<p><b style="text-align: left;">If the situation of the pandemic does not improve<span style="color: #172b4d;">, there will be no spectators, no museum, no stores open, and money will continue to be lost.</span></b></p>';
    LegacyUnit.setSelection(editor, 'b', 24, 'span', 56);
    editor.formatter.remove('format');
    assert.equal(
      getContent(editor),
      '<p>' +
        '<b style="text-align: left;">if the situation of the </b>' +
        '<span style="text-align: left;">pandemic does not improve<span style="color: #172b4d;">, there will be no spectators, no museum, no stores open</span></span>' +
        '<b style="text-align: left;"><span style="color: #172b4d;">, and money will continue to be lost.</span></b>' +
      '</p>',
      'Inline element on selected text with preserve_attributes flag (bold)');
  });

  it('Inline element on selected text with preserve_attributes flag (italic)', () => {
    const editor = hook.editor();
    editor.formatter.register('format', { inline: 'em', preserve_attributes: [ 'class', 'style' ], remove: 'all' });
    editor.getBody().innerHTML = '<p><em class="abc" style="color: red;" data-test="1">1234</em></p>';
    LegacyUnit.setSelection(editor, 'em', 2, 'em', 2);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p><span style="color: red;" class="abc">1234</span></p>', 'Inline element on text with preserve_attributes flag (italic)');
  });

  it('Remove color format on text with multiple underline text decorations', () => {
    const editor = hook.editor();
    editor.formatter.register('format', {
      inline: 'span',
      exact: true,
      styles: {
        color: '#ff0000'
      }
    });
    editor.setContent('<p><span style="text-decoration: underline;">abc <span style="color: #ff0000; text-decoration: underline;">def</span> ghi</span></p>');
    editor.selection.select(editor.dom.select('span')[1]);
    editor.formatter.remove('format');
    assert.equal(getContent(editor), '<p><span style="text-decoration: underline;">abc def ghi</span></p>', 'Remove color format on text with multiple underline text decorations');
  });

  it('Remove format on node outside fake table selection', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong>test</strong></p><table><tbody><tr><td data-mce-selected="1"><strong>cell 1</strong></td><td>cell 2</td></tr><tr><td data-mce-selected="1"><strong>cell 3</strong></td><td>cell 4</td></tr></tbody></table>');
    LegacyUnit.setSelection(editor, 'td', 0, 'td', 0);
    const para = editor.dom.select('p')[0];
    // Remove bold on custom node
    editor.formatter.remove('bold', { }, para);
    assert.equal(getContent(editor), '<p>test</p><table><tbody><tr><td><strong>cell 1</strong></td><td>cell 2</td></tr><tr><td><strong>cell 3</strong></td><td>cell 4</td></tr></tbody></table>');
    // Remove bold current fake table selection
    editor.formatter.remove('bold');
    assert.equal(getContent(editor), '<p>test</p><table><tbody><tr><td>cell 1</td><td>cell 2</td></tr><tr><td>cell 3</td><td>cell 4</td></tr></tbody></table>');
  });

  it('TINY-6268: Remove inline format on text range selection with adjacent spaces', () => {
    const editor = hook.editor();
    editor.setContent('<p>test<span style="text-decoration: underline;"> t</span>est</p>');
    LegacyUnit.setSelection(editor, 'span', 1, 'span', 2);
    editor.formatter.remove('underline');
    assert.equal(getContent(editor), '<p>test<span style="text-decoration: underline;"> </span>test</p>', 'Formatting on the space should not have been removed');
  });

  it('TINY-6268: Remove inline format on text collapsed selection with adjacent spaces', () => {
    const editor = hook.editor();
    editor.setContent('<p>test<span style="text-decoration: underline;"> t</span>est</p>');
    LegacyUnit.setSelection(editor, 'span', 1, 'span', 1);
    editor.formatter.remove('underline');
    assert.equal(getContent(editor), '<p>test test</p>', 'Formatting on the space should not have been removed');
  });

  it('TINY-7227: Remove classes with variables', () => {
    const editor = hook.editor();
    editor.formatter.register('formatA', { selector: 'p', classes: [ '%value' ] });
    editor.setContent('<p class="a b">test</p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 0);
    editor.formatter.remove('formatA', { value: 'a' });
    assert.equal(getContent(editor), '<p class="b">test</p>');
  });

  it('TINY-8036: Remove blockquote format with multiple words and collapsed selection', () => {
    const editor = hook.editor();
    editor.setContent('<blockquote><p>test test</p></blockquote>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 5);
    editor.formatter.remove('blockquote');
    TinyAssertions.assertContent(editor, '<p>test test</p>');
  });

  it('TINY-8755: Non-internal attributes are not removed', () => {
    const editor = hook.editor();
    // eslint-disable-next-line max-len
    TinyApis(editor).setRawContent('<p><strong>bold<span data-field-type="TEXT"><span class="my-class-1"></span><span class="my-class-2"><span style="display: flex; align-items: flex-start;" data-mce-style="display: flex; align-items: flex-start;"><span class="my-class-3">' + ZWSP + '</span></span></span></span>text</strong></p>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 2, [ 0, 0, 2 ], 2);
    editor.formatter.remove('bold');
    // eslint-disable-next-line max-len
    TinyAssertions.assertRawContent(editor, '<p><strong>bo</strong>ld<span data-field-type="TEXT"><span class="my-class-1"></span><span class="my-class-2"><span style="display: flex; align-items: flex-start;" data-mce-style="display: flex; align-items: flex-start;"><span class="my-class-3">' + ZWSP + '</span></span></span></span>te<strong>xt</strong></p>');
  });
});
