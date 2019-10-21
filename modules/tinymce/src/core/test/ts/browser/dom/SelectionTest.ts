import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document, HTMLElement, Text } from '@ephox/dom-globals';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import * as CaretContainer from 'tinymce/core/caret/CaretContainer';
import Zwsp from 'tinymce/core/text/Zwsp';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.dom.SelectionTest', function (success, failure) {
  const suite = LegacyUnit.createSuite<Editor>();

  Theme();

  suite.test('getContent', function (editor) {
    let rng, eventObj;

    editor.focus();

    // Get selected contents
    editor.setContent('<p>text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.selection.getContent(), '<p>text</p>', 'Get selected contents');

    // Get selected contents (collapsed)
    editor.setContent('<p>text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 0);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.selection.getContent(), '', 'Get selected contents (collapsed)');

    // Get selected contents, onGetContent event
    eventObj = {};

    const handler = function (event) {
      eventObj = event;
    };

    editor.on('GetContent', handler);
    editor.setContent('<p>text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.selection.getContent();
    LegacyUnit.equal(eventObj.content, '<p>text</p>', 'Get selected contents, onGetContent event');
    editor.off('GetContent', handler);
  });

  suite.test('getContent contextual', function (editor) {
    editor.setContent('<p><em>text</em></p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('em')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('em')[0].firstChild, 3);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.selection.getContent({ contextual: true }), '<em>ex</em>', 'Get selected contents');
  });

  suite.test('getContent of zwsp', function (editor) {
    editor.setContent('<p>a' + Zwsp.ZWSP + 'b</p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.selection.getContent(), '<p>ab</p>', 'Get selected contents');
    LegacyUnit.equal(editor.selection.getContent({ format: 'text' }), 'ab', 'Get selected contents');
  });

  suite.test('setContent', function (editor) {
    let rng, eventObj;

    // Set contents at selection
    editor.setContent('<p>text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.selection.setContent('<div>test</div>');
    LegacyUnit.equal(editor.getContent(), '<div>test</div>', 'Set contents at selection');

    // Set contents at selection (collapsed)
    editor.setContent('<p>text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 0);
    editor.selection.setRng(rng);
    editor.selection.setContent('<div>test</div>');
    LegacyUnit.equal(editor.getContent(), '<div>test</div>\n<p>text</p>', 'Set contents at selection (collapsed)');

    // Insert in middle of paragraph
    editor.setContent('<p>beforeafter</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild.firstChild, 'before'.length);
    rng.setEnd(editor.getBody().firstChild.firstChild, 'before'.length);
    editor.selection.setRng(rng);
    editor.selection.setContent('<br />');
    LegacyUnit.equal(editor.getContent(), '<p>before<br />after</p>', 'Set contents at selection (inside paragraph)');

    // Check the caret is left in the correct position.
    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().firstChild, 'Selection start container');
    LegacyUnit.equal(rng.startOffset, 2, 'Selection start offset');
    LegacyUnit.equalDom(rng.endContainer, editor.getBody().firstChild, 'Selection end container');
    LegacyUnit.equal(rng.endOffset, 2, 'Selection end offset');

    editor.setContent('<p>text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 0);
    editor.selection.setRng(rng);
    editor.selection.setContent('');
    LegacyUnit.equal(editor.getContent(), '<p>text</p>', 'Set contents to empty at selection (collapsed)');
    rng = editor.selection.getRng();
    if (!document.createRange) {
      // The old IE selection can only be positioned in text nodes
      LegacyUnit.equalDom(rng.startContainer, editor.getBody().firstChild.firstChild, 'Selection start container');
      LegacyUnit.equal(rng.startOffset, 0, 'Selection start offset');
      LegacyUnit.equalDom(rng.endContainer, editor.getBody().firstChild.firstChild, 'Selection end container');
      LegacyUnit.equal(rng.endOffset, 0, 'Selection end offset');
    } else {
      LegacyUnit.equalDom(rng.startContainer, editor.getBody(), 'Selection start container');
      LegacyUnit.equal(rng.startOffset, 0, 'Selection start offset');
      LegacyUnit.equalDom(rng.endContainer, editor.getBody(), 'Selection end container');
      LegacyUnit.equal(rng.endOffset, 0, 'Selection end offset');
    }

    // Set selected contents, onSetContent event
    eventObj = {};

    const handler = function (event) {
      eventObj = event;
    };

    editor.on('SetContent', handler);
    editor.setContent('<p>text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.selection.setContent('<div>text</div>');
    LegacyUnit.equal(eventObj.content, '<div>text</div>', 'Set selected contents, onSetContent event');
    editor.off('SetContent', handler);
  });

  suite.test('getStart/getEnd', function (editor) {
    let rng;

    // Selected contents
    editor.setContent('<p id="a">text</p><p id="b">text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild.firstChild, 0);
    rng.setEnd(editor.getBody().lastChild.firstChild, 0);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.selection.getStart().id, 'a', 'Selected contents (getStart)');
    LegacyUnit.equal(editor.selection.getEnd().id, 'b', 'Selected contents (getEnd)');

    // Selected contents (collapsed)
    editor.setContent('<p id="a">text</p>\n<p id="b">text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild.firstChild, 0);
    rng.setEnd(editor.getBody().firstChild.firstChild, 0);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.selection.getStart().id, 'a', 'Selected contents (getStart, collapsed)');
    LegacyUnit.equal(editor.selection.getEnd().id, 'a', 'Selected contents (getEnd, collapsed)');
  });

  suite.test('getSelectedBlocks with collapsed selection between elements', (editor: Editor) => {
    editor.setContent('<p>a</p><p>b</p><p>c</p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 1);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.selection.getSelectedBlocks().length, 0, 'should return empty array');
  });

  suite.test('getStart/getEnd on comment should return parent element', function (editor) {
    editor.setContent('<p><!-- x --></p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild, 0);
    rng.setEnd(editor.getBody().firstChild, 0);
    editor.selection.setRng(rng);

    LegacyUnit.equal(editor.selection.getStart().nodeName, 'P', 'Node name should be paragraph');
    LegacyUnit.equal(editor.selection.getStart(true).nodeName, 'P', 'Node name should be paragraph');
    LegacyUnit.equal(editor.selection.getEnd().nodeName, 'P', 'Node name should be paragraph');
    LegacyUnit.equal(editor.selection.getEnd(true).nodeName, 'P', 'Node name should be paragraph');
  });

  suite.test('getBookmark/setBookmark (persistent)', function (editor) {
    let rng, bookmark;

    // Get persistent bookmark simple text selection
    editor.setContent('text');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild, 1);
    rng.setEnd(editor.getBody().firstChild, 3);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark();
    LegacyUnit.equal(editor.getContent(), 'text', 'Editor contents (text)');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), 'ex', 'Selected contents (text)');

    // Get persistent bookmark multiple elements text selection
    editor.setContent('<p>text</p>\n<p>text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild.firstChild, 1);
    rng.setEnd(editor.getBody().lastChild.firstChild, 3);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark();
    LegacyUnit.equal(editor.getContent(), '<p>text</p>\n<p>text</p>', 'Editor contents (elements)');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), '<p>ext</p>\n<p>tex</p>', 'Selected contents (elements)');
  });

  suite.test('getBookmark/setBookmark (simple)', function (editor) {
    let rng, bookmark;

    // Get persistent bookmark simple text selection
    editor.setContent('text');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild, 1);
    rng.setEnd(editor.getBody().firstChild, 3);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(1);
    LegacyUnit.equal(editor.getContent(), 'text', 'Editor contents (text)');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), 'ex', 'Selected contents (text)');

    // Get persistent bookmark multiple elements text selection
    editor.setContent('<p>text</p>\n<p>text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild.firstChild, 1);
    rng.setEnd(editor.getBody().lastChild.firstChild, 3);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(1);
    LegacyUnit.equal(editor.getContent(), '<p>text</p>\n<p>text</p>', 'Editor contents (elements)');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), '<p>ext</p>\n<p>tex</p>', 'Selected contents (elements)');
  });

  suite.test('getBookmark/setBookmark (nonintrusive) - simple text selection', function (editor) {
    let rng, bookmark;

    editor.setContent('text');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild, 1);
    rng.setEnd(editor.getBody().firstChild, 3);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(2);
    LegacyUnit.equal(editor.getContent(), 'text', 'Editor contents (text)');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), 'ex', 'Selected contents (text)');
  });

  suite.test('getBookmark/setBookmark (nonintrusive) - Get non intrusive bookmark simple element selection', function (editor) {
    let rng, bookmark;

    // Get non intrusive bookmark simple element selection
    editor.setContent('<p>text<em>a<strong>b</strong>c</em></p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('em')[0], 1);
    rng.setEnd(editor.dom.select('em')[0], 2);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(2);
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), '<strong>b</strong>', 'Selected contents (element)');
  });

  suite.test('getBookmark/setBookmark (nonintrusive) - Get non intrusive bookmark multiple elements text selection', function (editor) {
    let rng, bookmark;

    // Get non intrusive bookmark multiple elements text selection
    editor.setContent('<p>text</p>\n<p>text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild.firstChild, 1);
    rng.setEnd(editor.getBody().lastChild.firstChild, 3);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(2);
    LegacyUnit.equal(editor.getContent(), '<p>text</p>\n<p>text</p>', 'Editor contents (elements)');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), '<p>ext</p>\n<p>tex</p>', 'Selected contents (elements)');
  });

  suite.test('getBookmark/setBookmark (nonintrusive)', function (editor) {
    let rng, bookmark;

    // Get non intrusive bookmark multiple elements text selection fragmented
    editor.setContent('<p>text</p><p>text</p>');
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('text'));
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild.lastChild, 1);
    rng.setEnd(editor.getBody().lastChild.firstChild, 3);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(2);
    LegacyUnit.equal(editor.getContent(), '<p>textaaatext</p>\n<p>text</p>', 'Editor contents (fragmented, elements)');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), '<p>ext</p>\n<p>tex</p>', 'Selected contents (fragmented, elements)');
  });

  suite.test('getBookmark/setBookmark (nonintrusive) - fragmentext text (normalized)', function (editor) {
    let rng, bookmark;

    // Get non intrusive bookmark multiple elements text selection fragmented
    editor.setContent('<p>text</p><p>text</p>');
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('text'));
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild.lastChild, 1);
    rng.setEnd(editor.getBody().lastChild.firstChild, 3);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(2, true);
    editor.setContent(editor.getContent());
    LegacyUnit.equal(editor.getContent(), '<p>textaaatext</p>\n<p>text</p>', 'Editor contents (fragmented, elements)');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), '<p>ext</p>\n<p>tex</p>', 'Selected contents (fragmented, elements)');
  });

  suite.test('getBookmark/setBookmark (nonintrusive) - fragmentext text with zwsp (normalized)', function (editor) {
    let rng, bookmark;

    // Get non intrusive bookmark multiple elements text selection fragmented
    editor.setContent('<p>text</p><p>text</p>');
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode(Zwsp.ZWSP));
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode(Zwsp.ZWSP));
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('text'));
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild.lastChild, 1);
    rng.setEnd(editor.getBody().lastChild.firstChild, 3);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(2, true);
    editor.setContent(editor.getContent());
    LegacyUnit.equal(editor.getContent(), '<p>textatext</p>\n<p>text</p>', 'Editor contents (fragmented, elements)');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), '<p>ext</p>\n<p>tex</p>', 'Selected contents (fragmented, elements)');
  });

  suite.test('getBookmark/setBookmark (nonintrusive) - Get bookmark before image', function (editor) {
    let rng, bookmark;

    editor.setContent('<p><img src="about:blank" /></p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild, 0);
    rng.setEnd(editor.getBody().firstChild, 0);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(2, true);
    editor.getBody().innerHTML = editor.getBody().innerHTML;
    editor.selection.moveToBookmark(bookmark);
    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().firstChild);
    LegacyUnit.equal(rng.startOffset, 0);
    LegacyUnit.equalDom(rng.endContainer, editor.getBody().firstChild);
    LegacyUnit.equal(rng.endOffset, 0);
  });

  suite.test('getBookmark/setBookmark (nonintrusive) - Get bookmark before/after image', function (editor) {
    let rng, bookmark;

    editor.setContent('<p><img src="about:blank" /></p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild, 0);
    rng.setEnd(editor.getBody().firstChild, 1);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(2, true);
    editor.getBody().innerHTML = editor.getBody().innerHTML;
    editor.selection.moveToBookmark(bookmark);
    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().firstChild);
    LegacyUnit.equal(rng.startOffset, 0);
    LegacyUnit.equalDom(rng.endContainer, editor.getBody().firstChild);
    LegacyUnit.equal(rng.endOffset, 1);
  });

  suite.test('getBookmark/setBookmark (nonintrusive) - Get bookmark after image', function (editor) {
    let rng, bookmark;

    editor.setContent('<p><img src="about:blank" /></p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild, 1);
    rng.setEnd(editor.getBody().firstChild, 1);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(2, true);
    editor.getBody().innerHTML = editor.getBody().innerHTML;
    editor.selection.moveToBookmark(bookmark);
    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().firstChild);
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equalDom(rng.endContainer, editor.getBody().firstChild);
    LegacyUnit.equal(rng.endOffset, 1);
  });

  suite.test('getBookmark/setBookmark (nonintrusive) - Get bookmark before element', function (editor) {
    let rng, bookmark;

    editor.setContent('abc<b>123</b>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild, 0);
    rng.setEnd(editor.getBody().firstChild, 2);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(2, true);
    editor.getBody().innerHTML = editor.getBody().innerHTML;
    editor.selection.moveToBookmark(bookmark);
    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().firstChild);
    LegacyUnit.equal(rng.startOffset, 0);
    LegacyUnit.equalDom(rng.endContainer, editor.getBody().firstChild);
    LegacyUnit.equal(rng.endOffset, 2);
  });

  suite.test('getBookmark/setBookmark (nonintrusive) - Get bookmark after element', function (editor) {
    let rng, bookmark;

    // Get bookmark after element
    editor.setContent('<b>123</b>abc');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().lastChild, 1);
    rng.setEnd(editor.getBody().lastChild, 2);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(2, true);
    editor.getBody().innerHTML = editor.getBody().innerHTML;
    editor.selection.moveToBookmark(bookmark);
    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().lastChild);
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equalDom(rng.endContainer, editor.getBody().lastChild);
    LegacyUnit.equal(rng.endOffset, 2);
  });

  suite.test('getBookmark/setBookmark (nonintrusive) - Get bookmark inside element', function (editor) {
    let rng, bookmark;

    editor.setContent('abc<b>123</b>abc');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().childNodes[1].firstChild, 1);
    rng.setEnd(editor.getBody().childNodes[1].firstChild, 2);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(2, true);
    editor.getBody().innerHTML = editor.getBody().innerHTML;
    editor.selection.moveToBookmark(bookmark);
    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().childNodes[1].firstChild);
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equalDom(rng.endContainer, editor.getBody().childNodes[1].firstChild);
    LegacyUnit.equal(rng.endOffset, 2);
  });

  suite.test('getBookmark/setBookmark (nonintrusive) - Get bookmark inside root text', function (editor) {
    let rng, bookmark;

    editor.setContent('abc');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild, 1);
    rng.setEnd(editor.getBody().firstChild, 2);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(2, true);
    editor.getBody().innerHTML = editor.getBody().innerHTML;
    editor.selection.moveToBookmark(bookmark);
    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().firstChild);
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equalDom(rng.endContainer, editor.getBody().firstChild);
    LegacyUnit.equal(rng.endOffset, 2);
  });

  suite.test('getBookmark/setBookmark (nonintrusive) - Get bookmark inside complex html', function (editor) {
    let rng, bookmark;

    editor.setContent('<p>abc</p>123<p>123</p><p>123<b>123</b><table><tr><td>abc</td></tr></table></p>');
    editor.execCommand('SelectAll');
    LegacyUnit.setSelection(editor, 'td', 1, 'td', 2);
    bookmark = editor.selection.getBookmark(2, true);
    editor.getBody().innerHTML = editor.getBody().innerHTML;
    editor.selection.moveToBookmark(bookmark);
    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.dom.select('td')[0].firstChild);
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equalDom(rng.endContainer, editor.dom.select('td')[0].firstChild);
    LegacyUnit.equal(rng.endOffset, 2);
  });

  suite.test('getBookmark/setBookmark on cE=false', function (editor) {
    let bookmark;

    editor.setContent('text<span contentEditable="false">1</span>');
    editor.selection.select(editor.$('span')[0]);
    bookmark = editor.selection.getBookmark(2);
    editor.setContent('text<span contentEditable="false">1</span>');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equalDom(editor.selection.getNode(), editor.$('span')[0]);
  });

  suite.test('getBookmark/setBookmark before cE=false', function (editor) {
    let rng, bookmark;

    editor.setContent('<p><input><span contentEditable="false">1</span></p>');
    CaretContainer.insertInline(editor.$('span')[0], true);
    rng = editor.dom.createRng();
    rng.setStart(editor.$('span')[0].previousSibling, 0);
    rng.setEnd(editor.$('span')[0].previousSibling, 0);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(2);
    editor.setContent('<p><input><span contentEditable="false">1</span></p>');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equalDom(editor.selection.getNode(), editor.$('span')[0]);
  });

  suite.test('getBookmark/setBookmark before cE=false block', function (editor) {
    let rng, bookmark;

    editor.setContent('<p contentEditable="false">1</p>');
    CaretContainer.insertBlock('p', editor.$('p')[0], true);
    rng = editor.dom.createRng();
    rng.setStart(editor.$('p')[0], 0);
    rng.setEnd(editor.$('p')[0], 0);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(2);
    editor.setContent('<p contentEditable="false">1</p>');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equalDom(editor.selection.getNode(), editor.$('p')[0]);
  });

  suite.test('select empty TD', function (editor) {
    editor.getBody().innerHTML = '<table><tr><td><br></td></tr></table>';
    editor.selection.select(editor.dom.select('td')[0], true);
    LegacyUnit.equal(editor.selection.getRng().startContainer.nodeName, 'TD');
  });

  suite.test('select first p', function (editor) {
    editor.setContent('<p>text1</p><p>text2</p>');
    editor.selection.select(editor.dom.select('p')[0]);
    LegacyUnit.equal(editor.selection.getContent(), '<p>text1</p>', 'Select simple element, content');
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'P', 'Select simple element, nodeName');
  });

  suite.test('select table', function (editor) {
    editor.setContent('<table><tbody><tr><td>text1</td></tr></tbody></table>');
    editor.selection.select(editor.dom.select('table')[0]);
    LegacyUnit.equal(
      editor.selection.getContent(),
      '<table>\n<tbody>\n<tr>\n<td>text1</td>\n</tr>\n</tbody>\n</table>',
      'Select complex element, content'
    );
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'TABLE', 'Select complex element, nodeName');
  });

  suite.test('select table text 1', function (editor) {
    editor.setContent('<table><tbody><tr><td id="a">text1</td><td id="b">text2</td></tr></tbody></table>');
    editor.selection.select(editor.dom.select('table')[0], true);
    LegacyUnit.equal(editor.selection.getStart().id, 'a', 'Expand to text content 1 (start)');
    LegacyUnit.equal(editor.selection.getEnd().id, 'b', 'Expand to text content 1 (end)');
  });

  suite.test('select table text 2', function (editor) {
    editor.setContent('<table><tbody><tr><td id="a"><br /></td><td id="b"><br /></td></tr></tbody></table>');
    editor.selection.select(editor.dom.select('table')[0], true);
    LegacyUnit.equal(editor.dom.getParent(editor.selection.getStart(), 'td').id, 'a', 'Expand to text content 2 (start)');
    LegacyUnit.equal(editor.dom.getParent(editor.selection.getEnd(), 'td').id, 'b', 'Expand to text content 2 (end)');
  });

  suite.test('getNode', function (editor) {
    let rng;

    editor.setContent('<p id="p1"><span id="s1">span1</span> word <span id="s2">span2</span> word <span id="s3">span3</span></p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.get('s1').firstChild, 0);
    rng.setEnd(editor.dom.get('s1').nextSibling, 0);
    editor.selection.setRng(rng);
    LegacyUnit.equalDom(
      editor.selection.getNode(),
      editor.dom.get('s1'),
      'Detect selection ends immediately after node at start of paragraph.'
    );

    rng = editor.dom.createRng();
    rng.setStart(editor.dom.get('s2').previousSibling, (editor.dom.get('s2').previousSibling as Text).length);
    rng.setEnd(editor.dom.get('s2').nextSibling, 0);
    editor.selection.setRng(rng);
    LegacyUnit.equalDom(
      editor.selection.getNode(),
      editor.dom.get('s2'),
      'Detect selection immediately surrounds node in middle of paragraph.'
    );

    rng = editor.dom.createRng();
    rng.setStart(editor.dom.get('s3').previousSibling, (editor.dom.get('s3').previousSibling as Text).length);
    rng.setEnd(editor.dom.get('s3').lastChild, (editor.dom.get('s3').lastChild as Text).length);
    editor.selection.setRng(rng);
    LegacyUnit.equalDom(
      editor.selection.getNode(),
      editor.dom.get('s3'),
      'Detect selection starts immediately before node at end of paragraph.'
    );

    rng = editor.dom.createRng();
    rng.setStart(editor.dom.get('s2').previousSibling, (editor.dom.get('s2').previousSibling as Text).length);
    rng.setEnd(editor.dom.get('s3').lastChild, (editor.dom.get('s3').lastChild as Text).length);
    editor.selection.setRng(rng);
    LegacyUnit.equalDom(
      editor.selection.getNode(),
      editor.dom.get('p1'),
      'Detect selection wrapping multiple nodes does not collapse.'
    );
  });

  suite.test('normalize to text node from document', function (editor) {
    let rng;

    // if (tinymce.isOpera || tinymce.isIE) {
    //  ok(true, "Skipped on Opera/IE since Opera doesn't let you to set the range to document and IE will steal focus.");
    //  return;
    // }

    editor.setContent('<p>text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getDoc(), 0);
    rng.setEnd(editor.getDoc(), 0);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeType, 3, 'startContainer node type');
    LegacyUnit.equal(rng.startOffset, 0, 'startContainer offset');
    LegacyUnit.equal(rng.endContainer.nodeType, 3, 'endContainer node type');
    LegacyUnit.equal(rng.endOffset, 0, 'endOffset offset');
  });

  suite.test('normalize to br from document', function (editor) {
    let rng;

    // if (tinymce.isOpera || tinymce.isIE) {
    //  ok(true, "Skipped on Opera/IE since Opera doesn't let you to set the range to document and IE will steal focus.");
    //  return;
    // }

    editor.setContent('<p><br /></p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getDoc(), 0);
    rng.setEnd(editor.getDoc(), 0);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, 'P', 'startContainer node name');
    LegacyUnit.equal(rng.startContainer.nodeType, 1, 'startContainer node type');
    LegacyUnit.equal(rng.startOffset, 0, 'startContainer offset');
    LegacyUnit.equal(rng.endContainer.nodeType, 1, 'endContainer node type');
    LegacyUnit.equal(rng.endOffset, 0, 'endOffset offset');
  });

  suite.test('normalize with contentEditable:false element', function (editor) {
    let rng;

    editor.setContent('<p>a<b contentEditable="false">b</b>c</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild.lastChild, 0);
    rng.setEnd(editor.getBody().firstChild.lastChild, 0);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.collapsed, true);
    LegacyUnit.equal(CaretContainer.isCaretContainer(rng.startContainer), true);
  });

  suite.test('normalize with contentEditable:false parent and contentEditable:true child element', function (editor) {
    editor.setContent('<p contentEditable="false">a<em contentEditable="true">b</em></p>');
    LegacyUnit.setSelection(editor, 'em', 0);
    editor.selection.normalize();

    const rng = editor.selection.getRng();
    LegacyUnit.equal(rng.collapsed, true);
    LegacyUnit.equal(rng.startContainer.nodeType, 3);
    LegacyUnit.equal((rng.startContainer as Text).data, 'b');

    // WebKit is in some state state here, so lets restore it
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 0);
    editor.selection.setRng(rng);
  });

  suite.test('normalize with contentEditable:true parent and contentEditable:false child element', function (editor) {
    if (Env.browser.isIE()) {
      editor.setContent('<p contentEditable="true">a<em contentEditable="false">b</em></p>');
      LegacyUnit.setSelection(editor, 'em', 0);
      editor.selection.normalize();

      const rng = editor.selection.getRng();

      LegacyUnit.equal((rng.startContainer.parentNode as HTMLElement).contentEditable !== 'false', true);
      LegacyUnit.equal(rng.startOffset, 0);
    }
  });

  suite.test('normalize to text node from body', function (editor) {
    let rng;

    editor.setContent('<p>text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 0);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeType, 3, 'startContainer node type');
    LegacyUnit.equal(rng.startOffset, 0, 'startContainer offset');
    LegacyUnit.equal(rng.endContainer.nodeType, 3, 'endContainer node type');
    LegacyUnit.equal(rng.endOffset, 0, 'endOffset offset');
  });

  suite.test('normalize to br from body', function (editor) {
    let rng;

    editor.setContent('<p><br /></p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 0);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, 'P', 'startContainer node name');
    LegacyUnit.equal(rng.startContainer.nodeType, 1, 'startContainer node type');
    LegacyUnit.equal(rng.startOffset, 0, 'startContainer offset');
    LegacyUnit.equal(rng.endContainer.nodeType, 1, 'endContainer node type');
    LegacyUnit.equal(rng.endOffset, 0, 'endOffset offset');
  });

  suite.test('normalize ignore img', function (editor) {
    let rng;

    editor.getBody().innerHTML = '<img src="about:blank " />';
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, 'BODY', 'startContainer node name');
    LegacyUnit.equal(rng.startContainer.nodeType, 1, 'startContainer node type');
    LegacyUnit.equal(rng.startOffset, 0, 'startContainer offset');
    LegacyUnit.equal(rng.endContainer.nodeName, 'BODY', 'endContainer node name');
    LegacyUnit.equal(rng.endContainer.nodeType, 1, 'endContainer node type');
    LegacyUnit.equal(rng.endOffset, 1, 'endOffset offset');
  });

  suite.test('normalize to before/after img', function (editor) {
    let rng;

    editor.getBody().innerHTML = '<p><img src="about:blank " /></p>';
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, 'P', 'startContainer node name');
    LegacyUnit.equal(rng.startContainer.nodeType, 1, 'startContainer node type');
    LegacyUnit.equal(rng.startOffset, 0, 'startContainer offset');
    LegacyUnit.equal(rng.endContainer.nodeName, 'P', 'endContainer node name');
    LegacyUnit.equal(rng.endContainer.nodeType, 1, 'endContainer node type');
    LegacyUnit.equal(rng.endOffset, 1, 'endOffset offset');
  });

  suite.test('normalize to before/after pre', function (editor) {
    let rng;

    editor.getBody().innerHTML = '<pre>a<pre>';
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, 'BODY', 'startContainer node name');
    LegacyUnit.equal(rng.startContainer.nodeType, 1, 'startContainer node type');
    LegacyUnit.equal(rng.startOffset, 0, 'startContainer offset');
    LegacyUnit.equal(rng.endContainer.nodeName, 'BODY', 'endContainer node name');
    LegacyUnit.equal(rng.endContainer.nodeType, 1, 'endContainer node type');
    LegacyUnit.equal(rng.endOffset, 1, 'endOffset offset');
  });

  suite.test('normalize to text node inside P', function (editor) {
    let rng;

    editor.getBody().innerHTML = '<p>abc</p>';
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, '#text', 'startContainer node name');
    LegacyUnit.equal(rng.startOffset, 0, 'startContainer offset');
    LegacyUnit.equal(rng.endContainer.nodeName, '#text', 'endContainer node name');
    LegacyUnit.equal(rng.endOffset, 3, 'endOffset offset');
  });

  suite.test('normalize lean left if at the start of text node', function (editor) {
    let rng;

    editor.getBody().innerHTML = '<p><b>a</b><i>b</i></p>';
    LegacyUnit.setSelection(editor, 'i', 0);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, '#text', 'startContainer node name');
    LegacyUnit.equal(rng.startContainer.parentNode.nodeName, 'B');
    LegacyUnit.equal(rng.startOffset, 1, 'startContainer offset');
    LegacyUnit.equal(rng.endContainer.nodeName, '#text');
    LegacyUnit.equal(rng.endContainer.parentNode.nodeName, 'B');
    LegacyUnit.equal(rng.endOffset, 1, 'endOffset offset');
  });

  suite.test('normalize lean start to the right if at end of text node', function (editor) {
    let rng;

    editor.getBody().innerHTML = '<p><b>a</b><i>b</i></p>';
    LegacyUnit.setSelection(editor, 'b', 1, 'i', 1);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, '#text', 'startContainer node name');
    LegacyUnit.equal(rng.startContainer.parentNode.nodeName, 'I');
    LegacyUnit.equal(rng.startOffset, 0, 'startContainer offset');
    LegacyUnit.equal(rng.endContainer.nodeName, '#text');
    LegacyUnit.equal(rng.endContainer.parentNode.nodeName, 'I');
    LegacyUnit.equal(rng.endOffset, 1, 'endOffset offset');
  });

  suite.test('normalize lean left but break before br', function (editor) {
    let rng;

    editor.getBody().innerHTML = '<p>a<br><b>b</b></p>';
    LegacyUnit.setSelection(editor, 'b', 0);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeValue, 'b');
    LegacyUnit.equal(rng.startOffset, 0);
  });

  suite.test('normalize lean left but break before img', function (editor) {
    let rng;

    editor.getBody().innerHTML = '<p>a<img><b>b</b></p>';
    LegacyUnit.setSelection(editor, 'b', 0);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeValue, 'b');
    LegacyUnit.equal(rng.startOffset, 0);
  });

  suite.test('normalize lean left but don\'t walk out the parent block', function (editor) {
    let rng;

    editor.getBody().innerHTML = '<p>a</p><p><b>b</b></p>';
    LegacyUnit.setSelection(editor, 'b', 0);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeValue, 'b');
    LegacyUnit.equal(rng.startOffset, 0);
  });

  suite.test('normalize lean left into empty inline elements when caret is before br', function (editor) {
    let rng;

    editor.getBody().innerHTML = '<p><i><b></b></i><br /></p>';
    rng = editor.dom.createRng();
    rng.setStartBefore(editor.getBody().firstChild.lastChild);
    rng.setEndBefore(editor.getBody().firstChild.lastChild);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, 'B');
    LegacyUnit.equal(rng.startOffset, 0);
  });

  suite.test('normalize lean left from br into formatter caret container', function (editor) {
    let rng;

    editor.getBody().innerHTML = '<p><span id="_mce_caret">' + Zwsp.ZWSP + '</span><br /></p>';
    rng = editor.dom.createRng();
    rng.setStartBefore(editor.getBody().firstChild.lastChild);
    rng.setEndBefore(editor.getBody().firstChild.lastChild);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeType, 3);
    LegacyUnit.equal(rng.startOffset, 1);
  });

  suite.test('normalize don\'t lean left into empty inline elements if there is a br element after caret', function (editor) {
    let rng;

    editor.getBody().innerHTML = '<p><i><b></b></i><br /><br /></p>';
    rng = editor.dom.createRng();
    rng.setStartBefore(editor.getBody().firstChild.lastChild);
    rng.setEndBefore(editor.getBody().firstChild.lastChild);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, 'P');
    LegacyUnit.equal(rng.startOffset, 2);
  });

  suite.test('normalize don\'t lean left into empty inline elements if there is a br element before caret', function (editor) {
    let rng;

    editor.getBody().innerHTML = '<p><i><b><br /></b></i><br /></p>';
    rng = editor.dom.createRng();
    rng.setStartBefore(editor.getBody().firstChild.lastChild);
    rng.setEndBefore(editor.getBody().firstChild.lastChild);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, 'P');
    LegacyUnit.equal(rng.startOffset, 1);
  });

  suite.test('normalize don\'t move start/end if it\'s before/after table', function (editor) {
    let rng;

    editor.getBody().innerHTML = '<table><tr><td>X</td></tr></table>';
    rng = editor.dom.createRng();
    rng.setStartBefore(editor.getBody().firstChild);
    rng.setEndAfter(editor.getBody().lastChild);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, 'BODY');
    LegacyUnit.equal(rng.startOffset, 0);
    LegacyUnit.equal(rng.endContainer.nodeName, 'BODY');
    LegacyUnit.equal(rng.endOffset, 1);
  });

  suite.test('normalize after paragraph', function (editor) {
    let rng;

    editor.getBody().innerHTML = '<p>a</p>';
    rng = editor.dom.createRng();
    rng.setStartAfter(editor.getBody().firstChild);
    rng.setEndAfter(editor.getBody().lastChild);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, '#text');
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equal(rng.endContainer.nodeName, '#text');
    LegacyUnit.equal(rng.endOffset, 1);
  });

  suite.test('normalize caret after trailing BR', function (editor) {
    let rng;

    editor.getBody().innerHTML = '<p>a<br /></p>';
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild, 2);
    rng.setEnd(editor.getBody().firstChild, 2);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, '#text', 'startContainer node name');
    LegacyUnit.equal(rng.startOffset, 1, 'startContainer offset');
    LegacyUnit.equal(rng.endContainer.nodeName, '#text', 'endContainer node name');
    LegacyUnit.equal(rng.endOffset, 1, 'endOffset offset');
  });

  suite.test('normalize caret after bogus block BR', function (editor) {
    let rng;

    editor.setContent('<p><br /></p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild, 1);
    rng.setEnd(editor.getBody().firstChild, 1);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, 'P', 'startContainer node name');
    LegacyUnit.equal(rng.startOffset, 0, 'startContainer offset');
    LegacyUnit.equal(rng.endContainer.nodeName, 'P', 'endContainer node name');
    LegacyUnit.equal(rng.endOffset, 0, 'endOffset offset');
  });

  suite.test('normalize after table should not move', function (editor) {
    let rng;

    // if (tinymce.isOpera || tinymce.isIE) {
    //  ok(true, "Skipped on Opera/IE since Opera doesn't let you to set the range to document and IE will steal focus.");
    //  return;
    // }

    editor.setContent('a<table><tr><td>b</td></tr></table>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.endContainer, editor.getBody());
    LegacyUnit.equal(rng.endOffset, 1);
  });

  /*
    suite.test('normalize caret after last BR in block', function(editor) {
      var rng;

      editor.setContent('<p><br /><br /></p>');
      rng = editor.dom.createRng();
      rng.setStart(editor.getBody().firstChild, 2);
      rng.setEnd(editor.getBody().firstChild, 2);
      editor.selection.setRng(rng);
      editor.selection.normalize();

      rng = editor.selection.getRng();
      LegacyUnit.equal(rng.startContainer.nodeName, 'P', 'startContainer node name');
      LegacyUnit.equal(rng.startOffset, 1, 'startContainer offset');
      LegacyUnit.equal(rng.endContainer.nodeName, 'P', 'endContainer node name');
      LegacyUnit.equal(rng.endOffset, 1, 'endOffset offset');
    });
  */

  suite.test('normalize caret after double BR', function (editor) {
    let rng;

    editor.setContent('<p>a<br /><br /></p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild, 3);
    rng.setEnd(editor.getBody().firstChild, 3);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, 'P', 'startContainer node name');
    LegacyUnit.equal(rng.startOffset, 3, 'startContainer offset');
    LegacyUnit.equal(rng.endContainer.nodeName, 'P', 'endContainer node name');
    LegacyUnit.equal(rng.endOffset, 3, 'endOffset offset');
  });

  suite.test('custom elements', function (editor) {
    let rng;

    editor.setContent('<custom1>test</custom1><custom2>test</custom2>');

    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 2);
    editor.selection.setRng(rng);

    LegacyUnit.equal(editor.selection.getContent(), '<custom1>test</custom1><custom2>test</custom2>');
  });

  suite.test('selectorChanged', function (editor) {
    let newState, newArgs;

    editor.selection.selectorChanged('a[href]', function (state, args) {
      newState = state;
      newArgs = args;
    });

    editor.getBody().innerHTML = '<p><a href="#">text</a></p>';
    LegacyUnit.setSelection(editor, 'a', 0, 'a', 4);
    editor.nodeChanged();

    LegacyUnit.equal(newState, true);
    LegacyUnit.equal(newArgs.selector, 'a[href]');
    LegacyUnit.equalDom(newArgs.node, editor.getBody().firstChild.firstChild);
    LegacyUnit.equal(newArgs.parents.length, 2);

    editor.getBody().innerHTML = '<p>text</p>';
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);
    editor.nodeChanged();
    LegacyUnit.equal(newArgs.selector, 'a[href]');
    LegacyUnit.equalDom(newArgs.node, editor.getBody().firstChild);
    LegacyUnit.equal(newArgs.parents.length, 1);
  });

  suite.test('selectorChangedWithUnbind', function (editor) {
    let newState, newArgs, calls = 0;

    const { unbind } = editor.selection.selectorChangedWithUnbind('a[href]', function (state, args) {
      newState = state;
      newArgs = args;
      calls++;
    });

    editor.getBody().innerHTML = '<p><a href="#">text</a></p>';
    LegacyUnit.setSelection(editor, 'a', 0, 'a', 4);
    editor.nodeChanged();

    LegacyUnit.equal(newState, true);
    LegacyUnit.equal(newArgs.selector, 'a[href]');
    LegacyUnit.equalDom(newArgs.node, editor.getBody().firstChild.firstChild);
    LegacyUnit.equal(newArgs.parents.length, 2);
    LegacyUnit.equal(calls, 1, 'selectorChangedWithUnbind callback is only called once');

    unbind();

    editor.getBody().innerHTML = '<p>text</p>';
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);
    editor.nodeChanged();

    LegacyUnit.equal(calls, 1, 'selectorChangedWithUnbind callback is only called once');
  });

  suite.test('setRng', function (editor) {
    let rng = editor.dom.createRng();

    editor.setContent('<p>x</p>');
    rng.setStart(editor.$('p')[0].firstChild, 0);
    rng.setEnd(editor.$('p')[0].firstChild, 1);

    editor.selection.setRng(rng);
    editor.selection.setRng(null);

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, '#text');
    LegacyUnit.equal(rng.startOffset, 0);
    LegacyUnit.equal(rng.endContainer.nodeName, '#text');
    LegacyUnit.equal(rng.endOffset, 1);
  });

  suite.test('setRng invalid range', function (editor) {
    let rng = editor.dom.createRng();

    editor.setContent('<p>x</p>');

    rng.setStart(editor.$('p')[0].firstChild, 0);
    rng.setEnd(editor.$('p')[0].firstChild, 1);
    editor.selection.setRng(rng);

    const tmpNode = document.createTextNode('y');
    const invalidRng = rng.cloneRange();
    invalidRng.setStart(tmpNode, 0);
    invalidRng.setEnd(tmpNode, 0);
    editor.selection.setRng(invalidRng);

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, '#text');
    LegacyUnit.equal((rng.startContainer as Text).data, 'x');
    LegacyUnit.equal(rng.startOffset, 0);
    LegacyUnit.equal(rng.endContainer.nodeName, '#text');
    LegacyUnit.equal(rng.endOffset, 1);
  });

  suite.test('setRng invalid range removed parent context', function (editor) {
    editor.setContent('<p><strong><em>x</em></strong></p>');
    const textNode = editor.$('em')[0].firstChild;

    editor.setContent('');

    const rng = editor.dom.createRng();
    rng.setStart(textNode, 0);
    rng.setEnd(textNode, 1);
    editor.selection.setRng(rng);

    const curRng = editor.selection.getRng();
    LegacyUnit.equal(curRng.startContainer.nodeName, 'BODY');
    LegacyUnit.equal(curRng.startOffset, 0);
    LegacyUnit.equal(curRng.endContainer.nodeName, 'BODY');
    LegacyUnit.equal(curRng.endOffset, 0);
  });
/*
  // TODO: Re-implement this test as a separate test if needed by destroying an editor etc
  suite.test('getRng should return null if win.document is not defined or null', function (editor) {
    const win = editor.selection.win;
    let rng = editor.dom.createRng();

    editor.setContent('<p>x</p>');

    rng.setStart(editor.$('p')[0].firstChild, 0);
    rng.setEnd(editor.$('p')[0].firstChild, 1);

    editor.selection.setRng(rng);
    editor.selection.setRng(null);

    editor.selection.win = {};
    rng = editor.selection.getRng();
    LegacyUnit.equal(rng, null);

    editor.selection.win = { document: null };
    rng = editor.selection.getRng();
    LegacyUnit.equal(rng, null);

    editor.selection.win = win;
  });
*/
  suite.test('image selection webkit bug', function (editor) {
    const testImageSelection = function (inputHtml, expectedContainerName, expectedOffset) {
      editor.setContent(inputHtml);
      editor.selection.select(editor.dom.select('img')[0]);

      const rng = editor.selection.getRng();
      LegacyUnit.equal(rng.startContainer.nodeName, 'P');
      LegacyUnit.equal(rng.startOffset, expectedOffset);
      LegacyUnit.equal(rng.startContainer.nodeName, 'P');
      LegacyUnit.equal(rng.endOffset, expectedOffset + 1);
      LegacyUnit.equal(editor.selection.getNode().nodeName, 'IMG');
      LegacyUnit.equal(editor.selection.getStart().nodeName, 'IMG');
      LegacyUnit.equal(editor.selection.getEnd().nodeName, 'IMG');

      const nativeRng = editor.selection.getSel().getRangeAt(0);
      LegacyUnit.equal(nativeRng.startContainer.nodeName, 'P');
      LegacyUnit.equal(nativeRng.startOffset, expectedOffset);
      LegacyUnit.equal(nativeRng.startContainer.nodeName, 'P');
      LegacyUnit.equal(nativeRng.endOffset, expectedOffset + 1);
    };

    testImageSelection('<p><img src="#"></p>', 'P', 0);
    testImageSelection('<p><img src="#">abc</p>', 'P', 0);
    testImageSelection('<p>abc<img src="#"></p>', 'P', 1);
    testImageSelection('<p>abc<img src="#">def</p>', 'P', 1);
    testImageSelection('<p><img style="float: right;" src="#"></p>', 'P', 0);
    testImageSelection('<p><img style="float: right;" src="#">abc</p>', 'P', 0);
    testImageSelection('<p>abc<img style="float: right;" src="#"></p>', 'P', 1);
    testImageSelection('<p>abc<img style="float: right;" src="#">def</p>', 'P', 1);
    testImageSelection('<p><img style="float: left;" src="#"></p>', 'P', 0);
    testImageSelection('<p><img style="float: left;" src="#">abc</p>', 'P', 0);
    testImageSelection('<p>abc<img style="float: left;" src="#"></p>', 'P', 1);
    testImageSelection('<p>abc<img style="float: left;" src="#">def</p>', 'P', 1);
    testImageSelection('<p dir="rtl"><img style="float: right;" src="#"></p>', 'P', 0);
    testImageSelection('<p dir="rtl"><img style="float: right;" src="#">abc</p>', 'P', 0);
    testImageSelection('<p dir="rtl">abc<img style="float: right;" src="#"></p>', 'P', 1);
    testImageSelection('<p dir="rtl">abc<img style="float: right;" src="#">def</p>', 'P', 1);
    testImageSelection('<p dir="rtl"><img style="float: left;" src="#"></p>', 'P', 0);
    testImageSelection('<p dir="rtl"><img style="float: left;" src="#">abc</p>', 'P', 0);
    testImageSelection('<p dir="rtl">abc<img style="float: left;" src="#"></p>', 'P', 1);
    testImageSelection('<p dir="rtl">abc<img style="float: left;" src="#">def</p>', 'P', 1);
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    forced_root_block: '',
    entities: 'raw',
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,margin,' +
        'margin-top,margin-right,margin-bottom,margin-left,display'
    },
    custom_elements: 'custom1,~custom2',
    extended_valid_elements: 'custom1,custom2',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
