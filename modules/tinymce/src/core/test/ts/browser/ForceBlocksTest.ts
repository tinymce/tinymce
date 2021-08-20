import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

import * as HtmlUtils from '../module/test/HtmlUtils';

describe('browser.tinymce.core.ForceBlocksTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  const pressArrowKey = (editor: Editor) => {
    const dom = editor.dom, target = editor.selection.getNode();
    const evt = { keyCode: 37 };

    dom.fire(target, 'keydown', evt);
    dom.fire(target, 'keypress', evt);
    dom.fire(target, 'keyup', evt);
  };

  it('Wrap single root text node in P', () => {
    const editor = hook.editor();
    editor.focus();
    editor.getBody().innerHTML = 'abcd';
    LegacyUnit.setSelection(editor, 'body', 2);
    pressArrowKey(editor);
    assert.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p>abcd</p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Wrap single root text node in P with attrs', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block_attrs = { class: 'class1' };
    editor.getBody().innerHTML = 'abcd';
    LegacyUnit.setSelection(editor, 'body', 2);
    pressArrowKey(editor);
    assert.equal(editor.getContent(), '<p class="class1">abcd</p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
    delete editor.settings.forced_root_block_attrs;
  });

  it('Wrap single root text node in P but not table sibling', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = 'abcd<table><tr><td>x</td></tr></table>';
    LegacyUnit.setSelection(editor, 'body', 2);
    pressArrowKey(editor);
    assert.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p>abcd</p><table><tbody><tr><td>x</td></tr></tbody></table>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Textnodes with only whitespace should not be wrapped new paragraph', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>a</p>      <p>b</p>\n<p>c</p>&nbsp;<p>d</p>      x<p>e</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressArrowKey(editor);
    assert.equal(HtmlUtils.cleanHtml(editor.getContent()), '<p>a</p><p>b</p><p>c</p><p>d</p><p>x</p><p>e</p>');
  });

  it('Do not wrap whitespace textnodes between inline elements', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = 'a <strong>b</strong> <strong>c</strong>';
    LegacyUnit.setSelection(editor, 'strong', 0);
    pressArrowKey(editor);
    assert.equal(HtmlUtils.cleanHtml(editor.getContent()), '<p>a <strong>b</strong> <strong>c</strong></p>');
  });

  it('Wrap root em in P but not table sibling', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<em>abcd</em><table><tr><td>x</td></tr></table>';
    LegacyUnit.setSelection(editor, 'em', 2);
    pressArrowKey(editor);
    assert.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p><em>abcd</em></p><table><tbody><tr><td>x</td></tr></tbody></table>');
    assert.equal(editor.selection.getNode().nodeName, 'EM');
  });

  it('Wrap single root text node in DIV', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = 'div';
    editor.getBody().innerHTML = 'abcd';
    LegacyUnit.setSelection(editor, 'body', 2);
    pressArrowKey(editor);
    assert.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<div>abcd</div>');
    assert.equal(editor.selection.getNode().nodeName, 'DIV');
    delete editor.settings.forced_root_block;
  });

  it('Remove empty root text nodes', () => {
    const editor = hook.editor();
    const body = editor.getBody();

    editor.settings.forced_root_block = 'div';
    editor.getBody().innerHTML = 'abcd<div>abcd</div>';
    body.insertBefore(editor.getDoc().createTextNode(''), body.firstChild);
    body.appendChild(editor.getDoc().createTextNode(''));

    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody().childNodes[1], 1);
    rng.setEnd(editor.getBody().childNodes[1], 1);
    editor.selection.setRng(rng);

    pressArrowKey(editor);
    assert.equal(HtmlUtils.cleanHtml(body.innerHTML), '<div>abcd</div><div>abcd</div>');
    assert.equal(editor.selection.getNode().nodeName, 'DIV');
    assert.lengthOf(body.childNodes, 2);
  });

  it('Do not wrap bookmark spans', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<span data-mce-type="bookmark">a</span>';
    LegacyUnit.setSelection(editor, 'body', 0);
    pressArrowKey(editor);
    assert.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<span data-mce-type="bookmark">a</span>');
  });
});
