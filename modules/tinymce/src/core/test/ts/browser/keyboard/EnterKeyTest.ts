import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import Theme from 'tinymce/themes/silver/Theme';

import * as HtmlUtils from '../../module/test/HtmlUtils';

describe('browser.tinymce.core.keyboard.EnterKey', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    schema: 'html5',
    extended_valid_elements: 'div[id|style|contenteditable],span[id|style|contenteditable],#dt,#dd',
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  const pressEnter = (editor: Editor, evt?: any) => {
    const dom = editor.dom;
    const target = editor.selection.getNode();

    evt = Tools.extend({ keyCode: 13, shiftKey: false }, evt);

    dom.fire(target, 'keydown', evt);
    dom.fire(target, 'keypress', evt);
    dom.fire(target, 'keyup', evt);
  };

  it('Enter at end of H1', () => {
    const editor = hook.editor();
    editor.setContent('<h1>abc</h1>');
    LegacyUnit.setSelection(editor, 'h1', 3);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<h1>abc</h1><p>\u00a0</p>');
    assert.equal(editor.selection.getRng().startContainer.nodeName, 'P');
  });

  it('Enter in midde of H1', () => {
    const editor = hook.editor();
    editor.setContent('<h1>abcd</h1>');
    LegacyUnit.setSelection(editor, 'h1', 2);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<h1>ab</h1><h1>cd</h1>');
    assert.equal(editor.selection.getRng().startContainer.parentNode.nodeName, 'H1');
  });

  it('Enter before text after EM', () => {
    const editor = hook.editor();
    editor.setContent('<p><em>a</em>b</p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild, 1);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p><em>a</em></p><p>b</p>');
    const rng = editor.selection.getRng();
    assert.equal(rng.startContainer.nodeValue, 'b');
  });

  it('Enter before first IMG in P', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="about:blank" /></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild, 0);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>\u00a0</p><p><img src="about:blank" /></p>');
  });

  it('Enter before first wrapped IMG in P', () => {
    const editor = hook.editor();
    editor.setContent('<p><b><img src="about:blank" /></b></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild.firstChild, 0);
    pressEnter(editor);
    assert.equal((editor.getBody().firstChild as HTMLElement).innerHTML, '<br data-mce-bogus="1">');
    assert.equal(editor.getContent(), '<p>\u00a0</p><p><b><img src="about:blank" /></b></p>');
  });

  it('Enter before last IMG in P with text', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc<img src="about:blank" /></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild, 1);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>abc</p><p><img src="about:blank" /></p>');
    const rng = editor.selection.getRng();
    assert.equal(rng.startContainer.nodeName, 'P');
    assert.equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'IMG');
  });

  it('Enter before last IMG in P with IMG sibling', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="about:blank" /><img src="about:blank" /></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild, 1);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p><img src="about:blank" /></p><p><img src="about:blank" /></p>');
    const rng = editor.selection.getRng();
    assert.equal(rng.startContainer.nodeName, 'P');
    assert.equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'IMG');
  });

  it('Enter after last IMG in P', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc<img src="about:blank" /></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild, 2);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>abc<img src="about:blank" /></p><p>\u00a0</p>');
  });

  it('Enter before last INPUT in P with text', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc<input type="text" /></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild, 1);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>abc</p><p><input type="text" /></p>');
    const rng = editor.selection.getRng();
    assert.equal(rng.startContainer.nodeName, 'P');
    assert.equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'INPUT');
  });

  it('Enter before last INPUT in P with IMG sibling', () => {
    const editor = hook.editor();
    editor.setContent('<p><input type="text" /><input type="text" /></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild, 1);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p><input type="text" /></p><p><input type="text" /></p>');
    const rng = editor.selection.getRng();
    assert.equal(rng.startContainer.nodeName, 'P');
    assert.equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'INPUT');
  });

  it('Enter after last INPUT in P', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc<input type="text" /></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild, 2);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>abc<input type="text" /></p><p>\u00a0</p>');
  });

  it('Enter at end of P', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    LegacyUnit.setSelection(editor, 'p', 3);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>abc</p><p>\u00a0</p>');
    assert.equal(editor.selection.getRng().startContainer.nodeName, 'P');
  });

  it('Enter at end of EM inside P', () => {
    const editor = hook.editor();
    editor.setContent('<p><em>abc</em></p>');
    LegacyUnit.setSelection(editor, 'em', 3);
    pressEnter(editor);
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
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p><em>ab</em></p><p><em>cd</em></p>');
    assert.equal(editor.selection.getRng().startContainer.parentNode.nodeName, 'EM');
  });

  it('Enter at beginning EM inside P', () => {
    const editor = hook.editor();
    editor.setContent('<p><em>abc</em></p>');
    LegacyUnit.setSelection(editor, 'em', 0);
    pressEnter(editor);
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
    pressEnter(editor);
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
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p><em><strong>ab</strong></em></p><p><em><strong>cd</strong></em></p>');
    assert.equal(editor.selection.getRng().startContainer.parentNode.nodeName, 'STRONG');
  });

  it('Enter at beginning STRONG in EM inside P', () => {
    const editor = hook.editor();
    editor.setContent('<p><em><strong>abc</strong></em></p>');
    LegacyUnit.setSelection(editor, 'strong', 0);
    pressEnter(editor);
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
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>\u00a0</p><p>abc</p>');
    assert.equal(editor.selection.getRng().startContainer.nodeValue, 'abc');
  });

  it('Enter at middle of P with style, id and class attributes', () => {
    const editor = hook.editor();
    editor.setContent('<p id="a" class="b" style="color:#000">abcd</p>');
    LegacyUnit.setSelection(editor, 'p', 2);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p id="a" class="b" style="color: #000;">ab</p><p class="b" style="color: #000;">cd</p>');
    assert.equal(editor.selection.getRng().startContainer.parentNode.nodeName, 'P');
  });

  it('Enter at a range between H1 and P', () => {
    const editor = hook.editor();
    editor.setContent('<h1>abcd</h1><p>efgh</p>');
    LegacyUnit.setSelection(editor, 'h1', 2, 'p', 2);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<h1>ab</h1><h1>gh</h1>');
    assert.equal(editor.selection.getNode().nodeName, 'H1');
  });

  it('Enter at a range between LI elements', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>abcd</li><li>efgh</li></ul>');
    LegacyUnit.setSelection(editor, 'li:nth-child(1)', 2, 'li:nth-child(2)', 2);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<ul><li>ab</li><li>gh</li></ul>');
    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('Enter at end of H1 in HGROUP', () => {
    const editor = hook.editor();
    editor.setContent('<hgroup><h1>abc</h1></hgroup>');
    LegacyUnit.setSelection(editor, 'h1', 3);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<hgroup><h1>abc</h1><h1>\u00a0</h1></hgroup>');
    assert.equal(editor.selection.getRng().startContainer.nodeName, 'H1');
  });

  it('Enter inside empty TD', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<table><tr><td></td></tr></table>';
    LegacyUnit.setSelection(editor, 'td', 0);
    pressEnter(editor);
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
    pressEnter(editor, { shiftKey: true });
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
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>ab</p><p>cd</p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Enter inside at beginning of text node in body', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = 'abcd';
    LegacyUnit.setSelection(editor, 'body', 0);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>\u00a0</p><p>abcd</p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Enter inside at end of text node in body', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = 'abcd';
    LegacyUnit.setSelection(editor, 'body', 4);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>abcd</p><p>\u00a0</p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Enter inside empty body', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '';
    LegacyUnit.setSelection(editor, 'body', 0);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>\u00a0</p><p>\u00a0</p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Enter in the middle of text in P with forced_root_block set to false', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;
    editor.getBody().innerHTML = '<p>abc</p>';
    LegacyUnit.setSelection(editor, 'p', 2);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>ab<br />c</p>');
  });

  it('Enter at the end of text in P with forced_root_block set to false', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;
    editor.getBody().innerHTML = '<p>abc</p>';
    LegacyUnit.setSelection(editor, 'p', 3);
    pressEnter(editor);
    assert.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p>abc<br><br></p>');
    editor.settings.forced_root_block = 'p';
  });

  it('Enter at the middle of text in BODY with forced_root_block set to false', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;
    editor.getBody().innerHTML = 'abcd';
    LegacyUnit.setSelection(editor, 'body', 2);
    editor.focus();
    pressEnter(editor);
    assert.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), 'ab<br>cd');
    editor.settings.forced_root_block = 'p';
  });

  it('Enter at the beginning of text in BODY with forced_root_block set to false', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;
    editor.getBody().innerHTML = 'abcd';
    LegacyUnit.setSelection(editor, 'body', 0);
    editor.focus();
    pressEnter(editor);
    assert.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<br>abcd');
    editor.settings.forced_root_block = 'p';
  });

  it('Enter at the end of text in BODY with forced_root_block set to false', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;
    editor.getBody().innerHTML = 'abcd';
    LegacyUnit.setSelection(editor, 'body', 4);
    editor.focus();
    pressEnter(editor);
    assert.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), 'abcd<br><br>');
    editor.settings.forced_root_block = 'p';
  });

  it('Enter in empty P at the end of a blockquote and end_container_on_empty_block: true', () => {
    const editor = hook.editor();
    editor.settings.end_container_on_empty_block = true;
    editor.getBody().innerHTML = '<blockquote><p>abc</p><p><br></p></blockquote>';
    LegacyUnit.setSelection(editor, 'p:last', 0);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<blockquote><p>abc</p></blockquote><p>\u00a0</p>');
    editor.settings.forced_root_block = 'p';
  });

  it('Enter in empty P at the beginning of a blockquote and end_container_on_empty_block: true', () => {
    const editor = hook.editor();
    editor.settings.end_container_on_empty_block = true;
    editor.getBody().innerHTML = '<blockquote><p><br></p><p>abc</p></blockquote>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>\u00a0</p><blockquote><p>abc</p></blockquote>');
    editor.settings.forced_root_block = 'p';
  });

  it('Enter in empty P at in the middle of a blockquote and end_container_on_empty_block: true', () => {
    const editor = hook.editor();
    editor.settings.end_container_on_empty_block = true;
    editor.getBody().innerHTML = '<blockquote><p>abc</p><p><br></p><p>123</p></blockquote>';
    LegacyUnit.setSelection(editor, 'p:nth-child(2)', 0);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<blockquote><p>abc</p></blockquote><p>\u00a0</p><blockquote><p>123</p></blockquote>');

    editor.getBody().innerHTML = '<blockquote><p>abc</p><p>\u00a0</p><p><br></p><p>123</p></blockquote>';
    LegacyUnit.setSelection(editor, 'p:nth-child(3)', 0);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<blockquote><p>abc</p><p>\u00a0</p></blockquote><p>\u00a0</p><blockquote><p>123</p></blockquote>');
    editor.settings.forced_root_block = 'p';
  });

  it('Enter inside empty P with empty P siblings', () => {
    const editor = hook.editor();
    // Tests that a workaround for an IE bug is working correctly
    editor.getBody().innerHTML = '<p></p><p></p><p>X</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>\u00a0</p><p>\u00a0</p><p>\u00a0</p><p>X</p>');
  });

  it('Enter at end of H1 with forced_root_block_attrs', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block_attrs = { class: 'class1' };
    editor.getBody().innerHTML = '<h1>a</h1>';
    LegacyUnit.setSelection(editor, 'h1', 1);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<h1>a</h1><p class="class1">\u00a0</p>');
    delete editor.settings.forced_root_block_attrs;
  });

  it('Shift+Enter at beginning of P', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>abc</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor, { shiftKey: true });
    assert.equal(editor.getContent(), '<p><br />abc</p>');
  });

  it('Shift+Enter in the middle of P', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>abcd</p>';
    LegacyUnit.setSelection(editor, 'p', 2);
    pressEnter(editor, { shiftKey: true });
    assert.equal(editor.getContent(), '<p>ab<br />cd</p>');
  });

  it('Shift+Enter at the end of P', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>abcd</p>';
    LegacyUnit.setSelection(editor, 'p', 4);
    pressEnter(editor, { shiftKey: true });
    assert.equal(editor.getContent(), '<p>abcd<br /><br /></p>');
  });

  it('Shift+Enter in the middle of B with a BR after it', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p><b>abcd</b><br></p>';
    LegacyUnit.setSelection(editor, 'b', 2);
    pressEnter(editor, { shiftKey: true });
    assert.equal(editor.getContent(), '<p><b>ab<br />cd</b></p>');
  });

  it('Shift+Enter at the end of B with a BR after it', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p><b>abcd</b><br></p>';
    LegacyUnit.setSelection(editor, 'b', 4);
    pressEnter(editor, { shiftKey: true });
    assert.equal(editor.getContent(), '<p><b>abcd<br /></b></p>');
  });

  it('Enter in beginning of PRE', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<pre>abc</pre>';
    LegacyUnit.setSelection(editor, 'pre', 0);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<pre><br />abc</pre>');
  });

  it('Enter in the middle of PRE', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<pre>abcd</pre>';
    LegacyUnit.setSelection(editor, 'pre', 2);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<pre>ab<br />cd</pre>');
  });

  it('Enter at the end of PRE', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<pre>abcd</pre>';
    LegacyUnit.setSelection(editor, 'pre', 4);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<pre>abcd<br /><br /></pre>');
  });

  it('Enter in beginning of PRE and br_in_pre: false', () => {
    const editor = hook.editor();
    editor.settings.br_in_pre = false;
    editor.getBody().innerHTML = '<pre>abc</pre>';
    LegacyUnit.setSelection(editor, 'pre', 0);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<pre>\u00a0</pre><pre>abc</pre>');
    delete editor.settings.br_in_pre;
  });

  it('Enter in the middle of PRE and br_in_pre: false', () => {
    const editor = hook.editor();
    editor.settings.br_in_pre = false;
    editor.getBody().innerHTML = '<pre>abcd</pre>';
    LegacyUnit.setSelection(editor, 'pre', 2);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<pre>ab</pre><pre>cd</pre>');
    delete editor.settings.br_in_pre;
  });

  it('Enter at the end of PRE and br_in_pre: false', () => {
    const editor = hook.editor();
    editor.settings.br_in_pre = false;
    editor.getBody().innerHTML = '<pre>abcd</pre>';
    LegacyUnit.setSelection(editor, 'pre', 4);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<pre>abcd</pre><p>\u00a0</p>');
    delete editor.settings.br_in_pre;
  });

  it('Shift+Enter in beginning of PRE', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<pre>abc</pre>';
    LegacyUnit.setSelection(editor, 'pre', 0);
    pressEnter(editor, { shiftKey: true });
    assert.equal(editor.getContent(), '<pre>\u00a0</pre><pre>abc</pre>');
  });

  it('Shift+Enter in the middle of PRE', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<pre>abcd</pre>';
    LegacyUnit.setSelection(editor, 'pre', 2);
    pressEnter(editor, { shiftKey: true });
    assert.equal(editor.getContent(), '<pre>ab</pre><pre>cd</pre>');
  });

  it('Shift+Enter at the end of PRE', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<pre>abcd</pre>';
    LegacyUnit.setSelection(editor, 'pre', 4);
    pressEnter(editor, { shiftKey: true });
    assert.equal(editor.getContent(), '<pre>abcd</pre><p>\u00a0</p>');
  });

  it('Shift+Enter in beginning of P with forced_root_block set to false', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;
    editor.getBody().innerHTML = '<p>abc</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor, { shiftKey: true });
    assert.equal(editor.getContent(), '<p>\u00a0</p><p>abc</p>');
    editor.settings.forced_root_block = 'p';
  });

  it('Shift+Enter in middle of P with forced_root_block set to false', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;
    editor.getBody().innerHTML = '<p>abcd</p>';
    LegacyUnit.setSelection(editor, 'p', 2);
    pressEnter(editor, { shiftKey: true });
    assert.equal(editor.getContent(), '<p>ab</p><p>cd</p>');
    editor.settings.forced_root_block = 'p';
  });

  it('Shift+Enter at the end of P with forced_root_block set to false', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;
    editor.getBody().innerHTML = '<p>abc</p>';
    LegacyUnit.setSelection(editor, 'p', 3);
    pressEnter(editor, { shiftKey: true });
    assert.equal(editor.getContent(), '<p>abc</p><p>\u00a0</p>');
    editor.settings.forced_root_block = 'p';
  });

  it('Shift+Enter in body with forced_root_block set to false', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;
    editor.getBody().innerHTML = 'abcd';
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild, 2);
    rng.setEnd(editor.getBody().firstChild, 2);
    editor.selection.setRng(rng);
    pressEnter(editor, { shiftKey: true });
    assert.equal(editor.getContent(), '<p>ab</p><p>cd</p>');
    editor.settings.forced_root_block = 'p';
  });

  it('Enter at the end of DIV layer', () => {
    const editor = hook.editor();
    editor.settings.br_in_pre = false;
    editor.setContent('<div style="position: absolute; top: 1px; left: 2px;">abcd</div>');
    LegacyUnit.setSelection(editor, 'div', 4);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<div style="position: absolute; top: 1px; left: 2px;"><p>abcd</p><p>\u00a0</p></div>');
    delete editor.settings.br_in_pre;
  });

  it('Enter at end of text in a span inside a P and keep_styles: false', () => {
    const editor = hook.editor();
    editor.settings.keep_styles = false;
    editor.getBody().innerHTML = '<p><em><span style="font-size: 13px;">X</span></em></p>';
    LegacyUnit.setSelection(editor, 'span', 1);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p><em><span style="font-size: 13px;">X</span></em></p><p>\u00a0</p>');
    delete editor.settings.keep_styles;
  });

  it('keep_styles=false: P should not pass its styles and classes to the new P that is cloned from it when enter is pressed', () => {
    const editor = hook.editor();
    editor.settings.keep_styles = false;
    editor.getBody().innerHTML = '<p class="red" style="color: #ff0000;"><span style="font-size: 13px;">X</span></p>';
    LegacyUnit.setSelection(editor, 'span', 1);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p class="red" style="color: #ff0000;"><span style="font-size: 13px;">X</span></p><p>\u00a0</p>');
    delete editor.settings.keep_styles;
  });

  it('Enter when forced_root_block: false and force_p_newlines: true', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;
    editor.settings.force_p_newlines = true;
    editor.getBody().innerHTML = 'text';
    LegacyUnit.setSelection(editor, 'body', 2);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>te</p><p>xt</p>');
    editor.settings.forced_root_block = 'p';
    delete editor.settings.force_p_newlines;
  });

  it('Enter at end of br line', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;
    editor.settings.force_p_newlines = true;
    editor.getBody().innerHTML = '<p>a<br>b</p>';
    LegacyUnit.setSelection(editor, 'p', 1);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>a</p><p><br />b</p>');

    const rng = editor.selection.getRng();
    assert.equal(rng.startContainer.nodeName, 'P');
    assert.equal(rng.startContainer.childNodes[rng.startOffset].nodeName, 'BR');
    editor.settings.forced_root_block = 'p';
    delete editor.settings.force_p_newlines;
  });

  it('Enter before BR between DIVs', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<div>a<span>b</span>c</div><br /><div>d</div>';
    const rng = editor.dom.createRng();
    rng.setStartBefore(editor.dom.select('br')[0]);
    rng.setEndBefore(editor.dom.select('br')[0]);
    editor.selection.setRng(rng);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<div>a<span>b</span>c</div><p>\u00a0</p><p>\u00a0</p><div>d</div>');
  });

  // Only test these on modern browsers
  it('Enter behind table element', () => {
    const editor = hook.editor();
    const rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<table><tbody><td>x</td></tbody></table>';
    rng.setStartAfter(editor.getBody().lastChild);
    rng.setEndAfter(editor.getBody().lastChild);
    editor.selection.setRng(rng);

    pressEnter(editor);
    assert.equal(editor.getContent(), '<table><tbody><tr><td>x</td></tr></tbody></table><p>\u00a0</p>');
  });

  it('Enter before table element', () => {
    const editor = hook.editor();
    const rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<table><tbody><td>x</td></tbody></table>';
    rng.setStartBefore(editor.getBody().lastChild);
    rng.setEndBefore(editor.getBody().lastChild);
    editor.selection.setRng(rng);

    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>\u00a0</p><table><tbody><tr><td>x</td></tr></tbody></table>');
  });

  it('Enter behind table followed by a p', () => {
    const editor = hook.editor();
    const rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<table><tbody><td>x</td></tbody></table><p>x</p>';
    rng.setStartAfter(editor.getBody().firstChild);
    rng.setEndAfter(editor.getBody().firstChild);
    editor.selection.setRng(rng);

    pressEnter(editor);
    assert.equal(editor.getContent(), '<table><tbody><tr><td>x</td></tr></tbody></table><p>\u00a0</p><p>x</p>');
  });

  it('Enter before table element preceded by a p', () => {
    const editor = hook.editor();
    const rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<p>x</p><table><tbody><td>x</td></tbody></table>';
    rng.setStartBefore(editor.getBody().lastChild);
    rng.setStartBefore(editor.getBody().lastChild);
    editor.selection.setRng(rng);

    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>x</p><p>\u00a0</p><table><tbody><tr><td>x</td></tr></tbody></table>');
  });

  it('Enter twice before table element', () => {
    const editor = hook.editor();
    const rng = editor.dom.createRng();

    editor.getBody().innerHTML = '<table><tbody><tr><td>x</td></tr></tbody></table>';
    rng.setStartBefore(editor.getBody().lastChild);
    rng.setEndBefore(editor.getBody().lastChild);
    editor.selection.setRng(rng);

    pressEnter(editor);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>\u00a0</p><p>\u00a0</p><table><tbody><tr><td>x</td></tr></tbody></table>');
  });

  it('Enter after span with space', () => {
    const editor = hook.editor();
    editor.setContent('<p><b>abc </b></p>');
    LegacyUnit.setSelection(editor, 'b', 3);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p><b>abc</b></p><p>\u00a0</p>');

    const rng = editor.selection.getRng();
    assert.equal(rng.startContainer.nodeName, 'B');
    assert.equal(rng.startContainer.textContent !== ' ', true);
  });

  it('Enter inside first li with block inside', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ul><li><p><br /></p></li><li><p>b</p></li><li>c</li></ul>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<p>\u00a0</p><ul><li><p>b</p></li><li>c</li></ul>');
  });

  it('Enter inside middle li with block inside', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ul><li>a</li><li><p><br /></p></li><li>c</li></ul>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<ul><li>a</li></ul><p>\u00a0</p><ul><li>c</li></ul>');
  });

  it('Enter inside last li with block inside', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ul><li>a</li><li>b</li><li><p><br /></p></li></ul>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<ul><li>a</li><li>b</li></ul><p>\u00a0</p>');
  });

  it('Enter inside summary element', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<details><summary>ab</summary></details>';
    LegacyUnit.setSelection(editor, 'summary', 1);
    pressEnter(editor);
    assert.equal(editor.getContent(), '<details><summary>a<br />b</summary></details>');
  });
});
