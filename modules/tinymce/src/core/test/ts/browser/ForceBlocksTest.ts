import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import HtmlUtils from '../module/test/HtmlUtils';

UnitTest.asynctest('browser.tinymce.core.ForceBlocksTest', function (success, failure) {
  const suite = LegacyUnit.createSuite<Editor>();

  Theme();

  const pressArrowKey = function (editor: Editor) {
    const dom = editor.dom, target = editor.selection.getNode();
    const evt = { keyCode: 37 };

    dom.fire(target, 'keydown', evt);
    dom.fire(target, 'keypress', evt);
    dom.fire(target, 'keyup', evt);
  };

  suite.test('Wrap single root text node in P', function (editor) {
    editor.focus();
    editor.getBody().innerHTML = 'abcd';
    LegacyUnit.setSelection(editor, 'body', 2);
    pressArrowKey(editor);
    LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p>abcd</p>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('Wrap single root text node in P with attrs', function (editor) {
    editor.settings.forced_root_block_attrs = { class: 'class1' };
    editor.getBody().innerHTML = 'abcd';
    LegacyUnit.setSelection(editor, 'body', 2);
    pressArrowKey(editor);
    LegacyUnit.equal(editor.getContent(), '<p class="class1">abcd</p>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
    delete editor.settings.forced_root_block_attrs;
  });

  suite.test('Wrap single root text node in P but not table sibling', function (editor) {
    editor.getBody().innerHTML = 'abcd<table><tr><td>x</td></tr></table>';
    LegacyUnit.setSelection(editor, 'body', 2);
    pressArrowKey(editor);
    LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p>abcd</p><table><tbody><tr><td>x</td></tr></tbody></table>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('Textnodes with only whitespace should not be wrapped new paragraph', (editor) => {
    editor.getBody().innerHTML = '<p>a</p>      <p>b</p>\n<p>c</p>&nbsp;<p>d</p>      x<p>e</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressArrowKey(editor);
    LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getContent()), '<p>a</p><p>b</p><p>c</p><p>d</p><p>x</p><p>e</p>');
  });

  suite.test('Do not wrap whitespace textnodes between inline elements', (editor) => {
    editor.getBody().innerHTML = 'a <strong>b</strong> <strong>c</strong>';
    LegacyUnit.setSelection(editor, 'strong', 0);
    pressArrowKey(editor);
    LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getContent()), '<p>a <strong>b</strong> <strong>c</strong></p>');
  });

  suite.test('Wrap root em in P but not table sibling', function (editor) {
    editor.getBody().innerHTML = '<em>abcd</em><table><tr><td>x</td></tr></table>';
    LegacyUnit.setSelection(editor, 'em', 2);
    pressArrowKey(editor);
    LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p><em>abcd</em></p><table><tbody><tr><td>x</td></tr></tbody></table>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'EM');
  });

  suite.test('Wrap single root text node in DIV', function (editor) {
    editor.settings.forced_root_block = 'div';
    editor.getBody().innerHTML = 'abcd';
    LegacyUnit.setSelection(editor, 'body', 2);
    pressArrowKey(editor);
    LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<div>abcd</div>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'DIV');
    delete editor.settings.forced_root_block;
  });

  suite.test('Remove empty root text nodes', function (editor) {
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
    LegacyUnit.equal(HtmlUtils.cleanHtml(body.innerHTML), '<div>abcd</div><div>abcd</div>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'DIV');
    LegacyUnit.equal(body.childNodes.length, 2);
  });

  suite.test('Wrap single root text node in P but not table sibling', function (editor) {
    editor.getBody().innerHTML = '<span data-mce-type="bookmark">a</span>';
    LegacyUnit.setSelection(editor, 'body', 0);
    pressArrowKey(editor);
    LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<span data-mce-type="bookmark">a</span>');
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
