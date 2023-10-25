import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { LegacyUnit, TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as TransparentElements from 'tinymce/core/content/TransparentElements';

import * as HtmlUtils from '../module/test/HtmlUtils';

describe('browser.tinymce.core.ForceBlocksTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const pressArrowKey = (editor: Editor) => {
    const dom = editor.dom, target = editor.selection.getNode();
    const evt = { keyCode: 37 };

    dom.dispatch(target, 'keydown', evt);
    dom.dispatch(target, 'keypress', evt);
    dom.dispatch(target, 'keyup', evt);
  };

  it('Wrap single root text node in P', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = 'abcd';
    LegacyUnit.setSelection(editor, 'body', 2);
    pressArrowKey(editor);
    assert.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p>abcd</p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Wrap single root text node in P with attrs', () => {
    const editor = hook.editor();
    editor.options.set('forced_root_block_attrs', { class: 'class1' });
    editor.getBody().innerHTML = 'abcd';
    LegacyUnit.setSelection(editor, 'body', 2);
    pressArrowKey(editor);
    TinyAssertions.assertContent(editor, '<p class="class1">abcd</p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
    editor.options.unset('forced_root_block_attrs');
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
    editor.options.set('forced_root_block', 'div');
    editor.getBody().innerHTML = 'abcd';
    LegacyUnit.setSelection(editor, 'body', 2);
    pressArrowKey(editor);
    assert.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<div>abcd</div>');
    assert.equal(editor.selection.getNode().nodeName, 'DIV');
    editor.options.unset('forced_root_block');
  });

  it('Remove empty root text nodes', () => {
    const editor = hook.editor();
    const body = editor.getBody();

    editor.options.set('forced_root_block', 'div');
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

    editor.options.unset('forced_root_block');
  });

  it('Do not wrap bookmark spans', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<span data-mce-type="bookmark">a</span>';
    LegacyUnit.setSelection(editor, 'body', 0);
    pressArrowKey(editor);
    assert.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<span data-mce-type="bookmark">a</span>');
  });

  context('Transparent elements', () => {
    it('TINY-9172: Do not wrap root level transparent elements if they blocks inside', () => {
      const editor = hook.editor();
      const transparentElements = TransparentElements.elementNames(editor.schema.getTransparentElements());
      const transparentElementsHtml = Arr.map(transparentElements, (name) => `<${name} data-mce-block="true"><p>text</p></${name}>`).join('');
      const innerHtml = 'text' + transparentElementsHtml;
      const expectedInnerHtml = '<p>text</p>' + transparentElementsHtml;

      editor.getBody().innerHTML = innerHtml;
      TinySelections.setCursor(editor, [ 0 ], 0);
      pressArrowKey(editor);
      assert.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), expectedInnerHtml);
    });

    it('TINY-9172: Wrap root level transparent elements if they do not have blocks inside', () => {
      const editor = hook.editor();
      const transparentElements = TransparentElements.elementNames(editor.schema.getTransparentElements());
      const transparentElementsHtml = Arr.map(transparentElements, (name) => `<${name}>text</${name}>`).join('');
      const innerHtml = 'text' + transparentElementsHtml;
      const expectedInnerHtml = `<p>text${transparentElementsHtml}</p>`;

      editor.getBody().innerHTML = innerHtml;
      TinySelections.setCursor(editor, [ 0 ], 0);
      pressArrowKey(editor);
      assert.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), expectedInnerHtml);
    });
  });

  it('TINY-10237: Should not wrap SVG elements', () => {
    const editor = hook.editor();

    editor.setContent('<svg></svg>foo', { format: 'raw' });
    TinySelections.setCursor(editor, [ 1 ], 0);
    pressArrowKey(editor);
    TinyAssertions.assertRawContent(editor, '<svg></svg><p>foo</p>');
  });

  it('TINY-10273: Should not create empty paragraphs for whitespace around SVG elements', () => {
    const editor = hook.editor();

    editor.setContent(' <svg></svg> <svg></svg> ', { format: 'raw' });
    TinySelections.setCursor(editor, [ 0 ], 0);
    pressArrowKey(editor);
    TinyAssertions.assertRawContent(editor, '<svg></svg><svg></svg>');
  });
});
