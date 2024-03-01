import { context, describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { GetContentEvent, SetContentEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { Bookmark } from 'tinymce/core/bookmark/BookmarkTypes';
import * as CaretContainer from 'tinymce/core/caret/CaretContainer';
import * as Zwsp from 'tinymce/core/text/Zwsp';

describe('browser.tinymce.core.dom.SelectionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    entities: 'raw',
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,margin,' +
        'margin-top,margin-right,margin-bottom,margin-left,display'
    },
    custom_elements: 'custom1,~custom2',
    extended_valid_elements: 'custom1,custom2',
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  it('getContent', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();
    let eventObj: EditorEvent<GetContentEvent> | undefined;

    // Get selected contents
    editor.setContent('<p>text</p>');
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
    const handler = (event: EditorEvent<GetContentEvent>) => {
      eventObj = event;
    };

    editor.on('GetContent', handler);
    editor.setContent('<p>text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.selection.getContent();
    LegacyUnit.equal(eventObj?.content, '<p>text</p>', 'Get selected contents, onGetContent event');
    editor.off('GetContent', handler);
  });

  it('getContent contextual', () => {
    const editor = hook.editor();
    editor.setContent('<p><em>text</em></p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('em')[0].firstChild as Text, 1);
    rng.setEnd(editor.dom.select('em')[0].firstChild as Text, 3);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.selection.getContent({ contextual: true }), '<em>ex</em>', 'Get selected contents');
  });

  it('getContent of zwsp', () => {
    const editor = hook.editor();
    editor.setContent('<p>a' + Zwsp.ZWSP + 'b</p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.selection.getContent(), '<p>ab</p>', 'Get selected contents');
    LegacyUnit.equal(editor.selection.getContent({ format: 'text' }), 'ab', 'Get selected contents');
  });

  it('setContent', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();
    let eventObj: EditorEvent<SetContentEvent> | undefined;

    // Set contents at selection
    editor.setContent('<p>text</p>');
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.selection.setContent('<div>test</div>');
    LegacyUnit.equal(editor.getContent(), '<div>test</div>', 'Set contents at selection');

    // Insert XSS at selection
    editor.setContent('<p>text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.selection.setContent('<img src="a" onerror="alert(1)" />');
    LegacyUnit.equal(editor.getContent(), '<p><img src="a"></p>', 'Set XSS at selection');

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
    rng.setStart(editor.getBody().firstChild?.firstChild as Text, 'before'.length);
    rng.setEnd(editor.getBody().firstChild?.firstChild as Text, 'before'.length);
    editor.selection.setRng(rng);
    editor.selection.setContent('<br />');
    LegacyUnit.equal(editor.getContent(), '<p>before<br>after</p>', 'Set contents at selection (inside paragraph)');

    // Check the caret is left in the correct position.
    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().firstChild as HTMLParagraphElement, 'Selection start container');
    LegacyUnit.equal(rng.startOffset, 2, 'Selection start offset');
    LegacyUnit.equalDom(rng.endContainer, editor.getBody().firstChild as HTMLParagraphElement, 'Selection end container');
    LegacyUnit.equal(rng.endOffset, 2, 'Selection end offset');

    editor.setContent('<p>text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 0);
    editor.selection.setRng(rng);
    editor.selection.setContent('');
    LegacyUnit.equal(editor.getContent(), '<p>text</p>', 'Set contents to empty at selection (collapsed)');
    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.getBody(), 'Selection start container');
    LegacyUnit.equal(rng.startOffset, 0, 'Selection start offset');
    LegacyUnit.equalDom(rng.endContainer, editor.getBody(), 'Selection end container');
    LegacyUnit.equal(rng.endOffset, 0, 'Selection end offset');

    // Set selected contents, onSetContent event
    const handler = (event: EditorEvent<SetContentEvent>) => {
      eventObj = event;
    };

    editor.on('SetContent', handler);
    editor.setContent('<p>text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    editor.selection.setContent('<div>text</div>');
    LegacyUnit.equal(eventObj?.content, '<div>text</div>', 'Set selected contents, onSetContent event');
    editor.off('SetContent', handler);
  });

  it('getStart/getEnd', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    // Selected contents
    editor.setContent('<p id="a">text</p><p id="b">text</p>');
    rng.setStart(editor.getBody().firstChild?.firstChild as Text, 0);
    rng.setEnd(editor.getBody().lastChild?.firstChild as Text, 0);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.selection.getStart().id, 'a', 'Selected contents (getStart)');
    LegacyUnit.equal(editor.selection.getEnd().id, 'b', 'Selected contents (getEnd)');

    // Selected contents (collapsed)
    editor.setContent('<p id="a">text</p>\n<p id="b">text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild?.firstChild as Text, 0);
    rng.setEnd(editor.getBody().firstChild?.firstChild as Text, 0);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.selection.getStart().id, 'a', 'Selected contents (getStart, collapsed)');
    LegacyUnit.equal(editor.selection.getEnd().id, 'a', 'Selected contents (getEnd, collapsed)');
  });

  it('getSelectedBlocks with collapsed selection between elements', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p><p>c</p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 1);
    rng.setEnd(editor.getBody(), 1);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.selection.getSelectedBlocks().length, 0, 'should return empty array');
  });

  it('getStart/getEnd on comment should return parent element', () => {
    const editor = hook.editor();
    editor.setContent('<p><!-- x --></p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild as HTMLParagraphElement, 0);
    rng.setEnd(editor.getBody().firstChild as HTMLParagraphElement, 0);
    editor.selection.setRng(rng);

    LegacyUnit.equal(editor.selection.getStart().nodeName, 'P', 'Node name should be paragraph');
    LegacyUnit.equal(editor.selection.getStart(true).nodeName, 'P', 'Node name should be paragraph');
    LegacyUnit.equal(editor.selection.getEnd().nodeName, 'P', 'Node name should be paragraph');
    LegacyUnit.equal(editor.selection.getEnd(true).nodeName, 'P', 'Node name should be paragraph');
  });

  it('getBookmark/setBookmark (persistent)', () => {
    const editor = hook.editor();
    let bookmark: Bookmark;
    let rng = editor.dom.createRng();

    // Get persistent bookmark simple text selection
    editor.setContent('<p>text</p>');
    rng.setStart(editor.getBody().firstChild?.firstChild as Text, 1);
    rng.setEnd(editor.getBody().firstChild?.firstChild as Text, 3);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark();
    LegacyUnit.equal(editor.getContent(), '<p>text</p>', 'Editor contents (text)');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), 'ex', 'Selected contents (text)');

    // Get persistent bookmark multiple elements text selection
    editor.setContent('<p>text</p>\n<p>text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild?.firstChild as Text, 1);
    rng.setEnd(editor.getBody().lastChild?.firstChild as Text, 3);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark();
    LegacyUnit.equal(editor.getContent(), '<p>text</p>\n<p>text</p>', 'Editor contents (elements)');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), '<p>ext</p>\n<p>tex</p>', 'Selected contents (elements)');
  });

  it('getBookmark/setBookmark (simple)', () => {
    const editor = hook.editor();
    let bookmark: Bookmark;
    let rng = editor.dom.createRng();

    // Get persistent bookmark simple text selection
    editor.setContent('<p>text</p>');
    rng.setStart(editor.getBody().firstChild?.firstChild as Text, 1);
    rng.setEnd(editor.getBody().firstChild?.firstChild as Text, 3);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(1);
    LegacyUnit.equal(editor.getContent(), '<p>text</p>', 'Editor contents (text)');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), 'ex', 'Selected contents (text)');

    // Get persistent bookmark multiple elements text selection
    editor.setContent('<p>text</p>\n<p>text</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild?.firstChild as Text, 1);
    rng.setEnd(editor.getBody().lastChild?.firstChild as Text, 3);
    editor.selection.setRng(rng);
    bookmark = editor.selection.getBookmark(1);
    LegacyUnit.equal(editor.getContent(), '<p>text</p>\n<p>text</p>', 'Editor contents (elements)');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), '<p>ext</p>\n<p>tex</p>', 'Selected contents (elements)');
  });

  it('getBookmark/setBookmark (nonintrusive) - simple text selection', () => {
    const editor = hook.editor();
    editor.setContent('<p>text</p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild?.firstChild as Text, 1);
    rng.setEnd(editor.getBody().firstChild?.firstChild as Text, 3);
    editor.selection.setRng(rng);
    const bookmark = editor.selection.getBookmark(2);
    LegacyUnit.equal(editor.getContent(), '<p>text</p>', 'Editor contents (text)');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), 'ex', 'Selected contents (text)');
  });

  it('getBookmark/setBookmark (nonintrusive) - Get non intrusive bookmark simple element selection', () => {
    const editor = hook.editor();
    // Get non intrusive bookmark simple element selection
    editor.setContent('<p>text<em>a<strong>b</strong>c</em></p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('em')[0], 1);
    rng.setEnd(editor.dom.select('em')[0], 2);
    editor.selection.setRng(rng);
    const bookmark = editor.selection.getBookmark(2);
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), '<strong>b</strong>', 'Selected contents (element)');
  });

  it('getBookmark/setBookmark (nonintrusive) - Get non intrusive bookmark multiple elements text selection', () => {
    const editor = hook.editor();
    // Get non intrusive bookmark multiple elements text selection
    editor.setContent('<p>text</p>\n<p>text</p>');
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild?.firstChild as Text, 1);
    rng.setEnd(editor.getBody().lastChild?.firstChild as Text, 3);
    editor.selection.setRng(rng);
    const bookmark = editor.selection.getBookmark(2);
    LegacyUnit.equal(editor.getContent(), '<p>text</p>\n<p>text</p>', 'Editor contents (elements)');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), '<p>ext</p>\n<p>tex</p>', 'Selected contents (elements)');
  });

  it('getBookmark/setBookmark (nonintrusive)', () => {
    const editor = hook.editor();
    // Get non intrusive bookmark multiple elements text selection fragmented
    editor.setContent('<p>text</p><p>text</p>');
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('text'));
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild?.lastChild as Text, 1);
    rng.setEnd(editor.getBody().lastChild?.firstChild as Text, 3);
    editor.selection.setRng(rng);
    const bookmark = editor.selection.getBookmark(2);
    LegacyUnit.equal(editor.getContent(), '<p>textaaatext</p>\n<p>text</p>', 'Editor contents (fragmented, elements)');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), '<p>ext</p>\n<p>tex</p>', 'Selected contents (fragmented, elements)');
  });

  it('getBookmark/setBookmark (nonintrusive) - fragmentext text (normalized)', () => {
    const editor = hook.editor();
    // Get non intrusive bookmark multiple elements text selection fragmented
    editor.setContent('<p>text</p><p>text</p>');
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('text'));
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild?.lastChild as Text, 1);
    rng.setEnd(editor.getBody().lastChild?.firstChild as Text, 3);
    editor.selection.setRng(rng);
    const bookmark = editor.selection.getBookmark(2, true);
    editor.setContent(editor.getContent());
    LegacyUnit.equal(editor.getContent(), '<p>textaaatext</p>\n<p>text</p>', 'Editor contents (fragmented, elements)');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), '<p>ext</p>\n<p>tex</p>', 'Selected contents (fragmented, elements)');
  });

  it('getBookmark/setBookmark (nonintrusive) - fragmentext text with zwsp (normalized)', () => {
    const editor = hook.editor();
    // Get non intrusive bookmark multiple elements text selection fragmented
    editor.setContent('<p>text</p><p>text</p>');
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('a'));
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode(Zwsp.ZWSP));
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode(Zwsp.ZWSP));
    editor.dom.select('p')[0].appendChild(editor.dom.doc.createTextNode('text'));
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild?.lastChild as Text, 1);
    rng.setEnd(editor.getBody().lastChild?.firstChild as Text, 3);
    editor.selection.setRng(rng);
    const bookmark = editor.selection.getBookmark(2, true);
    editor.setContent(editor.getContent());
    LegacyUnit.equal(editor.getContent(), '<p>textatext</p>\n<p>text</p>', 'Editor contents (fragmented, elements)');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equal(editor.selection.getContent(), '<p>ext</p>\n<p>tex</p>', 'Selected contents (fragmented, elements)');
  });

  it('getBookmark/setBookmark (nonintrusive) - Get bookmark before image', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.setContent('<p><img src="about:blank" /></p>');
    rng.setStart(editor.getBody().firstChild as HTMLParagraphElement, 0);
    rng.setEnd(editor.getBody().firstChild as HTMLParagraphElement, 0);
    editor.selection.setRng(rng);
    const bookmark = editor.selection.getBookmark(2, true);
    editor.getBody().innerHTML = editor.getBody().innerHTML;
    editor.selection.moveToBookmark(bookmark);
    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().firstChild as HTMLParagraphElement);
    LegacyUnit.equal(rng.startOffset, 0);
    LegacyUnit.equalDom(rng.endContainer, editor.getBody().firstChild as HTMLParagraphElement);
    LegacyUnit.equal(rng.endOffset, 0);
  });

  it('getBookmark/setBookmark (nonintrusive) - Get bookmark before/after image', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.setContent('<p><img src="about:blank" /></p>');
    rng.setStart(editor.getBody().firstChild as HTMLParagraphElement, 0);
    rng.setEnd(editor.getBody().firstChild as HTMLParagraphElement, 1);
    editor.selection.setRng(rng);
    const bookmark = editor.selection.getBookmark(2, true);
    editor.getBody().innerHTML = editor.getBody().innerHTML;
    editor.selection.moveToBookmark(bookmark);
    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().firstChild as HTMLParagraphElement);
    LegacyUnit.equal(rng.startOffset, 0);
    LegacyUnit.equalDom(rng.endContainer, editor.getBody().firstChild as HTMLParagraphElement);
    LegacyUnit.equal(rng.endOffset, 1);
  });

  it('getBookmark/setBookmark (nonintrusive) - Get bookmark after image', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.setContent('<p><img src="about:blank" /></p>');
    rng.setStart(editor.getBody().firstChild as HTMLParagraphElement, 1);
    rng.setEnd(editor.getBody().firstChild as HTMLParagraphElement, 1);
    editor.selection.setRng(rng);
    const bookmark = editor.selection.getBookmark(2, true);
    editor.getBody().innerHTML = editor.getBody().innerHTML;
    editor.selection.moveToBookmark(bookmark);
    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().firstChild as HTMLParagraphElement);
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equalDom(rng.endContainer, editor.getBody().firstChild as HTMLParagraphElement);
    LegacyUnit.equal(rng.endOffset, 1);
  });

  it('getBookmark/setBookmark (nonintrusive) - Get bookmark before element', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.setContent('<p>abc<b>123</b></p>');
    rng.setStart(editor.getBody().firstChild as HTMLParagraphElement, 0);
    rng.setEnd(editor.getBody().firstChild as HTMLParagraphElement, 2);
    editor.selection.setRng(rng);
    const bookmark = editor.selection.getBookmark(2, true);
    editor.getBody().innerHTML = editor.getBody().innerHTML;
    editor.selection.moveToBookmark(bookmark);
    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().firstChild as HTMLParagraphElement);
    LegacyUnit.equal(rng.startOffset, 0);
    LegacyUnit.equalDom(rng.endContainer, editor.getBody().firstChild as HTMLParagraphElement);
    LegacyUnit.equal(rng.endOffset, 2);
  });

  it('getBookmark/setBookmark (nonintrusive) - Get bookmark after element', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    // Get bookmark after element
    editor.setContent('<p><b>123</b>abc</p>');
    rng.setStart(editor.getBody().lastChild as HTMLParagraphElement, 1);
    rng.setEnd(editor.getBody().lastChild as HTMLParagraphElement, 2);
    editor.selection.setRng(rng);
    const bookmark = editor.selection.getBookmark(2, true);
    editor.getBody().innerHTML = editor.getBody().innerHTML;
    editor.selection.moveToBookmark(bookmark);
    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().lastChild as HTMLParagraphElement);
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equalDom(rng.endContainer, editor.getBody().lastChild as HTMLParagraphElement);
    LegacyUnit.equal(rng.endOffset, 2);
  });

  it('getBookmark/setBookmark (nonintrusive) - Get bookmark inside element', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.setContent('<p>abc<b>123</b>abc</p>');
    rng.setStart(editor.getBody().firstChild?.childNodes[1].firstChild as Text, 1);
    rng.setEnd(editor.getBody().firstChild?.childNodes[1].firstChild as Text, 2);
    editor.selection.setRng(rng);
    const bookmark = editor.selection.getBookmark(2, true);
    editor.getBody().innerHTML = editor.getBody().innerHTML;
    editor.selection.moveToBookmark(bookmark);
    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().firstChild?.childNodes[1].firstChild as Text);
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equalDom(rng.endContainer, editor.getBody().firstChild?.childNodes[1].firstChild as Text);
    LegacyUnit.equal(rng.endOffset, 2);
  });

  it('getBookmark/setBookmark (nonintrusive) - Get bookmark inside root text', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.setContent('<p>abc</p>');
    rng.setStart(editor.getBody().firstChild?.firstChild as Text, 1);
    rng.setEnd(editor.getBody().firstChild?.firstChild as Text, 2);
    editor.selection.setRng(rng);
    const bookmark = editor.selection.getBookmark(2, true);
    editor.getBody().innerHTML = editor.getBody().innerHTML;
    editor.selection.moveToBookmark(bookmark);
    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().firstChild?.firstChild as Text);
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equalDom(rng.endContainer, editor.getBody().firstChild?.firstChild as Text);
    LegacyUnit.equal(rng.endOffset, 2);
  });

  it('getBookmark/setBookmark (nonintrusive) - Get bookmark inside complex html', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>123<p>123</p><p>123<b>123</b><table><tr><td>abc</td></tr></table></p>');
    editor.execCommand('SelectAll');
    LegacyUnit.setSelection(editor, 'td', 1, 'td', 2);
    const bookmark = editor.selection.getBookmark(2, true);
    editor.getBody().innerHTML = editor.getBody().innerHTML;
    editor.selection.moveToBookmark(bookmark);
    const rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.startContainer, editor.dom.select('td')[0].firstChild as Text);
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equalDom(rng.endContainer, editor.dom.select('td')[0].firstChild as Text);
    LegacyUnit.equal(rng.endOffset, 2);
  });

  it('getBookmark/setBookmark on cE=false', () => {
    const editor = hook.editor();
    editor.setContent('<p>text<span contentEditable="false">1</span></p>');
    editor.selection.select(editor.dom.select('span')[0]);
    const bookmark = editor.selection.getBookmark(2);
    editor.setContent('<p>text<span contentEditable="false">1</span></p>');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equalDom(editor.selection.getNode(), editor.dom.select('span')[0]);
  });

  it('getBookmark/setBookmark before cE=false', () => {
    const editor = hook.editor();
    editor.setContent('<p><input><span contentEditable="false">1</span></p>');
    CaretContainer.insertInline(editor.dom.select('span')[0], true);
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[0].previousSibling as HTMLInputElement, 0);
    rng.setEnd(editor.dom.select('span')[0].previousSibling as HTMLInputElement, 0);
    editor.selection.setRng(rng);
    const bookmark = editor.selection.getBookmark(2);
    editor.setContent('<p><input><span contentEditable="false">1</span></p>');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equalDom(editor.selection.getNode(), editor.dom.select('span')[0]);
  });

  it('getBookmark/setBookmark before cE=false block', () => {
    const editor = hook.editor();
    editor.setContent('<p contentEditable="false">1</p>');
    CaretContainer.insertBlock('p', editor.dom.select('p')[0], true);
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0], 0);
    rng.setEnd(editor.dom.select('p')[0], 0);
    editor.selection.setRng(rng);
    const bookmark = editor.selection.getBookmark(2);
    editor.setContent('<p contentEditable="false">1</p>');
    editor.selection.moveToBookmark(bookmark);
    LegacyUnit.equalDom(editor.selection.getNode(), editor.dom.select('p')[0]);
  });

  it('select empty TD', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<table><tr><td><br></td></tr></table>';
    editor.selection.select(editor.dom.select('td')[0], true);
    LegacyUnit.equal(editor.selection.getRng().startContainer.nodeName, 'TD');
  });

  it('select first p', () => {
    const editor = hook.editor();
    editor.setContent('<p>text1</p><p>text2</p>');
    editor.selection.select(editor.dom.select('p')[0]);
    LegacyUnit.equal(editor.selection.getContent(), '<p>text1</p>', 'Select simple element, content');
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'P', 'Select simple element, nodeName');
  });

  it('select table', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td>text1</td></tr></tbody></table>');
    editor.selection.select(editor.dom.select('table')[0]);
    LegacyUnit.equal(
      editor.selection.getContent(),
      '<table>\n<tbody>\n<tr>\n<td>text1</td>\n</tr>\n</tbody>\n</table>',
      'Select complex element, content'
    );
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'TABLE', 'Select complex element, nodeName');
  });

  it('select table text 1', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td id="a">text1</td><td id="b">text2</td></tr></tbody></table>');
    editor.selection.select(editor.dom.select('table')[0], true);
    LegacyUnit.equal(editor.selection.getStart().id, 'a', 'Expand to text content 1 (start)');
    LegacyUnit.equal(editor.selection.getEnd().id, 'b', 'Expand to text content 1 (end)');
  });

  it('select table text 2', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td id="a"><br /></td><td id="b"><br /></td></tr></tbody></table>');
    editor.selection.select(editor.dom.select('table')[0], true);
    LegacyUnit.equal(editor.dom.getParent(editor.selection.getStart(), 'td')?.id, 'a', 'Expand to text content 2 (start)');
    LegacyUnit.equal(editor.dom.getParent(editor.selection.getEnd(), 'td')?.id, 'b', 'Expand to text content 2 (end)');
  });

  it('getNode', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.setContent('<p id="p1"><span id="s1">span1</span> word <span id="s2">span2</span> word <span id="s3">span3</span></p>');
    const p1 = editor.dom.get('p1') as HTMLParagraphElement;
    const s1 = editor.dom.get('s1') as HTMLSpanElement;
    const s2 = editor.dom.get('s2') as HTMLSpanElement;
    const s3 = editor.dom.get('s3') as HTMLSpanElement;

    rng.setStart(s1.firstChild as Text, 0);
    rng.setEnd(s1.nextSibling as Text, 0);
    editor.selection.setRng(rng);
    LegacyUnit.equalDom(
      editor.selection.getNode(),
      s1,
      'Detect selection ends immediately after node at start of paragraph.'
    );

    rng = editor.dom.createRng();
    rng.setStart(s2.previousSibling as Text, (s2.previousSibling as Text).length);
    rng.setEnd(s2.nextSibling as Text, 0);
    editor.selection.setRng(rng);
    LegacyUnit.equalDom(
      editor.selection.getNode(),
      s2,
      'Detect selection immediately surrounds node in middle of paragraph.'
    );

    rng = editor.dom.createRng();
    rng.setStart(s3.previousSibling as Text, (s3.previousSibling as Text).length);
    rng.setEnd(s3.lastChild as Text, (s3.lastChild as Text).length);
    editor.selection.setRng(rng);
    LegacyUnit.equalDom(
      editor.selection.getNode(),
      s3,
      'Detect selection starts immediately before node at end of paragraph.'
    );

    rng = editor.dom.createRng();
    rng.setStart(s2.previousSibling as Text, (s2.previousSibling as Text).length);
    rng.setEnd(s3.lastChild as Text, (s3.lastChild as Text).length);
    editor.selection.setRng(rng);
    LegacyUnit.equalDom(
      editor.selection.getNode(),
      p1,
      'Detect selection wrapping multiple nodes does not collapse.'
    );
  });

  it('normalize to text node from document', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.setContent('<p>text</p>');
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

  it('normalize to br from document', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.setContent('<p><br /></p>');
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

  it('normalize with contentEditable:false element', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.setContent('<p>a<b contentEditable="false">b</b>c</p>');
    rng.setStart(editor.getBody().firstChild?.lastChild as Text, 0);
    rng.setEnd(editor.getBody().firstChild?.lastChild as Text, 0);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.collapsed, true);
    LegacyUnit.equal(CaretContainer.isCaretContainer(rng.startContainer), true);
  });

  it('normalize with contentEditable:false parent and contentEditable:true child element', () => {
    const editor = hook.editor();
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

  it('normalize to text node from body', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.setContent('<p>text</p>');
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

  it('normalize to br from body', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.setContent('<p><br /></p>');
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

  it('normalize ignore img', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<img src="about:blank " />';
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

  it('normalize to before/after img', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<p><img src="about:blank " /></p>';
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

  it('normalize to before/after pre', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<pre>a<pre>';
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

  it('normalize to text node inside P', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<p>abc</p>';
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

  it('normalize lean left if at the start of text node', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p><b>a</b><i>b</i></p>';
    LegacyUnit.setSelection(editor, 'i', 0);
    editor.selection.normalize();

    const rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, '#text', 'startContainer node name');
    LegacyUnit.equal(rng.startContainer.parentNode?.nodeName, 'B');
    LegacyUnit.equal(rng.startOffset, 1, 'startContainer offset');
    LegacyUnit.equal(rng.endContainer.nodeName, '#text');
    LegacyUnit.equal(rng.endContainer.parentNode?.nodeName, 'B');
    LegacyUnit.equal(rng.endOffset, 1, 'endOffset offset');
  });

  it('normalize lean start to the right if at end of text node', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p><b>a</b><i>b</i></p>';
    LegacyUnit.setSelection(editor, 'b', 1, 'i', 1);
    editor.selection.normalize();

    const rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, '#text', 'startContainer node name');
    LegacyUnit.equal(rng.startContainer.parentNode?.nodeName, 'I');
    LegacyUnit.equal(rng.startOffset, 0, 'startContainer offset');
    LegacyUnit.equal(rng.endContainer.nodeName, '#text');
    LegacyUnit.equal(rng.endContainer.parentNode?.nodeName, 'I');
    LegacyUnit.equal(rng.endOffset, 1, 'endOffset offset');
  });

  it('normalize lean left but break before br', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>a<br><b>b</b></p>';
    LegacyUnit.setSelection(editor, 'b', 0);
    editor.selection.normalize();

    const rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeValue, 'b');
    LegacyUnit.equal(rng.startOffset, 0);
  });

  it('normalize lean left but break before img', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>a<img><b>b</b></p>';
    LegacyUnit.setSelection(editor, 'b', 0);
    editor.selection.normalize();

    const rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeValue, 'b');
    LegacyUnit.equal(rng.startOffset, 0);
  });

  it(`normalize lean left but don't walk out the parent block`, () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>a</p><p><b>b</b></p>';
    LegacyUnit.setSelection(editor, 'b', 0);
    editor.selection.normalize();

    const rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeValue, 'b');
    LegacyUnit.equal(rng.startOffset, 0);
  });

  it('normalize lean left into empty inline elements when caret is before br', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<p><i><b></b></i><br /></p>';
    rng.setStartBefore(editor.getBody().firstChild?.lastChild as HTMLBRElement);
    rng.setEndBefore(editor.getBody().firstChild?.lastChild as HTMLBRElement);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, 'B');
    LegacyUnit.equal(rng.startOffset, 0);
  });

  it('normalize lean left from br into formatter caret container', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<p><span id="_mce_caret">' + Zwsp.ZWSP + '</span><br /></p>';
    rng.setStartBefore(editor.getBody().firstChild?.lastChild as HTMLBRElement);
    rng.setEndBefore(editor.getBody().firstChild?.lastChild as HTMLBRElement);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeType, 3);
    LegacyUnit.equal(rng.startOffset, 1);
  });

  it(`normalize doesn't lean left into empty inline elements if there is a br element after caret`, () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<p><i><b></b></i><br /><br /></p>';
    rng.setStartBefore(editor.getBody().firstChild?.lastChild as HTMLBRElement);
    rng.setEndBefore(editor.getBody().firstChild?.lastChild as HTMLBRElement);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, 'P');
    LegacyUnit.equal(rng.startOffset, 2);
  });

  it(`normalize doesn't lean left into empty inline elements if there is a br element before caret`, () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<p><i><b><br /></b></i><br /></p>';
    rng.setStartBefore(editor.getBody().firstChild?.lastChild as HTMLBRElement);
    rng.setEndBefore(editor.getBody().firstChild?.lastChild as HTMLBRElement);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, 'P');
    LegacyUnit.equal(rng.startOffset, 1);
  });

  it(`normalize doesn't move start/end if it's before/after table`, () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<table><tr><td>X</td></tr></table>';
    rng.setStartBefore(editor.getBody().firstChild as HTMLTableElement);
    rng.setEndAfter(editor.getBody().lastChild as HTMLTableElement);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, 'BODY');
    LegacyUnit.equal(rng.startOffset, 0);
    LegacyUnit.equal(rng.endContainer.nodeName, 'BODY');
    LegacyUnit.equal(rng.endOffset, 1);
  });

  it('normalize after paragraph', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<p>a</p>';
    rng.setStartAfter(editor.getBody().firstChild as HTMLParagraphElement);
    rng.setEndAfter(editor.getBody().lastChild as HTMLParagraphElement);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, '#text');
    LegacyUnit.equal(rng.startOffset, 1);
    LegacyUnit.equal(rng.endContainer.nodeName, '#text');
    LegacyUnit.equal(rng.endOffset, 1);
  });

  it('normalize caret after trailing BR', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<p>a<br /></p>';
    rng.setStart(editor.getBody().firstChild as HTMLParagraphElement, 2);
    rng.setEnd(editor.getBody().firstChild as HTMLParagraphElement, 2);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, '#text', 'startContainer node name');
    LegacyUnit.equal(rng.startOffset, 1, 'startContainer offset');
    LegacyUnit.equal(rng.endContainer.nodeName, '#text', 'endContainer node name');
    LegacyUnit.equal(rng.endOffset, 1, 'endOffset offset');
  });

  it('normalize caret after bogus block BR', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.setContent('<p><br /></p>');
    rng.setStart(editor.getBody().firstChild as HTMLParagraphElement, 1);
    rng.setEnd(editor.getBody().firstChild as HTMLParagraphElement, 1);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, 'P', 'startContainer node name');
    LegacyUnit.equal(rng.startOffset, 0, 'startContainer offset');
    LegacyUnit.equal(rng.endContainer.nodeName, 'P', 'endContainer node name');
    LegacyUnit.equal(rng.endOffset, 0, 'endOffset offset');
  });

  it('normalize after table should not move', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.setContent('<p>a</p><table><tr><td>b</td></tr></table>');
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 2);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equalDom(rng.endContainer, editor.getBody());
    LegacyUnit.equal(rng.endOffset, 2);
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

  it('normalize caret after double BR', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.setContent('<p>a<br /><br /></p>');
    rng.setStart(editor.getBody().firstChild as HTMLParagraphElement, 3);
    rng.setEnd(editor.getBody().firstChild as HTMLParagraphElement, 3);
    editor.selection.setRng(rng);
    editor.selection.normalize();

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, 'P', 'startContainer node name');
    LegacyUnit.equal(rng.startOffset, 3, 'startContainer offset');
    LegacyUnit.equal(rng.endContainer.nodeName, 'P', 'endContainer node name');
    LegacyUnit.equal(rng.endOffset, 3, 'endOffset offset');
  });

  it('custom elements', () => {
    const editor = hook.editor();
    editor.setContent('<custom1>test</custom1><custom2>test</custom2>');

    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody(), 0);
    rng.setEnd(editor.getBody(), 2);
    editor.selection.setRng(rng);

    // custom2 has been specified as an inline element in the editor config so expect it be wrapped in a p tag
    LegacyUnit.equal(editor.selection.getContent(), '<custom1>test</custom1>\n<p><custom2>test</custom2></p>');
  });

  it('selectorChanged', () => {
    const editor = hook.editor();
    let newState: boolean | undefined;
    let newArgs: { node: Node; selector: String; parents: Node[] } | undefined;

    editor.selection.selectorChanged('a[href]', (state, args) => {
      newState = state;
      newArgs = args;
    });

    editor.setContent('<p><a href="#">text</a></p>');
    LegacyUnit.setSelection(editor, 'a', 0, 'a', 4);
    editor.nodeChanged();

    assert.isTrue(newState);
    assert.equal(newArgs?.selector, 'a[href]');
    LegacyUnit.equalDom(newArgs?.node as Node, editor.getBody().firstChild?.firstChild as HTMLAnchorElement);
    assert.lengthOf(newArgs?.parents ?? [], 2);

    editor.setContent('<p>text</p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);
    editor.nodeChanged();
    assert.equal(newArgs?.selector, 'a[href]');
    LegacyUnit.equalDom(newArgs?.node as Node, editor.getBody().firstChild as HTMLParagraphElement);
    assert.lengthOf(newArgs?.parents ?? [], 1);
  });

  it('selectorChangedWithUnbind', () => {
    const editor = hook.editor();
    let newState: boolean | undefined;
    let newArgs: { node: Node; selector: String; parents: Node[] } | undefined;
    let calls = 0;

    const { unbind } = editor.selection.selectorChangedWithUnbind('a[href]', (state, args) => {
      newState = state;
      newArgs = args;
      calls++;
    });

    editor.setContent('<p><a href="#">text</a></p>');
    LegacyUnit.setSelection(editor, 'a', 0, 'a', 4);
    editor.nodeChanged();

    assert.isTrue(newState);
    assert.equal(newArgs?.selector, 'a[href]');
    LegacyUnit.equalDom(newArgs?.node as Node, editor.getBody().firstChild?.firstChild as HTMLAnchorElement);
    assert.lengthOf(newArgs?.parents ?? [], 2);
    assert.equal(calls, 1, 'selectorChangedWithUnbind callback is only called once');

    unbind();

    editor.setContent('<p>text</p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);
    editor.nodeChanged();

    assert.equal(calls, 1, 'selectorChangedWithUnbind callback is only called once');
  });

  it('TINY-3463: selectorChanged should setup the active state if already selected', () => {
    const editor = hook.editor();
    let newState: boolean | undefined;
    let newArgs: { node: Node; selector: String; parents: Node[] } | undefined;

    editor.setContent('<p>some <a href="#">text</a></p>');
    LegacyUnit.setSelection(editor, 'a', 0, 'a', 4);

    editor.selection.selectorChanged('a[href]', (state, args) => {
      newState = state;
      newArgs = args;
    });

    LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);
    editor.nodeChanged();

    assert.isFalse(newState);
    assert.equal(newArgs?.selector, 'a[href]');
    assert.lengthOf(newArgs?.parents ?? [], 1);
  });

  it('setRng', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.setContent('<p>x</p>');
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 1);

    editor.selection.setRng(rng);
    editor.selection.setRng(null as any);

    rng = editor.selection.getRng();
    LegacyUnit.equal(rng.startContainer.nodeName, '#text');
    LegacyUnit.equal(rng.startOffset, 0);
    LegacyUnit.equal(rng.endContainer.nodeName, '#text');
    LegacyUnit.equal(rng.endOffset, 1);
  });

  it('setRng invalid range', () => {
    const editor = hook.editor();
    let rng = editor.dom.createRng();

    editor.setContent('<p>x</p>');

    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 1);
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

  it('setRng invalid range removed parent context', () => {
    const editor = hook.editor();

    editor.setContent('<p><strong><em>x</em></strong></p>');
    const textNode = editor.dom.select('em')[0].firstChild as Text;

    editor.setContent('');

    const rng = editor.dom.createRng();
    rng.setStart(textNode, 0);
    rng.setEnd(textNode, 1);
    editor.selection.setRng(rng);

    const curRng = editor.selection.getRng();
    LegacyUnit.equal(curRng.startContainer.nodeName, 'P');
    LegacyUnit.equal(curRng.startOffset, 0);
    LegacyUnit.equal(curRng.endContainer.nodeName, 'P');
    LegacyUnit.equal(curRng.endOffset, 0);
  });

  it('TINY-9001: Expanding a word expands the selection', () => {
    const editor = hook.editor();
    editor.setContent('A BCDE F');
    TinySelections.setCursor(editor, [ 0, 0 ], 4);
    editor.selection.expand();
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 6);
  });

  it('TINY-9001: Expanding a word expands the selection, with a provided option', () => {
    const editor = hook.editor();
    editor.setContent('A BCDE F');
    TinySelections.setCursor(editor, [ 0, 0 ], 4);
    editor.selection.expand({ type: 'word' });
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 6);
  });

  it('TINY-9259: Should be able to get selection range on hidden editors', () => {
    const editor = hook.editor();

    editor.focus();
    editor.setContent('<p>ab</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.getContainer().style.display = 'none';
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 1);
    editor.getContainer().style.display = '';
  });

  /*
  // TODO: Re-implement this test as a separate test if needed by destroying an editor etc
  it('getRng should return null if win.document is not defined or null', () => {
    const editor = hook.editor();
    const win = editor.selection.win;
    let rng = editor.dom.createRng();

    editor.setContent('<p>x</p>');

    rng.setStart(editor.dom.select('p')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 1);

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
  it('image selection webkit bug', () => {
    const editor = hook.editor();
    const testImageSelection = (inputHtml: string, expectedContainerName: string, expectedOffset: number) => {
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

      const nativeSel = editor.selection.getSel() as Selection;
      const nativeRng = nativeSel.getRangeAt(0);
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

  context('isEditable', () => {
    const testIsEditableSelection = (testCase: { input: string; editableRoot?: boolean; spath: number[]; soffset: number; fpath: number[]; foffset: number; expected: boolean }) => () => {
      const editor = hook.editor();
      const editable = testCase.editableRoot ?? true;

      editor.getBody().contentEditable = editable ? 'true' : 'false';
      editor.setContent(testCase.input);
      TinySelections.setSelection(editor, testCase.spath, testCase.soffset, testCase.fpath, testCase.foffset);
      assert.equal(editor.selection.isEditable(), testCase.expected);
      editor.getBody().contentEditable = 'true';
    };

    const testIsEditableCaret = (testCase: { input: string; editableRoot?: boolean; path: number[]; offset: number; expected: boolean }) => testIsEditableSelection({
      input: testCase.input,
      editableRoot: testCase.editableRoot,
      spath: testCase.path,
      soffset: testCase.offset,
      fpath: testCase.path,
      foffset: testCase.offset,
      expected: testCase.expected
    });

    it('TINY-9462: isEditable on paragraph in editable root', testIsEditableCaret({
      input: '<p>abc</p>',
      path: [ 0, 0 ],
      offset: 0,
      expected: true
    }));

    it('TINY-9462: isEditable on paragraph in noneditable root', testIsEditableCaret({
      input: '<p>abc</p>',
      editableRoot: false,
      path: [ 0, 0 ],
      offset: 0,
      expected: false
    }));

    it('TINY-9462: isEditable on expanded range in editable root', testIsEditableSelection({
      input: '<p>ab</p><p>cd</p>',
      spath: [ 0, 0 ],
      soffset: 1,
      fpath: [ 1, 0 ],
      foffset: 1,
      expected: true
    }));

    it('TINY-9462: isEditable on expanded range in noneditable root', testIsEditableSelection({
      input: '<p>ab</p><p>cd</p>',
      editableRoot: false,
      spath: [ 0, 0 ],
      soffset: 1,
      fpath: [ 1, 0 ],
      foffset: 1,
      expected: false
    }));

    it('TINY-9462: isEditable on expanded range where start is noneditable', testIsEditableSelection({
      input: '<p contenteditable="false">ab</p><p>cd</p>',
      spath: [ 1, 0 ], // Shifted by one due to fake caret before P
      soffset: 1,
      fpath: [ 2, 0 ], // Shifted by one due to fake caret before P
      foffset: 1,
      expected: false
    }));

    it('TINY-9462: isEditable on expanded range where end is noneditable', testIsEditableSelection({
      input: '<p>ab</p><p contenteditable="false">cd</p>',
      spath: [ 0, 0 ],
      soffset: 1,
      fpath: [ 1, 0 ],
      foffset: 1,
      expected: false
    }));

    it('TINY-9477: isEditable on selected noneditable table cells should be true since parent is editable', testIsEditableSelection({
      input: '<table><tbody><tr><td contenteditable="false" data-mce-selected="1">a</td><td contenteditable="false" data-mce-selected="1">b</td></tr></tbody></table>',
      spath: [ 0, 0, 0, 0, 0 ],
      soffset: 0,
      fpath: [ 0, 0, 0, 1, 0 ],
      foffset: 1,
      expected: true
    }));
  });
});
