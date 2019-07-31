import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import JSON from 'tinymce/core/api/util/JSON';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.content.InsertContentCommandTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  Theme();

  const normalizeRng = function (rng) {
    if (rng.startContainer.nodeType === 3) {
      if (rng.startOffset === 0) {
        rng.setStartBefore(rng.startContainer);
      } else if (rng.startOffset >= rng.startContainer.nodeValue.length - 1) {
        rng.setStartAfter(rng.startContainer);
      }
    }

    if (rng.endContainer.nodeType === 3) {
      if (rng.endOffset === 0) {
        rng.setEndBefore(rng.endContainer);
      } else if (rng.endOffset >= rng.endContainer.nodeValue.length - 1) {
        rng.setEndAfter(rng.endContainer);
      }
    }

    return rng;
  };

  const ok = function (value, label?) {
    return LegacyUnit.equal(value, true, label);
  };

  const getContent = function (editor) {
    return editor.getContent();
  };

  suite.test('mceInsertContent - p inside text of p', function (editor) {
    let rng;

    editor.setContent('<p>1234</p>');
    editor.focus();
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 3);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, '<p>abc</p>');
    LegacyUnit.equal(getContent(editor), '<p>1</p><p>abc</p><p>4</p>');
    rng = normalizeRng(editor.selection.getRng(true));
    ok(rng.collapsed);
    LegacyUnit.equal(rng.startContainer.nodeName, 'P');
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equal(rng.endContainer.nodeName, 'P');
    LegacyUnit.equal(rng.endOffset, 1);
    LegacyUnit.equal(rng.startContainer.innerHTML, 'abc');
  });

  suite.test('mceInsertContent before HR', function (editor) {
    let rng;

    editor.setContent('<hr>');
    editor.focus();
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 0);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, 'x');
    LegacyUnit.equal(getContent(editor), '<p>x</p><hr />');
  });

  suite.test('mceInsertContent HR at end of H1', function (editor) {
    editor.setContent('<h1>abc</h1>');
    LegacyUnit.setSelection(editor, 'h1', 3);
    editor.execCommand('mceInsertContent', false, '<hr>');
    LegacyUnit.equalDom(editor.selection.getNode(), editor.getBody().lastChild);
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'H1');
    LegacyUnit.equal(getContent(editor), '<h1>abc</h1><hr /><h1>\u00a0</h1>');
  });

  suite.test('mceInsertContent HR at end of H1 with P sibling', function (editor) {
    editor.setContent('<h1>abc</h1><p>def</p>');
    LegacyUnit.setSelection(editor, 'h1', 3);
    editor.execCommand('mceInsertContent', false, '<hr>');
    LegacyUnit.equalDom(editor.selection.getNode(), editor.getBody().lastChild);
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
    LegacyUnit.equal(getContent(editor), '<h1>abc</h1><hr /><p>def</p>');
  });

  suite.test('mceInsertContent HR at end of H1 with inline elements with P sibling', function (editor) {
    editor.setContent('<h1><strong>abc</strong></h1><p>def</p>');
    LegacyUnit.setSelection(editor, 'strong', 3);
    editor.execCommand('mceInsertContent', false, '<hr>');
    LegacyUnit.equalDom(editor.selection.getNode(), editor.getBody().lastChild);
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
    LegacyUnit.equal(getContent(editor), '<h1><strong>abc</strong></h1><hr /><p>def</p>');
  });

  suite.test('mceInsertContent empty block', function (editor) {
    editor.setContent('<h1>abc</h1>');
    LegacyUnit.setSelection(editor, 'h1', 1);
    editor.execCommand('mceInsertContent', false, '<p></p>');
    LegacyUnit.equalDom(editor.selection.getNode(), editor.getBody().childNodes[1]);
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
    LegacyUnit.equal(getContent(editor), '<h1>a</h1><p>\u00a0</p><h1>bc</h1>');
  });

  suite.test('mceInsertContent table at end of H1 with P sibling', function (editor) {
    editor.setContent('<h1>abc</h1><p>def</p>');
    LegacyUnit.setSelection(editor, 'h1', 3);
    editor.execCommand('mceInsertContent', false, '<table><tr><td></td></tr></table>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'TD');
    LegacyUnit.equal(getContent(editor), '<h1>abc</h1><table><tbody><tr><td>\u00a0</td></tr></tbody></table><p>def</p>');
  });

  suite.test('mceInsertContent - p inside whole p', function (editor) {
    let rng;

    editor.setContent('<p>1234</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, '<p>abc</p>');
    LegacyUnit.equal(getContent(editor), '<p>abc</p>');
    rng = normalizeRng(editor.selection.getRng(true));
    ok(rng.collapsed);
    LegacyUnit.equal(rng.startContainer.nodeName, 'P');
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equal(rng.endContainer.nodeName, 'P');
    LegacyUnit.equal(rng.endOffset, 1);
    LegacyUnit.equal(rng.startContainer.innerHTML, 'abc');
  });

  suite.test('mceInsertContent - pre in text of pre', function (editor) {
    let rng;

    editor.setContent('<pre>1234</pre>');
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('pre')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('pre')[0].firstChild, 3);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, '<pre>abc</pre>');
    LegacyUnit.equal(getContent(editor), '<pre>1</pre><pre>abc</pre><pre>4</pre>');
    rng = normalizeRng(editor.selection.getRng(true));
    ok(rng.collapsed);
    LegacyUnit.equal(rng.startContainer.nodeName, 'PRE');
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equal(rng.endContainer.nodeName, 'PRE');
    LegacyUnit.equal(rng.endOffset, 1);
    LegacyUnit.equal(rng.startContainer.innerHTML, 'abc');
  });

  suite.test('mceInsertContent - h1 in text of h1', function (editor) {
    let rng;

    editor.setContent('<h1>1234</h1>');
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('h1')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('h1')[0].firstChild, 3);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, '<h1>abc</h1>');
    LegacyUnit.equal(getContent(editor), '<h1>1</h1><h1>abc</h1><h1>4</h1>');
    rng = normalizeRng(editor.selection.getRng(true));
    ok(rng.collapsed);
    LegacyUnit.equal(rng.startContainer.nodeName, 'H1');
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equal(rng.endContainer.nodeName, 'H1');
    LegacyUnit.equal(rng.endOffset, 1);
    LegacyUnit.equal(rng.startContainer.innerHTML, 'abc');
  });

  suite.test('mceInsertContent - li inside li', function (editor) {
    let rng;

    editor.setContent('<ul><li>1234</li></ul>');
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('li')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('li')[0].firstChild, 3);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, '<li>abc</li>');
    LegacyUnit.equal(getContent(editor), '<ul><li>1</li><li>abc</li><li>4</li></ul>');
    rng = normalizeRng(editor.selection.getRng(true));
    ok(rng.collapsed);
    LegacyUnit.equal(rng.startContainer.nodeName, 'LI');
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equal(rng.endContainer.nodeName, 'LI');
    LegacyUnit.equal(rng.endOffset, 1);
    LegacyUnit.equal(rng.startContainer.innerHTML, 'abc');
  });

  suite.test('mceInsertContent - p inside empty editor', function (editor) {
    let rng;

    editor.setContent('');
    editor.execCommand('mceInsertContent', false, '<p>abc</p>');
    LegacyUnit.equal(getContent(editor), '<p>abc</p>');
    rng = normalizeRng(editor.selection.getRng(true));
    ok(rng.collapsed);
    LegacyUnit.equal(rng.startContainer.nodeName, 'P');
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equal(rng.endContainer.nodeName, 'P');
    LegacyUnit.equal(rng.endOffset, 1);
    LegacyUnit.equal(rng.startContainer.innerHTML, 'abc');
  });

  suite.test('mceInsertContent - text inside empty p', function (editor) {
    let rng;

    editor.getBody().innerHTML = '<p></p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('mceInsertContent', false, 'abc');
    LegacyUnit.equal(
      editor.getBody().innerHTML.toLowerCase().replace(/^<br>/, ''),
      '<p>abc</p>'
    ); // Opera inserts a BR at the beginning of contents if the P is empty
    rng = normalizeRng(editor.selection.getRng(true));
    ok(rng.collapsed);
    LegacyUnit.equal(rng.startContainer.nodeName, 'P');
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equal(rng.endContainer.nodeName, 'P');
    LegacyUnit.equal(rng.endOffset, 1);
    LegacyUnit.equal(rng.startContainer.innerHTML, 'abc');
  });

  suite.test('mceInsertContent - text inside empty p with br caret node', function (editor) {
    let rng;

    editor.getBody().innerHTML = '<p><br></p>';
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild, 0);
    rng.setEnd(editor.getBody().firstChild, 0);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, 'abc');
    LegacyUnit.equal(editor.getBody().innerHTML.toLowerCase(), '<p>abc</p>');
    rng = normalizeRng(editor.selection.getRng(true));
    ok(rng.collapsed);
    LegacyUnit.equal(rng.startContainer.nodeName, 'P');
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equal(rng.endContainer.nodeName, 'P');
    LegacyUnit.equal(rng.endOffset, 1);
    LegacyUnit.equal(rng.startContainer.innerHTML, 'abc');
  });

  suite.test('mceInsertContent - image inside p', function (editor) {
    let rng;

    editor.setContent('<p>1</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 1);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, '<img src="about:blank" />');
    LegacyUnit.equal(editor.getContent(), '<p><img src="about:blank" /></p>');
    rng = normalizeRng(editor.selection.getRng(true));
    ok(rng.collapsed);
    LegacyUnit.equal(rng.startContainer.nodeName, 'P');
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equal(rng.endContainer.nodeName, 'P');
    LegacyUnit.equal(rng.endOffset, 1);
  });

  suite.test('mceInsertContent - legacy content', function (editor) {
    let rng;

    // Convert legacy content
    editor.setContent('<p>1</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 1);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, '<strike>strike</strike><font size="7">font</font>');
    LegacyUnit.equal(
      editor.getContent(),
      '<p><span style="text-decoration: line-through;">strike</span><span style="font-size: 300%;">font</span></p>'
    );
  });

  suite.test('mceInsertContent - hr', function (editor) {
    let rng;

    editor.setContent('<p>123</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 2);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, '<hr />');
    LegacyUnit.equal(editor.getContent(), '<p>1</p><hr /><p>3</p>');
    rng = normalizeRng(editor.selection.getRng(true));
    ok(rng.collapsed);
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().lastChild);
    LegacyUnit.equal(rng.startContainer.nodeName, 'P');
    LegacyUnit.equal(rng.startOffset, 0);
    LegacyUnit.equal(rng.endContainer.nodeName, 'P');
    LegacyUnit.equal(rng.endOffset, 0);
  });

  suite.test('mceInsertContent - forced root block', function (editor) {
    // Forced root block
    editor.getBody().innerHTML = '';
    editor.execCommand('mceInsertContent', false, 'test<b>123</b><!-- a -->');
    // Opera adds an extra paragraph since it adds a BR at the end of the contents pass though this for now since it's an minority browser
    LegacyUnit.equal(editor.getContent().replace(/<p>\u00a0<\/p>/g, ''), '<p>test<strong>123</strong></p><!-- a -->');
  });

  suite.test('mceInsertContent - mixed inline content inside td', function (editor) {
    // Forced root block
    editor.getBody().innerHTML = '<table><tr><td>X</td></tr></table>';
    LegacyUnit.setSelection(editor, 'td', 0, 'td', 0);
    editor.execCommand('mceInsertContent', false, 'test<b>123</b><!-- a -->');
    LegacyUnit.equal(editor.getContent(), '<table><tbody><tr><td>test<strong>123</strong><!-- a -->X</td></tr></tbody></table>');
  });

  suite.test('mceInsertContent - invalid insertion with spans on page', function (editor) {
    const startingContent = '<p>123 testing <em>span later in document</em></p>',
      insertedContent = '<ul><li>u</li><li>l</li></ul>';
    editor.setContent(startingContent);
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 0);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, insertedContent);

    LegacyUnit.equal(editor.getContent(), insertedContent + startingContent);
  });

  suite.test('mceInsertContent - text with space before at start of block', function (editor) {
    editor.getBody().innerHTML = '<p>a</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('mceInsertContent', false, ' b');
    LegacyUnit.equal(editor.getContent(), '<p>\u00a0ba</p>');
  });

  suite.test('mceInsertContent - text with space after at end of block', function (editor) {
    editor.getBody().innerHTML = '<p>a</p>';
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.execCommand('mceInsertContent', false, 'b ');
    LegacyUnit.equal(editor.getContent(), '<p>ab\u00a0</p>');
  });

  suite.test('mceInsertContent - text with space before/after at middle of block', function (editor) {
    editor.getBody().innerHTML = '<p>ac</p>';
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.execCommand('mceInsertContent', false, ' b ');
    LegacyUnit.equal(editor.getContent(), '<p>a b c</p>');
  });

  suite.test('mceInsertContent - inline element with space before/after at middle of block', function (editor) {
    editor.getBody().innerHTML = '<p>ac</p>';
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.execCommand('mceInsertContent', false, ' <em>b</em> ');
    LegacyUnit.equal(editor.getContent(), '<p>a <em>b</em> c</p>');
  });

  suite.test('mceInsertContent - block element with space before/after at middle of block', function (editor) {
    editor.getBody().innerHTML = '<p>ac</p>';
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.execCommand('mceInsertContent', false, ' <p>b</p> ');
    LegacyUnit.equal(editor.getContent(), '<p>a</p><p>b</p><p>c</p>');
  });

  suite.test('mceInsertContent - strong in strong', function (editor) {
    editor.getBody().innerHTML = '<strong>ac</strong>';
    LegacyUnit.setSelection(editor, 'strong', 1);
    editor.execCommand('mceInsertContent', false, { content: '<strong>b</strong>', merge: true });
    LegacyUnit.equal(editor.getContent(), '<p><strong>abc</strong></p>');
  });

  suite.test('mceInsertContent - span in span same style color', function (editor) {
    editor.getBody().innerHTML = '<span style="color:#ff0000">ac</strong>';
    LegacyUnit.setSelection(editor, 'span', 1);
    editor.execCommand('mceInsertContent', false, { content: '<span style="color:#ff0000">b</span>', merge: true });
    LegacyUnit.equal(editor.getContent(), '<p><span style="color: #ff0000;">abc</span></p>');
  });

  suite.test('mceInsertContent - span in span different style color', function (editor) {
    editor.getBody().innerHTML = '<span style="color:#ff0000">ac</strong>';
    LegacyUnit.setSelection(editor, 'span', 1);
    editor.execCommand('mceInsertContent', false, { content: '<span style="color:#00ff00">b</span>', merge: true });
    LegacyUnit.equal(editor.getContent(), '<p><span style="color: #ff0000;">a<span style="color: #00ff00;">b</span>c</span></p>');
  });

  suite.test('mceInsertContent - select with option element', function (editor) {
    editor.getBody().innerHTML = '<p>1</p>';
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.execCommand('mceInsertContent', false, '2<select><option selected="selected">3</option></select>');
    LegacyUnit.equal(editor.getContent(), '<p>12<select><option selected="selected">3</option></select></p>');
  });

  suite.test('mceInsertContent - insert P in span style element #7090', function (editor) {
    editor.setContent('<p><span style="color: red">1</span></p><p>3</p>');
    LegacyUnit.setSelection(editor, 'span', 1);
    editor.execCommand('mceInsertContent', false, '<p>2</p>');
    LegacyUnit.equal(editor.getContent(), '<p><span style="color: red;">1</span></p><p>2</p><p>3</p>');
  });

  suite.test('mceInsertContent - insert char at char surrounded by spaces', function (editor) {
    editor.setContent('<p>a b c</p>');
    LegacyUnit.setSelection(editor, 'p', 2, 'p', 3);
    editor.execCommand('mceInsertContent', false, 'X');
    LegacyUnit.equal(JSON.serialize(editor.getContent()), '"<p>a X c</p>"');
  });

  suite.test('mceInsertRawHTML - insert p at start', function (editor) {
    editor.setContent('<p>abc</p>');
    editor.execCommand('mceInsertRawHTML', false, '<p>Hello world!</p>');
    LegacyUnit.equal(editor.getContent(), '<p>Hello world!</p><p>abc</p>');
  });

  suite.test('mceInsertRawHTML - insert link inside p', function (editor) {
    editor.setContent('<p>abc</p>');
    LegacyUnit.setSelection(editor, 'p', 3);
    editor.execCommand('mceInsertRawHTML', false, ' <a href="#">Hello world!</a>');
    LegacyUnit.equal(editor.getContent(), '<p>abc <a href="#">Hello world!</a></p>');
  });

  suite.test('mceInsertRawHTML - insert char at char surrounded by spaces', function (editor) {
    editor.setContent('<p>a b c</p>');
    LegacyUnit.setSelection(editor, 'p', 2, 'p', 3);
    editor.execCommand('mceInsertRawHTML', false, '<strong>X</strong>');
    LegacyUnit.equal(JSON.serialize(editor.getContent()), '"<p>a <strong>X</strong> c</p>"');
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    convert_urls: false,
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,' +
        'float,margin,margin-top,margin-right,margin-bottom,margin-left,padding-left,text-align,display'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
