import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.content.InsertContentCommandTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
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
  }, []);

  const isTextNode = (node: Node): node is Text =>
    node.nodeType === 3;

  const normalizeRng = (rng: Range) => {
    if (isTextNode(rng.startContainer)) {
      if (rng.startOffset === 0) {
        rng.setStartBefore(rng.startContainer);
      } else if (rng.startOffset >= rng.startContainer.data.length - 1) {
        rng.setStartAfter(rng.startContainer);
      }
    }

    if (isTextNode(rng.endContainer)) {
      if (rng.endOffset === 0) {
        rng.setEndBefore(rng.endContainer);
      } else if (rng.endOffset >= rng.endContainer.data.length - 1) {
        rng.setEndAfter(rng.endContainer);
      }
    }

    return rng;
  };

  it('mceInsertContent - p inside text of p', () => {
    const editor = hook.editor();
    editor.setContent('<p>1234</p>');
    editor.focus();
    let rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 1);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 3);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, '<p>abc</p>');
    TinyAssertions.assertContent(editor, '<p>1</p><p>abc</p><p>4</p>');
    rng = normalizeRng(editor.selection.getRng());
    assert.isTrue(rng.collapsed);
    assert.equal(rng.startContainer.nodeName, 'P');
    assert.equal(rng.startOffset, 1);
    assert.equal(rng.endContainer.nodeName, 'P');
    assert.equal(rng.endOffset, 1);
    assert.equal((rng.startContainer as HTMLElement).innerHTML, 'abc');
  });

  it('mceInsertContent before HR', () => {
    const editor = hook.editor();
    editor.setContent('<hr>');
    editor.focus();
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 0);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, 'x');
    TinyAssertions.assertContent(editor, '<p>x</p><hr>');
  });

  it('mceInsertContent HR at end of H1', () => {
    const editor = hook.editor();
    editor.setContent('<h1>abc</h1>');
    LegacyUnit.setSelection(editor, 'h1', 3);
    editor.execCommand('mceInsertContent', false, '<hr>');
    LegacyUnit.equalDom(editor.selection.getNode(), editor.getBody().lastChild as HTMLHeadingElement);
    assert.equal(editor.selection.getNode().nodeName, 'H1');
    TinyAssertions.assertContent(editor, '<h1>abc</h1><hr><h1>\u00a0</h1>');
  });

  it('mceInsertContent HR at end of H1 with P sibling', () => {
    const editor = hook.editor();
    editor.setContent('<h1>abc</h1><p>def</p>');
    LegacyUnit.setSelection(editor, 'h1', 3);
    editor.execCommand('mceInsertContent', false, '<hr>');
    LegacyUnit.equalDom(editor.selection.getNode(), editor.getBody().lastChild as HTMLParagraphElement);
    assert.equal(editor.selection.getNode().nodeName, 'P');
    TinyAssertions.assertContent(editor, '<h1>abc</h1><hr><p>def</p>');
  });

  it('mceInsertContent HR at end of H1 with inline elements with P sibling', () => {
    const editor = hook.editor();
    editor.setContent('<h1><strong>abc</strong></h1><p>def</p>');
    LegacyUnit.setSelection(editor, 'strong', 3);
    editor.execCommand('mceInsertContent', false, '<hr>');
    LegacyUnit.equalDom(editor.selection.getNode(), editor.getBody().lastChild as HTMLParagraphElement);
    assert.equal(editor.selection.getNode().nodeName, 'P');
    TinyAssertions.assertContent(editor, '<h1><strong>abc</strong></h1><hr><p>def</p>');
  });

  it('mceInsertContent empty block', () => {
    const editor = hook.editor();
    editor.setContent('<h1>abc</h1>');
    LegacyUnit.setSelection(editor, 'h1', 1);
    editor.execCommand('mceInsertContent', false, '<p></p>');
    LegacyUnit.equalDom(editor.selection.getNode(), editor.getBody().childNodes[1]);
    assert.equal(editor.selection.getNode().nodeName, 'P');
    TinyAssertions.assertContent(editor, '<h1>a</h1><p>\u00a0</p><h1>bc</h1>');
  });

  it('mceInsertContent table at end of H1 with P sibling', () => {
    const editor = hook.editor();
    editor.setContent('<h1>abc</h1><p>def</p>');
    LegacyUnit.setSelection(editor, 'h1', 3);
    editor.execCommand('mceInsertContent', false, '<table><tr><td></td></tr></table>');
    assert.equal(editor.selection.getNode().nodeName, 'TD');
    TinyAssertions.assertContent(editor, '<h1>abc</h1><table><tbody><tr><td>\u00a0</td></tr></tbody></table><p>def</p>');
  });

  it('mceInsertContent - p inside whole p', () => {
    const editor = hook.editor();
    let rng;

    editor.setContent('<p>1234</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 4);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, '<p>abc</p>');
    TinyAssertions.assertContent(editor, '<p>abc</p>');
    rng = normalizeRng(editor.selection.getRng());
    assert.isTrue(rng.collapsed);
    assert.equal(rng.startContainer.nodeName, 'P');
    assert.equal(rng.startOffset, 1);
    assert.equal(rng.endContainer.nodeName, 'P');
    assert.equal(rng.endOffset, 1);
    assert.equal((rng.startContainer as HTMLParagraphElement).innerHTML, 'abc');
  });

  it('mceInsertContent - pre in text of pre', () => {
    const editor = hook.editor();
    let rng;

    editor.setContent('<pre>1234</pre>');
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('pre')[0].firstChild as Text, 1);
    rng.setEnd(editor.dom.select('pre')[0].firstChild as Text, 3);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, '<pre>abc</pre>');
    TinyAssertions.assertContent(editor, '<pre>1</pre><pre>abc</pre><pre>4</pre>');
    rng = normalizeRng(editor.selection.getRng());
    assert.isTrue(rng.collapsed);
    assert.equal(rng.startContainer.nodeName, 'PRE');
    assert.equal(rng.startOffset, 1);
    assert.equal(rng.endContainer.nodeName, 'PRE');
    assert.equal(rng.endOffset, 1);
    assert.equal((rng.startContainer as HTMLPreElement).innerHTML, 'abc');
  });

  it('mceInsertContent - h1 in text of h1', () => {
    const editor = hook.editor();
    let rng;

    editor.setContent('<h1>1234</h1>');
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('h1')[0].firstChild as Text, 1);
    rng.setEnd(editor.dom.select('h1')[0].firstChild as Text, 3);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, '<h1>abc</h1>');
    TinyAssertions.assertContent(editor, '<h1>1</h1><h1>abc</h1><h1>4</h1>');
    rng = normalizeRng(editor.selection.getRng());
    assert.isTrue(rng.collapsed);
    assert.equal(rng.startContainer.nodeName, 'H1');
    assert.equal(rng.startOffset, 1);
    assert.equal(rng.endContainer.nodeName, 'H1');
    assert.equal(rng.endOffset, 1);
    assert.equal((rng.startContainer as HTMLHeadingElement).innerHTML, 'abc');
  });

  it('mceInsertContent - li inside li', () => {
    const editor = hook.editor();
    let rng;

    editor.setContent('<ul><li>1234</li></ul>');
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('li')[0].firstChild as Text, 1);
    rng.setEnd(editor.dom.select('li')[0].firstChild as Text, 3);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, '<li>abc</li>');
    TinyAssertions.assertContent(editor, '<ul><li>1</li><li>abc</li><li>4</li></ul>');
    rng = normalizeRng(editor.selection.getRng());
    assert.isTrue(rng.collapsed);
    assert.equal(rng.startContainer.nodeName, 'LI');
    assert.equal(rng.startOffset, 1);
    assert.equal(rng.endContainer.nodeName, 'LI');
    assert.equal(rng.endOffset, 1);
    assert.equal((rng.startContainer as HTMLLIElement).innerHTML, 'abc');
  });

  it('mceInsertContent - p inside empty editor', () => {
    const editor = hook.editor();
    editor.setContent('');
    editor.execCommand('mceInsertContent', false, '<p>abc</p>');
    TinyAssertions.assertContent(editor, '<p>abc</p>');
    const rng = normalizeRng(editor.selection.getRng());
    assert.isTrue(rng.collapsed);
    assert.equal(rng.startContainer.nodeName, 'P');
    assert.equal(rng.startOffset, 1);
    assert.equal(rng.endContainer.nodeName, 'P');
    assert.equal(rng.endOffset, 1);
    assert.equal((rng.startContainer as HTMLElement).innerHTML, 'abc');
  });

  it('mceInsertContent - text inside empty p', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p></p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('mceInsertContent', false, 'abc');
    assert.equal(
      editor.getBody().innerHTML.toLowerCase().replace(/^<br>/, ''),
      '<p>abc</p>'
    ); // Opera inserts a BR at the beginning of contents if the P is empty
    const rng = normalizeRng(editor.selection.getRng());
    assert.isTrue(rng.collapsed);
    assert.equal(rng.startContainer.nodeName, 'P');
    assert.equal(rng.startOffset, 1);
    assert.equal(rng.endContainer.nodeName, 'P');
    assert.equal(rng.endOffset, 1);
    assert.equal((rng.startContainer as HTMLElement).innerHTML, 'abc');
  });

  it('mceInsertContent - text inside empty p with br caret node', () => {
    const editor = hook.editor();
    let rng;

    editor.getBody().innerHTML = '<p><br></p>';
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild as Text, 0);
    rng.setEnd(editor.getBody().firstChild as Text, 0);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, 'abc');
    assert.equal(editor.getBody().innerHTML.toLowerCase(), '<p>abc</p>');
    rng = normalizeRng(editor.selection.getRng());
    assert.isTrue(rng.collapsed);
    assert.equal(rng.startContainer.nodeName, 'P');
    assert.equal(rng.startOffset, 1);
    assert.equal(rng.endContainer.nodeName, 'P');
    assert.equal(rng.endOffset, 1);
    assert.equal((rng.startContainer as HTMLParagraphElement).innerHTML, 'abc');
  });

  it('mceInsertContent - image inside p', () => {
    const editor = hook.editor();
    let rng;

    editor.setContent('<p>1</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 1);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, '<img src="about:blank" />');
    TinyAssertions.assertContent(editor, '<p><img src="about:blank"></p>');
    rng = normalizeRng(editor.selection.getRng());
    assert.isTrue(rng.collapsed);
    assert.equal(rng.startContainer.nodeName, 'P');
    assert.equal(rng.startOffset, 1);
    assert.equal(rng.endContainer.nodeName, 'P');
    assert.equal(rng.endOffset, 1);
  });

  it('mceInsertContent - legacy content', () => {
    const editor = hook.editor();
    // Convert legacy content
    editor.setContent('<p>1</p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 1);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, '<strike>strike</strike><font size="7">font</font>');
    TinyAssertions.assertContent(
      editor,
      '<p><s>strike</s><span style="font-size: 300%;">font</span></p>'
    );
  });

  it('mceInsertContent - hr', () => {
    const editor = hook.editor();
    let rng;

    editor.setContent('<p>123</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 1);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 2);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, '<hr />');
    TinyAssertions.assertContent(editor, '<p>1</p><hr><p>3</p>');
    rng = normalizeRng(editor.selection.getRng());
    assert.isTrue(rng.collapsed);
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().lastChild as HTMLParagraphElement);
    assert.equal(rng.startContainer.nodeName, 'P');
    assert.equal(rng.startOffset, 0);
    assert.equal(rng.endContainer.nodeName, 'P');
    assert.equal(rng.endOffset, 0);
  });

  it('mceInsertContent - forced root block', () => {
    const editor = hook.editor();
    // Forced root block
    editor.getBody().innerHTML = '';
    editor.execCommand('mceInsertContent', false, 'test<b>123</b><!-- a -->');
    // Opera adds an extra paragraph since it adds a BR at the end of the contents pass though this for now since it's an minority browser
    assert.equal(editor.getContent().replace(/<p>\u00a0<\/p>/g, ''), '<p>test<strong>123</strong></p><!-- a -->');
  });

  it('mceInsertContent - mixed inline content inside td', () => {
    const editor = hook.editor();
    // Forced root block
    editor.getBody().innerHTML = '<table><tr><td>X</td></tr></table>';
    LegacyUnit.setSelection(editor, 'td', 0, 'td', 0);
    editor.execCommand('mceInsertContent', false, 'test<b>123</b><!-- a -->');
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td>test<strong>123</strong><!-- a -->X</td></tr></tbody></table>');
  });

  it('mceInsertContent - invalid insertion with spans on page', () => {
    const editor = hook.editor();
    const startingContent = '<p>123 testing <em>span later in document</em></p>';
    const insertedContent = '<ul><li>u</li><li>l</li></ul>';
    editor.setContent(startingContent);
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 0);
    editor.selection.setRng(rng);
    editor.execCommand('mceInsertContent', false, insertedContent);

    TinyAssertions.assertContent(editor, insertedContent + startingContent);
  });

  it('mceInsertContent - text with space before at start of block', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>a</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('mceInsertContent', false, ' b');
    TinyAssertions.assertContent(editor, '<p>\u00a0ba</p>');
  });

  it('mceInsertContent - text with space after at end of block', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>a</p>';
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.execCommand('mceInsertContent', false, 'b ');
    TinyAssertions.assertContent(editor, '<p>ab\u00a0</p>');
  });

  it('mceInsertContent - text with space before/after at middle of block', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>ac</p>';
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.execCommand('mceInsertContent', false, ' b ');
    TinyAssertions.assertContent(editor, '<p>a b c</p>');
  });

  it('mceInsertContent - inline element with space before/after at middle of block', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>ac</p>';
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.execCommand('mceInsertContent', false, ' <em>b</em> ');
    TinyAssertions.assertContent(editor, '<p>a <em>b</em> c</p>');
  });

  it('mceInsertContent - block element with space before/after at middle of block', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>ac</p>';
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.execCommand('mceInsertContent', false, ' <p>b</p> ');
    TinyAssertions.assertContent(editor, '<p>a</p><p>b</p><p>c</p>');
  });

  it('mceInsertContent - strong in strong', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<strong>ac</strong>';
    LegacyUnit.setSelection(editor, 'strong', 1);
    editor.execCommand('mceInsertContent', false, { content: '<strong>b</strong>', merge: true });
    TinyAssertions.assertContent(editor, '<p><strong>abc</strong></p>');
  });

  it('mceInsertContent - span in span same style color', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<span style="color:#ff0000">ac</strong>';
    LegacyUnit.setSelection(editor, 'span', 1);
    editor.execCommand('mceInsertContent', false, { content: '<span style="color:#ff0000">b</span>', merge: true });
    TinyAssertions.assertContent(editor, '<p><span style="color: #ff0000;">abc</span></p>');
  });

  it('mceInsertContent - span in span different style color', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<span style="color:#ff0000">ac</strong>';
    LegacyUnit.setSelection(editor, 'span', 1);
    editor.execCommand('mceInsertContent', false, { content: '<span style="color:#00ff00">b</span>', merge: true });
    TinyAssertions.assertContent(editor, '<p><span style="color: #ff0000;">a<span style="color: #00ff00;">b</span>c</span></p>');
  });

  it('mceInsertContent - select with option element', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>1</p>';
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.execCommand('mceInsertContent', false, '2<select><option selected="selected">3</option></select>');
    TinyAssertions.assertContent(editor, '<p>12<select><option selected="selected">3</option></select></p>');
  });

  it('mceInsertContent - insert P in span style element #7090', () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="color: red">1</span></p><p>3</p>');
    LegacyUnit.setSelection(editor, 'span', 1);
    editor.execCommand('mceInsertContent', false, '<p>2</p>');
    TinyAssertions.assertContent(editor, '<p><span style="color: red;">1</span></p><p>2</p><p>3</p>');
  });

  it('mceInsertContent - insert char at char surrounded by spaces', () => {
    const editor = hook.editor();
    editor.setContent('<p>a b c</p>');
    LegacyUnit.setSelection(editor, 'p', 2, 'p', 3);
    editor.execCommand('mceInsertContent', false, 'X');
    assert.equal(JSON.stringify(editor.getContent()), '"<p>a X c</p>"');
  });
});
