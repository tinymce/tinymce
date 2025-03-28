import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import * as HtmlUtils from '../../module/test/HtmlUtils';

describe('browser.tinymce.core.keyboard.EnterKeyTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    schema: 'html5',
    extended_valid_elements: 'div[id|style|contenteditable],span[id|style|contenteditable],#dt,#dd',
    entities: 'raw',
    indent: false,
    text_patterns: false, // TODO TINY-8341 investigate why this is needed
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const pressEnter = (editor: Editor, shouldBeParagraph: boolean, evt?: any) => {
    const inputEvents: string[] = [];
    const dom = editor.dom;
    const target = editor.selection.getNode();

    const collect = (event: InputEvent) => {
      inputEvents.push(event.inputType);
    };

    evt = Tools.extend({ keyCode: 13, shiftKey: false }, evt);

    editor.on('input', collect);
    dom.dispatch(target, 'keydown', evt);
    dom.dispatch(target, 'keypress', evt);
    dom.dispatch(target, 'keyup', evt);
    editor.off('input', collect);

    assert.deepEqual([ shouldBeParagraph ? 'insertParagraph' : 'insertLineBreak' ], inputEvents, 'Events not fired as expected');
  };

  it('Enter at end of H1', () => {
    const editor = hook.editor();
    editor.setContent('<h1>abc</h1>');
    LegacyUnit.setSelection(editor, 'h1', 3);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<h1>abc</h1><p>\u00a0</p>');
    assert.equal(editor.selection.getRng().startContainer.nodeName, 'P');
  });

  it('Enter in midde of H1', () => {
    const editor = hook.editor();
    editor.setContent('<h1>abcd</h1>');
    LegacyUnit.setSelection(editor, 'h1', 2);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<h1>ab</h1><h1>cd</h1>');
    assert.equal(editor.selection.getRng().startContainer.parentNode?.nodeName, 'H1');
  });

  it('Enter before text after EM', () => {
    const editor = hook.editor();
    editor.setContent('<p><em>a</em>b</p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild as HTMLParagraphElement, 1);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p><em>a</em></p><p>b</p>');
    const rng = editor.selection.getRng();
    assert.equal(rng.startContainer.nodeValue, 'b');
  });

  it('Enter before first IMG in P', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="about:blank" /></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild as HTMLParagraphElement, 0);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p>\u00a0</p><p><img src="about:blank"></p>');
  });

  it('Enter before first wrapped IMG in P', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong><img src="about:blank" /></strong></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild?.firstChild as HTMLElement, 0);
    pressEnter(editor, true);
    assert.equal((editor.getBody().firstChild as HTMLElement).innerHTML, '<br data-mce-bogus="1">');
    TinyAssertions.assertContent(editor, '<p>\u00a0</p><p><strong><img src="about:blank"></strong></p>');
  });

  it('Enter before last IMG in P with text', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc<img src="about:blank" /></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild as HTMLParagraphElement, 1);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p>abc</p><p><img src="about:blank"></p>');
    const rng = editor.selection.getRng();
    assert.equal(rng.startContainer.nodeName, 'P');
    assert.equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'IMG');
  });

  it('Enter before last IMG in P with IMG sibling', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="about:blank" /><img src="about:blank" /></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild as HTMLParagraphElement, 1);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p><img src="about:blank"></p><p><img src="about:blank"></p>');
    const rng = editor.selection.getRng();
    assert.equal(rng.startContainer.nodeName, 'P');
    assert.equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'IMG');
  });

  it('Enter after last IMG in P', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc<img src="about:blank" /></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild as HTMLParagraphElement, 2);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p>abc<img src="about:blank"></p><p>\u00a0</p>');
  });

  it('Enter before last INPUT in P with text', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc<input type="text" /></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild as HTMLParagraphElement, 1);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p>abc</p><p><input type="text"></p>');
    const rng = editor.selection.getRng();
    assert.equal(rng.startContainer.nodeName, 'P');
    assert.equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'INPUT');
  });

  it('Enter before last INPUT in P with IMG sibling', () => {
    const editor = hook.editor();
    editor.setContent('<p><input type="text" /><input type="text" /></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild as HTMLParagraphElement, 1);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p><input type="text"></p><p><input type="text"></p>');
    const rng = editor.selection.getRng();
    assert.equal(rng.startContainer.nodeName, 'P');
    assert.equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'INPUT');
  });

  it('Enter after last INPUT in P', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc<input type="text" /></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild as HTMLParagraphElement, 2);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p>abc<input type="text"></p><p>\u00a0</p>');
  });

  it('Enter at end of P', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    LegacyUnit.setSelection(editor, 'p', 3);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p>abc</p><p>\u00a0</p>');
    assert.equal(editor.selection.getRng().startContainer.nodeName, 'P');
  });

  it('Enter at end of EM inside P', () => {
    const editor = hook.editor();
    editor.setContent('<p><em>abc</em></p>');
    LegacyUnit.setSelection(editor, 'em', 3);
    pressEnter(editor, true);
    assert.equal(
      HtmlUtils.cleanHtml(editor.getBody().innerHTML).replace(/<br([^>]+|)>|&nbsp;/g, ''),
      '<p><em>abc</em></p><p><em></em></p>'
    );
    assert.equal(editor.selection.getRng().startContainer.nodeName, 'EM');
  });

  it('Enter at middle of EM inside P', () => {
    const editor = hook.editor();
    editor.setContent('<p><em>abcd</em></p>');
    LegacyUnit.setSelection(editor, 'em', 2);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p><em>ab</em></p><p><em>cd</em></p>');
    assert.equal(editor.selection.getRng().startContainer.parentNode?.nodeName, 'EM');
  });

  it('Enter at beginning EM inside P', () => {
    const editor = hook.editor();
    editor.setContent('<p><em>abc</em></p>');
    LegacyUnit.setSelection(editor, 'em', 0);
    pressEnter(editor, true);
    assert.equal(
      HtmlUtils.cleanHtml(editor.getBody().innerHTML).replace(/<br([^>]+|)>|&nbsp;/g, ''),
      '<p><em></em></p><p><em>abc</em></p>'
    );
    assert.equal(editor.selection.getRng().startContainer.nodeValue, 'abc');
  });

  it('Enter at end of STRONG in EM inside P', () => {
    const editor = hook.editor();
    editor.setContent('<p><em><strong>abc</strong></em></p>');
    LegacyUnit.setSelection(editor, 'strong', 3);
    pressEnter(editor, true);
    assert.equal(
      HtmlUtils.cleanHtml(editor.getBody().innerHTML).replace(/<br([^>]+|)>|&nbsp;/g, ''),
      '<p><em><strong>abc</strong></em></p><p><em><strong></strong></em></p>'
    );
    assert.equal(editor.selection.getRng().startContainer.nodeName, 'STRONG');
  });

  it('Enter at middle of STRONG in EM inside P', () => {
    const editor = hook.editor();
    editor.setContent('<p><em><strong>abcd</strong></em></p>');
    LegacyUnit.setSelection(editor, 'strong', 2);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p><em><strong>ab</strong></em></p><p><em><strong>cd</strong></em></p>');
    assert.equal(editor.selection.getRng().startContainer.parentNode?.nodeName, 'STRONG');
  });

  it('Enter at beginning STRONG in EM inside P', () => {
    const editor = hook.editor();
    editor.setContent('<p><em><strong>abc</strong></em></p>');
    LegacyUnit.setSelection(editor, 'strong', 0);
    pressEnter(editor, true);
    assert.equal(
      HtmlUtils.cleanHtml(editor.getBody().innerHTML).replace(/<br([^>]+|)>|&nbsp;/g, ''),
      '<p><em><strong></strong></em></p><p><em><strong>abc</strong></em></p>'
    );
    assert.equal(editor.selection.getRng().startContainer.nodeValue, 'abc');
  });

  it('Enter at beginning of P', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p>\u00a0</p><p>abc</p>');
    assert.equal(editor.selection.getRng().startContainer.nodeValue, 'abc');
  });

  it('Enter at middle of P with style, id and class attributes', () => {
    const editor = hook.editor();
    editor.setContent('<p id="a" class="b" style="color:#000">abcd</p>');
    LegacyUnit.setSelection(editor, 'p', 2);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p id="a" class="b" style="color: #000;">ab</p><p class="b" style="color: #000;">cd</p>');
    assert.equal(editor.selection.getRng().startContainer.parentNode?.nodeName, 'P');
  });

  it('Enter at a range between H1 and P', () => {
    const editor = hook.editor();
    editor.setContent('<h1>abcd</h1><p>efgh</p>');
    LegacyUnit.setSelection(editor, 'h1', 2, 'p', 2);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<h1>ab</h1><h1>gh</h1>');
    assert.equal(editor.selection.getNode().nodeName, 'H1');
  });

  it('Enter at a range between LI elements', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>abcd</li><li>efgh</li></ul>');
    LegacyUnit.setSelection(editor, 'li:nth-child(1)', 2, 'li:nth-child(2)', 2);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<ul><li>ab</li><li>gh</li></ul>');
    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('Enter at end of H1 in HGROUP', () => {
    const editor = hook.editor();
    editor.setContent('<hgroup><h1>abc</h1></hgroup>');
    LegacyUnit.setSelection(editor, 'h1', 3);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<hgroup><h1>abc</h1><h1>\u00a0</h1></hgroup>');
    assert.equal(editor.selection.getRng().startContainer.nodeName, 'H1');
  });

  it('Enter inside empty TD', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<table><tr><td></td></tr></table>';
    LegacyUnit.setSelection(editor, 'td', 0);
    pressEnter(editor, true);
    assert.equal(
      HtmlUtils.cleanHtml(editor.getBody().innerHTML).replace(/<br([^>]+|)>|&nbsp;/g, ''),
      '<table><tbody><tr><td><p></p><p></p></td></tr></tbody></table>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Shift+Enter inside STRONG inside TD with BR', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<table><tr><td>d <strong>e</strong><br></td></tr></table>';
    LegacyUnit.setSelection(editor, 'strong', 1);
    pressEnter(editor, false, { shiftKey: true });
    assert.equal(
      HtmlUtils.cleanHtml(editor.getBody().innerHTML),
      '<table><tbody><tr><td>d <strong>e<br></strong><br></td></tr></tbody></table>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'STRONG');
  });

  it('Enter inside middle of text node in body', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = 'abcd';
    LegacyUnit.setSelection(editor, 'body', 2);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p>ab</p><p>cd</p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Enter inside at beginning of text node in body', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = 'abcd';
    LegacyUnit.setSelection(editor, 'body', 0);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p>\u00a0</p><p>abcd</p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Enter inside at end of text node in body', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = 'abcd';
    LegacyUnit.setSelection(editor, 'body', 4);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p>abcd</p><p>\u00a0</p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Enter inside empty body', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '';
    LegacyUnit.setSelection(editor, 'body', 0);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p>\u00a0</p><p>\u00a0</p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Enter in empty P at the end of a blockquote and end_container_on_empty_block: true', () => {
    const editor = hook.editor();
    editor.options.set('end_container_on_empty_block', true);
    editor.getBody().innerHTML = '<blockquote><p>abc</p><p><br></p></blockquote>';
    LegacyUnit.setSelection(editor, 'p:last-of-type', 0);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<blockquote><p>abc</p></blockquote><p>\u00a0</p>');
    editor.options.set('forced_root_block', 'p');
  });

  it('Enter in empty P at the beginning of a blockquote and end_container_on_empty_block: true', () => {
    const editor = hook.editor();
    editor.options.set('end_container_on_empty_block', true);
    editor.getBody().innerHTML = '<blockquote><p><br></p><p>abc</p></blockquote>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p>\u00a0</p><blockquote><p>abc</p></blockquote>');
    editor.options.set('forced_root_block', 'p');
  });

  it('Enter in empty P at in the middle of a blockquote and end_container_on_empty_block: true', () => {
    const editor = hook.editor();
    editor.options.set('end_container_on_empty_block', true);
    editor.getBody().innerHTML = '<blockquote><p>abc</p><p><br></p><p>123</p></blockquote>';
    LegacyUnit.setSelection(editor, 'p:nth-child(2)', 0);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<blockquote><p>abc</p></blockquote><p>\u00a0</p><blockquote><p>123</p></blockquote>');

    editor.getBody().innerHTML = '<blockquote><p>abc</p><p>\u00a0</p><p><br></p><p>123</p></blockquote>';
    LegacyUnit.setSelection(editor, 'p:nth-child(3)', 0);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<blockquote><p>abc</p><p>\u00a0</p></blockquote><p>\u00a0</p><blockquote><p>123</p></blockquote>');
    editor.options.set('forced_root_block', 'p');
  });

  it('Enter inside empty P with empty P siblings', () => {
    const editor = hook.editor();
    // Tests that a workaround for an IE bug is working correctly
    editor.getBody().innerHTML = '<p></p><p></p><p>X</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p>\u00a0</p><p>\u00a0</p><p>\u00a0</p><p>X</p>');
  });

  it('Enter at end of H1 with forced_root_block_attrs', () => {
    const editor = hook.editor();
    editor.options.set('forced_root_block_attrs', { class: 'class1' });
    editor.getBody().innerHTML = '<h1>a</h1>';
    LegacyUnit.setSelection(editor, 'h1', 1);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<h1>a</h1><p class="class1">\u00a0</p>');
    editor.options.unset('forced_root_block_attrs');
  });

  it('Shift+Enter at beginning of P', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>abc</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor, false, { shiftKey: true });
    TinyAssertions.assertContent(editor, '<p><br>abc</p>');
  });

  it('Shift+Enter in the middle of P', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>abcd</p>';
    LegacyUnit.setSelection(editor, 'p', 2);
    pressEnter(editor, false, { shiftKey: true });
    TinyAssertions.assertContent(editor, '<p>ab<br>cd</p>');
  });

  it('Shift+Enter at the end of P', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>abcd</p>';
    LegacyUnit.setSelection(editor, 'p', 4);
    pressEnter(editor, false, { shiftKey: true });
    TinyAssertions.assertContent(editor, '<p>abcd<br><br></p>');
  });

  it('Shift+Enter in the middle of B with a BR after it', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p><strong>abcd</strong><br></p>';
    LegacyUnit.setSelection(editor, 'strong', 2);
    pressEnter(editor, false, { shiftKey: true });
    TinyAssertions.assertContent(editor, '<p><strong>ab<br>cd</strong></p>');
  });

  it('Shift+Enter at the end of B with a BR after it', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p><strong>abcd</strong><br></p>';
    LegacyUnit.setSelection(editor, 'strong', 4);
    pressEnter(editor, false, { shiftKey: true });
    TinyAssertions.assertContent(editor, '<p><strong>abcd<br></strong></p>');
  });

  it('Enter in beginning of PRE', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<pre>abc</pre>';
    LegacyUnit.setSelection(editor, 'pre', 0);
    pressEnter(editor, false);
    TinyAssertions.assertContent(editor, '<pre><br>abc</pre>');
  });

  it('Enter in the middle of PRE', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<pre>abcd</pre>';
    LegacyUnit.setSelection(editor, 'pre', 2);
    pressEnter(editor, false);
    TinyAssertions.assertContent(editor, '<pre>ab<br>cd</pre>');
  });

  it('Enter at the end of PRE', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<pre>abcd</pre>';
    LegacyUnit.setSelection(editor, 'pre', 4);
    pressEnter(editor, false);
    TinyAssertions.assertContent(editor, '<pre>abcd<br><br></pre>');
  });

  it('Enter in beginning of PRE and br_in_pre: false', () => {
    const editor = hook.editor();
    editor.options.set('br_in_pre', false);
    editor.getBody().innerHTML = '<pre>abc</pre>';
    LegacyUnit.setSelection(editor, 'pre', 0);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<pre>\u00a0</pre><pre>abc</pre>');
    editor.options.unset('br_in_pre');
  });

  it('Enter in the middle of PRE and br_in_pre: false', () => {
    const editor = hook.editor();
    editor.options.set('br_in_pre', false);
    editor.getBody().innerHTML = '<pre>abcd</pre>';
    LegacyUnit.setSelection(editor, 'pre', 2);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<pre>ab</pre><pre>cd</pre>');
    editor.options.unset('br_in_pre');
  });

  it('Enter at the end of PRE and br_in_pre: false', () => {
    const editor = hook.editor();
    editor.options.set('br_in_pre', false);
    editor.getBody().innerHTML = '<pre>abcd</pre>';
    LegacyUnit.setSelection(editor, 'pre', 4);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<pre>abcd</pre><p>\u00a0</p>');
    editor.options.unset('br_in_pre');
  });

  it('Shift+Enter in beginning of PRE', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<pre>abc</pre>';
    LegacyUnit.setSelection(editor, 'pre', 0);
    pressEnter(editor, true, { shiftKey: true });
    TinyAssertions.assertContent(editor, '<pre>\u00a0</pre><pre>abc</pre>');
  });

  it('Shift+Enter in the middle of PRE', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<pre>abcd</pre>';
    LegacyUnit.setSelection(editor, 'pre', 2);
    pressEnter(editor, true, { shiftKey: true });
    TinyAssertions.assertContent(editor, '<pre>ab</pre><pre>cd</pre>');
  });

  it('Shift+Enter at the end of PRE', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<pre>abcd</pre>';
    LegacyUnit.setSelection(editor, 'pre', 4);
    pressEnter(editor, true, { shiftKey: true });
    TinyAssertions.assertContent(editor, '<pre>abcd</pre><p>\u00a0</p>');
  });

  it('Enter at the end of DIV layer', () => {
    const editor = hook.editor();
    editor.options.set('br_in_pre', false);
    editor.setContent('<div style="position: absolute; top: 1px; left: 2px;">abcd</div>');
    LegacyUnit.setSelection(editor, 'div', 4);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<div style="position: absolute; top: 1px; left: 2px;"><p>abcd</p><p>\u00a0</p></div>');
    editor.options.unset('br_in_pre');
  });

  it('Enter at end of text in a span inside a P and keep_styles: false', () => {
    const editor = hook.editor();
    editor.options.set('keep_styles', false);
    editor.getBody().innerHTML = '<p><em><span style="font-size: 13px;">X</span></em></p>';
    LegacyUnit.setSelection(editor, 'span', 1);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p><em><span style="font-size: 13px;">X</span></em></p><p>\u00a0</p>');
    editor.options.unset('keep_styles');
  });

  it('keep_styles=false: P should not pass its styles and classes to the new P that is cloned from it when enter is pressed', () => {
    const editor = hook.editor();
    editor.options.set('keep_styles', false);
    editor.getBody().innerHTML = '<p class="red" style="color: #ff0000;"><span style="font-size: 13px;">X</span></p>';
    LegacyUnit.setSelection(editor, 'span', 1);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p class="red" style="color: #ff0000;"><span style="font-size: 13px;">X</span></p><p>\u00a0</p>');
    editor.options.unset('keep_styles');
  });

  it('Enter at end of br line', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>a<br>b</p>';
    LegacyUnit.setSelection(editor, 'p', 1);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p>a</p><p><br>b</p>');

    const rng = editor.selection.getRng();
    assert.equal(rng.startContainer.nodeName, 'P');
    assert.equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'BR');
  });

  it('Enter before BR between DIVs', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<div>a<span>b</span>c</div><br /><div>d</div>';
    const rng = editor.dom.createRng();
    rng.setStartBefore(editor.dom.select('br')[0]);
    rng.setEndBefore(editor.dom.select('br')[0]);
    editor.selection.setRng(rng);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<div>a<span>b</span>c</div><p>\u00a0</p><p>\u00a0</p><div>d</div>');
  });

  // Only test these on modern browsers
  it('Enter behind table element', () => {
    const editor = hook.editor();
    const rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<table><tbody><td>x</td></tbody></table>';
    rng.setStartAfter(editor.getBody().lastChild as HTMLTableElement);
    rng.setEndAfter(editor.getBody().lastChild as HTMLTableElement);
    editor.selection.setRng(rng);

    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td>x</td></tr></tbody></table><p>\u00a0</p>');
  });

  it('Enter before table element', () => {
    const editor = hook.editor();
    const rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<table><tbody><td>x</td></tbody></table>';
    rng.setStartBefore(editor.getBody().lastChild as HTMLTableElement);
    rng.setEndBefore(editor.getBody().lastChild as HTMLTableElement);
    editor.selection.setRng(rng);

    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p>\u00a0</p><table><tbody><tr><td>x</td></tr></tbody></table>');
  });

  it('Enter behind table followed by a p', () => {
    const editor = hook.editor();
    const rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<table><tbody><td>x</td></tbody></table><p>x</p>';
    rng.setStartAfter(editor.getBody().firstChild as HTMLTableElement);
    rng.setEndAfter(editor.getBody().firstChild as HTMLTableElement);
    editor.selection.setRng(rng);

    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td>x</td></tr></tbody></table><p>\u00a0</p><p>x</p>');
  });

  it('Enter before table element preceded by a p', () => {
    const editor = hook.editor();
    const rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<p>x</p><table><tbody><td>x</td></tbody></table>';
    rng.setStartBefore(editor.getBody().lastChild as HTMLTableElement);
    rng.setStartBefore(editor.getBody().lastChild as HTMLTableElement);
    editor.selection.setRng(rng);

    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p>x</p><p>\u00a0</p><table><tbody><tr><td>x</td></tr></tbody></table>');
  });

  it('Enter twice before table element', () => {
    const editor = hook.editor();
    const rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<table><tbody><tr><td>x</td></tr></tbody></table>';
    rng.setStartBefore(editor.getBody().lastChild as HTMLTableElement);
    rng.setEndBefore(editor.getBody().lastChild as HTMLTableElement);
    editor.selection.setRng(rng);

    pressEnter(editor, true);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p>\u00a0</p><p>\u00a0</p><table><tbody><tr><td>x</td></tr></tbody></table>');
  });

  it('Enter after span with space', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong>abc </strong></p>');
    LegacyUnit.setSelection(editor, 'strong', 3);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p><strong>abc</strong></p><p>\u00a0</p>');

    const rng = editor.selection.getRng();
    assert.equal(rng.startContainer.nodeName, 'STRONG');
    assert.equal(rng.startContainer.textContent !== ' ', true);
  });

  it('Enter inside first li with block inside', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ul><li><p><br /></p></li><li><p>b</p></li><li>c</li></ul>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<p>\u00a0</p><ul><li><p>b</p></li><li>c</li></ul>');
  });

  it('Enter inside middle li with block inside', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ul><li>a</li><li><p><br /></p></li><li>c</li></ul>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<ul><li>a</li></ul><p>\u00a0</p><ul><li>c</li></ul>');
  });

  it('Enter inside last li with block inside', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ul><li>a</li><li>b</li><li><p><br /></p></li></ul>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor, true);
    TinyAssertions.assertContent(editor, '<ul><li>a</li><li>b</li></ul><p>\u00a0</p>');
  });

  it('Enter inside summary element', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<details><summary>ab</summary></details>';
    LegacyUnit.setSelection(editor, 'summary', 1);
    pressEnter(editor, false);
    TinyAssertions.assertContent(editor, '<details><summary>a<br>b</summary></details>');
  });

  it('Enter on expanded range', () => {
    const editor = hook.editor();

    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);
    pressEnter(editor, true);

    TinyAssertions.assertContent(editor, '<p>a</p><p>c</p>');
    TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
  });

  it('TINY-9461: Enter inside an editing host should not split the editing host', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      const initialContent = '<p contenteditable="true">ab</p>';

      editor.setContent(initialContent);
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      pressEnter(editor, true);
      TinyAssertions.assertContent(editor, initialContent);
    });
  });
});
