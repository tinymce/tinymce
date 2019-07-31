import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Env from 'tinymce/core/api/Env';
import HtmlUtils from '../module/test/HtmlUtils';
import KeyUtils from '../module/test/KeyUtils';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.FormatterRemoveTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Theme();

  const getContent = function (editor) {
    return editor.getContent(editor).toLowerCase().replace(/[\r]+/g, '');
  };

  suite.test('Inline element on selected text', function (editor) {
    editor.focus();
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b>1234</b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('b')[0].firstChild, 4);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(getContent(editor), '<p>1234</p>', 'Inline element on selected text');
  });

  suite.test('Inline element on selected text with remove=all', function (editor) {
    editor.formatter.register('format', { selector: 'b', remove: 'all' });
    editor.getBody().innerHTML = '<p><b title="text">1234</b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('b')[0].firstChild, 4);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(getContent(editor), '<p>1234</p>', 'Inline element on selected text with remove=all');
  });

  suite.test('Inline element on selected text with remove=none', function (editor) {
    editor.formatter.register('format', { selector: 'span', styles: { fontWeight: 'bold' }, remove: 'none' });
    editor.getBody().innerHTML = '<p><span style="font-weight:bold">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0], 0);
    rng.setEnd(editor.dom.select('p')[0], 1);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(getContent(editor), '<p><span>1234</span></p>', 'Inline element on selected text with remove=none');
  });

  suite.test('Inline element style where element is format root', function (editor) {
    editor.formatter.register('format', { inline: 'span', styles: { fontWeight: 'bold' } });
    editor.getBody().innerHTML = '<p><span style="font-weight:bold; color:#FF0000"><em>1234</em></span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('em')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('em')[0].firstChild, 3);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(getContent(editor),
      '<p><span style="color: #ff0000; font-weight: bold;">' +
      '<em>1</em></span><span style="color: #ff0000;"><em>23</em></span>' +
      '<span style=\"color: #ff0000; font-weight: bold;\"><em>4' +
      '</em></span></p>',
      'Inline element style where element is format root');
  });

  suite.test('Partially selected inline element text', function (editor) {
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b>1234</b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild, 2);
    rng.setEnd(editor.dom.select('b')[0].firstChild, 4);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(getContent(editor), '<p><b>12</b>34</p>', 'Partially selected inline element text');
  });

  suite.test('Partially selected inline element text with children', function (editor) {
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b><em><span>1234</span></em></b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[0].firstChild, 2);
    rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(
      getContent(editor),
      '<p><b><em><span>12</span></em></b><em><span>34</span></em></p>',
      'Partially selected inline element text with children'
    );
  });

  suite.test('Partially selected inline element text with complex children', function (editor) {
    editor.formatter.register('format', { inline: 'span', styles: { fontWeight: 'bold' } });
    editor.getBody().innerHTML = '<p><span style="font-weight:bold"><em><span style="color:#ff0000;font-weight:bold">1234</span></em></span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[1].firstChild, 2);
    rng.setEnd(editor.dom.select('span')[1].firstChild, 4);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(
      getContent(editor),
      '<p><span style="font-weight: bold;"><em><span style="color: #ff0000; font-weight: bold;">12</span>' +
      '</em></span><em><span style="color: #ff0000;">34</span></em></p>',
      'Partially selected inline element text with complex children'
    );
  });

  suite.test('Inline elements with exact flag', function (editor) {
    editor.formatter.register('format', { inline: 'span', styles: { color: '#ff0000' }, exact: true });
    editor.getBody().innerHTML = '<p><span style="font-size:10px;color:#ff0000">1234</span><span style="font-size:10px;color:#00ff00">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0], 0);
    rng.setEnd(editor.dom.select('p')[0], 2);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(
      getContent(editor),
      '<p><span style="font-size: 10px;">1234</span><span style="color: #00ff00; font-size: 10px;">1234</span></p>',
      'Inline elements with exact flag'
    );
  });

  suite.test('Inline elements with variables', function (editor) {
    editor.formatter.register('format', { inline: 'span', styles: { color: '%color' }, exact: true });
    editor.getBody().innerHTML = '<p><span style="font-size:10px;color:#ff0000">1234</span><span style="font-size:10px;color:#00ff00">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0], 0);
    rng.setEnd(editor.dom.select('p')[0], 2);
    editor.selection.setRng(rng);
    editor.formatter.remove('format', { color: '#ff0000' });
    LegacyUnit.equal(
      getContent(editor),
      '<p><span style="font-size: 10px;">1234</span><span style="color: #00ff00; font-size: 10px;">1234</span></p>',
      'Inline elements on selected text with variables'
    );
  });

  suite.test('Inline elements with functions and variables', function (editor) {
    editor.formatter.register('format', {
      inline: 'span',
      styles: {
        color (vars) {
          return vars.color + '00';
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
    LegacyUnit.equal(
      getContent(editor),
      '<p><span style="font-size: 10px;">1234</span><span style="color: #00ff00; font-size: 10px;">1234</span></p>',
      'Inline elements with functions and variables'
    );
  });

  suite.test('End within start element', function (editor) {
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b>1234<b>5678</b></b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0], 0);
    rng.setEnd(editor.dom.select('b')[0], 2);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(getContent(editor), '<p>12345678</p>', 'End within start element');
  });

  suite.test('Start and end within similar format 1', function (editor) {
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b><em><b>1234<b>5678</b></b></em></b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('em')[0], 0);
    rng.setEnd(editor.dom.select('b')[1], 2);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(getContent(editor), '<p><em>12345678</em></p>', 'Start and end within similar format 1');
  });

  suite.test('Start and end within similar format 2', function (editor) {
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b><em><b>1234</b><b>5678</b></em></b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('em')[0], 0);
    rng.setEnd(editor.dom.select('em')[0], 1);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(getContent(editor), '<p><em>1234</em><b><em><b>5678</b></em></b></p>', 'Start and end within similar format 2');
  });

  suite.test('Start and end within similar format 3', function (editor) {
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b><em><b>1234</b></em></b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('em')[0], 0);
    rng.setEnd(editor.dom.select('em')[0], 1);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(getContent(editor), '<p><em>1234</em></p>', 'Start and end within similar format 3');
  });

  suite.test('End within start', function (editor) {
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b><em>x<b>abc</b>y</em></b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0], 0);
    rng.setEnd(editor.dom.select('b')[1].firstChild, 3);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(getContent(editor), '<p><em>x</em><em>abc</em><b><em>y</em></b></p>', 'End within start');
  });

  suite.test('Remove block format', function (editor) {
    editor.formatter.register('format', { block: 'h1' });
    editor.getBody().innerHTML = '<h1>text</h1>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('h1')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('h1')[0].firstChild, 4);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(getContent(editor), '<p>text</p>', 'Remove block format');
  });

  suite.test('Remove wrapper block format', function (editor) {
    editor.formatter.register('format', { block: 'blockquote', wrapper: true });
    editor.getBody().innerHTML = '<blockquote><p>text</p></blockquote>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(getContent(editor), '<p>text</p>', 'Remove wrapper block format');
  });

  suite.test('Remove span format within block with style', function (editor) {
    editor.formatter.register('format', { selector: 'span', attributes: ['style', 'class'], remove: 'empty', split: true, expand: false, deep: true });
    const rng = editor.dom.createRng();
    editor.getBody().innerHTML = '<p style="color:#ff0000"><span style="color:#00ff00">text</span></p>';
    rng.setStart(editor.dom.select('span')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('span')[0].firstChild, 3);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(
      getContent(editor),
      '<p style="color: #ff0000;"><span style="color: #00ff00;">t</span>ex<span style="color: #00ff00;">t</span></p>',
      'Remove span format within block with style'
    );
  });

  suite.test('Remove and verify start element', function (editor) {
    editor.formatter.register('format', { inline: 'b' });
    const rng = editor.dom.createRng();
    editor.getBody().innerHTML = '<p><b>text</b></p>';
    rng.setStart(editor.dom.select('b')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('b')[0].firstChild, 3);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(getContent(editor), '<p><b>t</b>ex<b>t</b></p>');
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'P');
  });

  suite.test('Remove with selection collapsed ensure correct caret position', function (editor) {
    const content = '<p>test</p><p>testing</p>';

    editor.formatter.register('format', { block: 'p' });
    const rng = editor.dom.createRng();
    editor.getBody().innerHTML = content;
    rng.setStart(editor.dom.select('p')[0].firstChild, 4);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(getContent(editor), content);
    LegacyUnit.equalDom(editor.selection.getStart(), editor.dom.select('p')[0]);
  });

  suite.test('Caret format at middle of text', function (editor) {
    editor.setContent('<p><b>abc</b></p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'b', 1, 'b', 1);
    editor.formatter.remove('format');
    LegacyUnit.equal(editor.getContent(editor), '<p>abc</p>');
  });

  suite.test('Caret format at end of text', function (editor) {
    editor.setContent('<p><b>abc</b></p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'b', 3, 'b', 3);
    editor.formatter.remove('format');
    KeyUtils.type(editor, 'd');
    LegacyUnit.equal(editor.getContent(editor), '<p><b>abc</b>d</p>');
  });

  suite.test('Caret format at end of text inside other format', function (editor) {
    editor.setContent('<p><em><b>abc</b></em></p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'b', 3, 'b', 3);
    editor.formatter.remove('format');
    KeyUtils.type(editor, 'd');
    LegacyUnit.equal(editor.getContent(editor), '<p><em><b>abc</b>d</em></p>');
  });

  suite.test('Caret format at end of text inside other format with text after 1', function (editor) {
    editor.setContent('<p><em><b>abc</b></em>e</p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'b', 3, 'b', 3);
    editor.formatter.remove('format');
    KeyUtils.type(editor, 'd');
    LegacyUnit.equal(editor.getContent(editor), '<p><em><b>abc</b>d</em>e</p>');
  });

  suite.test('Caret format at end of text inside other format with text after 2', function (editor) {
    editor.setContent('<p><em><b>abc</b></em>e</p>');
    editor.formatter.register('format', { inline: 'em' });
    LegacyUnit.setSelection(editor, 'b', 3, 'b', 3);
    editor.formatter.remove('format');
    KeyUtils.type(editor, 'd');
    LegacyUnit.equal(editor.getContent(editor), '<p><em><b>abc</b></em><b>d</b>e</p>');
  });

  suite.test('Toggle styles at the end of the content don\' removes the format where it is not needed.', function (editor) {
    editor.setContent('<p><em><b>abce</b></em></p>');
    editor.formatter.register('b', { inline: 'b' });
    editor.formatter.register('em', { inline: 'em' });
    LegacyUnit.setSelection(editor, 'b', 4, 'b', 4);
    editor.formatter.remove('b');
    editor.formatter.remove('em');
    LegacyUnit.equal(editor.getContent(editor), '<p><em><b>abce</b></em></p>');
  });

  suite.test('Caret format on second word in table cell', function (editor) {
    editor.setContent('<table><tbody><tr><td>one <b>two</b></td></tr></tbody></table>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'b', 2, 'b', 2);
    editor.formatter.remove('format');
    LegacyUnit.equal(editor.getContent(editor), '<table><tbody><tr><td>one two</td></tr></tbody></table>');
  });

  suite.test('contentEditable: false on start and contentEditable: true on end', function (editor) {
    if (Env.ie) {
      // Skipped since IE doesn't support selection of parts of a cE=false element
      return;
    }

    editor.formatter.register('format', { inline: 'b' });
    editor.setContent('<p>abc</p><p contenteditable="false"><b>def</b></p><p><b>ghj</b></p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('b')[1].firstChild, 3);
    editor.selection.setRng(rng);
    editor.formatter.remove('format');
    LegacyUnit.equal(editor.getContent(editor), '<p>abc</p><p contenteditable="false"><b>def</b></p><p>ghj</p>', 'Text in last paragraph is not bold');
  });

  suite.test('contentEditable: true on start and contentEditable: false on end', function (editor) {
    editor.formatter.register('format', { inline: 'b' });
    editor.setContent('<p>abc</p><p><b>def</b></p><p contenteditable="false"><b>ghj</b></p>');
    LegacyUnit.setSelection(editor, 'p:nth-child(2) b', 0, 'p:last b', 3);
    editor.formatter.remove('format');
    LegacyUnit.equal(editor.getContent(editor), '<p>abc</p><p>def</p><p contenteditable="false"><b>ghj</b></p>', 'Text in first paragraph is not bold');
  });

  suite.test('contentEditable: true inside contentEditable: false', function (editor) {
    editor.formatter.register('format', { inline: 'b' });
    editor.setContent('<p>abc</p><p contenteditable="false"><span contenteditable="true"><b>def</b></span></p>');
    LegacyUnit.setSelection(editor, 'b', 0, 'b', 3);
    editor.formatter.remove('format');
    LegacyUnit.equal(editor.getContent(editor), '<p>abc</p><p contenteditable="false"><span contenteditable="true">def</span></p>', 'Text is not bold');
  });

  suite.test('remove format block on contentEditable: false block', function (editor) {
    editor.formatter.register('format', { block: 'h1' });
    editor.setContent('<p>abc</p><h1 contenteditable="false">def</h1>');
    LegacyUnit.setSelection(editor, 'h1:nth-child(2)', 0, 'h1:nth-child(2)', 3);
    editor.formatter.remove('format');
    LegacyUnit.equal(editor.getContent(editor), '<p>abc</p><h1 contenteditable="false">def</h1>', 'H1 is still not h1');
  });

  suite.test('remove format on del using removeformat format', function (editor) {
    editor.getBody().innerHTML = '<p><del>abc</del></p>';
    LegacyUnit.setSelection(editor, 'del', 0, 'del', 3);
    editor.formatter.remove('removeformat');
    LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p>abc</p>');
  });

  suite.test('remove format on span with class using removeformat format', function (editor) {
    editor.getBody().innerHTML = '<p><span class="x">abc</span></p>';
    LegacyUnit.setSelection(editor, 'span', 0, 'span', 3);
    editor.formatter.remove('removeformat');
    LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p>abc</p>');
  });

  suite.test('remove format on span with internal class using removeformat format', function (editor) {
    editor.getBody().innerHTML = '<p><span class="mce-item-internal">abc</span></p>';
    LegacyUnit.setSelection(editor, 'span', 0, 'span', 3);
    editor.formatter.remove('removeformat');
    LegacyUnit.equal(HtmlUtils.normalizeHtml(HtmlUtils.cleanHtml(editor.getBody().innerHTML)), '<p><span class="mce-item-internal">abc</span></p>');
  });

  suite.test('Remove format of nested elements at start', function (editor) {
    editor.setContent('<p><b><i>ab</i>c</b></p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'i', 1, 'i', 2);
    editor.formatter.remove('format');
    LegacyUnit.equal(editor.getContent(editor), '<p><b><i>a</i></b><i>b</i><b>c</b></p>');
  });

  suite.test('Remove format of nested elements at end', function (editor) {
    editor.setContent('<p><b>a<i>bc</i></b></p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'i', 0, 'i', 1);
    editor.formatter.remove('format');
    LegacyUnit.equal(editor.getContent(editor), '<p><b>a</b><i>b</i><b><i>c</i></b></p>');
  });

  suite.test('Remove format of nested elements at end with text after ', function (editor) {
    editor.setContent('<p><b>a<i>bc</i></b>d</p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'i', 0, 'i', 2);
    editor.formatter.remove('format');
    LegacyUnit.equal(editor.getContent(editor), '<p><b>a</b><i>bc</i>d</p>');
  });

  suite.test('Remove format bug 2', function (editor) {
    editor.setContent('<p>ab<b>c</b></p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'b', 0, 'b', 1);
    editor.formatter.remove('format');
    LegacyUnit.equal(editor.getContent(editor), '<p>abc</p>');
  });

  suite.test('Remove format bug 3', function (editor) {
    editor.setContent('<p><b><i>ab</i></b></p>');
    editor.formatter.register('format', { inline: 'b' });
    LegacyUnit.setSelection(editor, 'i', 1, 'i', 2);
    editor.formatter.remove('format');
    LegacyUnit.equal(editor.getContent(editor), '<p><b><i>a</i></b><i>b</i></p>');
  });

  suite.test('Remove format with classes', function (editor) {
    editor.formatter.register('format', { inline: 'span', classes: ['a', 'b'] });
    editor.getBody().innerHTML = '<p><span class="a b c">a</span></p>';
    LegacyUnit.setSelection(editor, 'span', 0, 'span', 1);
    editor.formatter.remove('format');
    LegacyUnit.equal(getContent(editor), '<p><span class="c">a</span></p>', 'Element should only have c left');
  });

  suite.test('Remove format on specified node', function (editor) {
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b>a</b></p>';
    editor.formatter.remove('format', {}, editor.dom.select('b')[0]);
    LegacyUnit.equal(getContent(editor), '<p>a</p>', 'B should be removed');
  });

  suite.test('Remove ceFalseOverride format', function (editor) {
    editor.setContent('<p class="a" contenteditable="false">a</p><div class="a" contenteditable="false">b</div>');
    editor.formatter.register('format', [
      { selector: 'div', classes: ['a'], ceFalseOverride: true },
      { selector: 'p', classes: ['a'], ceFalseOverride: true }
    ]);
    editor.selection.select(editor.dom.select('div')[0]);
    editor.formatter.remove('format');
    LegacyUnit.equal(
      getContent(editor),
      '<p class="a" contenteditable="false">a</p><div contenteditable="false">b</div>'
    );
    editor.selection.select(editor.dom.select('p')[0]);
    editor.formatter.remove('format');
    LegacyUnit.equal(
      getContent(editor),
      '<p contenteditable="false">a</p><div contenteditable="false">b</div>'
    );
  });

  suite.test('Remove block format from first block with forced_root_block: false', function (editor) {
    editor.settings.forced_root_block = false;
    editor.formatter.register('format', { block: 'h1' });
    editor.getBody().innerHTML = '<h1>a</h1>b';
    LegacyUnit.setSelection(editor, 'h1', 0, 'h1', 1);
    editor.formatter.remove('format');
    LegacyUnit.equal(getContent(editor), 'a<br />b', 'Lines should be separated with br');
    editor.settings.forced_root_block = 'p';
  });

  suite.test('Remove format from first position in table cell', function (editor) {
    editor.formatter.register('format', { inline: 'b' });
    editor.getBody().innerHTML = '<table><tbody><tr><td><b>ab</b> cd</td></tr></tbody></table>';
    LegacyUnit.setSelection(editor, 'b', 0, 'b', 2);
    editor.formatter.remove('format');
    LegacyUnit.equal(getContent(editor), '<table><tbody><tr><td>ab cd</td></tr></tbody></table>', 'Should have removed format.');
    editor.settings.forced_root_block = 'p';
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    indent: false,
    extended_valid_elements: 'b,i,span[style|contenteditable|class]',
    entities: 'raw',
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,' +
      'margin,margin-top,margin-right,margin-bottom,margin-left,display,text-align'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
