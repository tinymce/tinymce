import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver//Theme';

UnitTest.asynctest('tinymce.lists.browser.BackspaceDeleteTest', (success, failure) => {
  const suite = LegacyUnit.createSuite<Editor>();

  Plugin();
  Theme();

  suite.test('TestCase-TBA: Lists: Backspace at beginning of single LI in UL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(editor.getContent(),
      '<p>a</p>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Backspace at end of single LI in UL', function (editor) {
    const content = '<ul><li><span>a</span></li></ul>';
    editor.getBody().innerHTML = LegacyUnit.trimBrs(content);

    editor.focus();
    // Special set rng, puts selection here: <li><span>a</span>|</li>
    const li = editor.dom.select('li')[0];
    const rng = editor.dom.createRng();
    rng.setStart(li, 1);
    rng.setEnd(li, 1);
    editor.selection.setRng(rng);

    editor.plugins.lists.backspaceDelete();

    // The content doesn't change here as it's not a real backspace, we're just ensuring the "delete list" code doesn't fire
    LegacyUnit.equal(editor.getContent(), content);

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Backspace at end of single LI in UL', function (editor) {
    const content = '<ul><li><span>a</span><strong>b</strong></li></ul>';
    editor.getBody().innerHTML = LegacyUnit.trimBrs(content);

    editor.focus();
    // Special set rng, puts selection here: <li><span>a</span><strong>|b</strong></li>
    const strong = editor.dom.select('strong')[0];
    const rng = editor.dom.createRng();
    rng.setStart(strong, 0);
    rng.setEnd(strong, 0);
    editor.selection.setRng(rng);

    editor.plugins.lists.backspaceDelete();

    // The content doesn't change here as it's not a real backspace, we're just ensuring the "delete list" code doesn't fire
    LegacyUnit.equal(editor.getContent(), content);

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'STRONG');
  });

  suite.test('TestCase-TBA: Lists: Backspace at beginning of first LI in UL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(editor.getContent(),
      '<p>a</p>' +
      '<ul>' +
      '<li>b</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Backspace at beginning of middle LI in UL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>ab</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Backspace at beginning of start LI in UL inside UL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li li', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a</li>' +
      '<li>b' +
      '<ul>' +
      '<li>c</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Backspace at beginning of middle LI in UL inside UL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li li:nth-child(2)', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>bc</li>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Backspace at beginning of single LI in UL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(editor.getContent(),
      '<p>a</p>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Backspace at beginning of first LI in UL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(editor.getContent(),
      '<p>a</p>' +
      '<ul>' +
      '<li>b</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Backspace at beginning of middle LI in UL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>ab</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Backspace at beginning of middle LI in UL inside UL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li li:nth-child(2)', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>bc</li>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Backspace at beginning of LI with empty LI above in UL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '<li></li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(3)', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().innerHTML, 'b');
  });

  suite.test('TestCase-TBA: Lists: Backspace at beginning of LI with BR padded empty LI above in UL', function (editor) {
    editor.getBody().innerHTML = (
      '<ul>' +
      '<li>a</li>' +
      '<li><br></li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(3)', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().innerHTML, 'b');
  });

  suite.test('TestCase-TBA: Lists: Backspace at empty LI (IE)', function (editor) {
    editor.getBody().innerHTML = (
      '<ul>' +
      '<li>a</li>' +
      '<li></li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().innerHTML, 'a');
  });

  suite.test('TestCase-TBA: Lists: Backspace at beginning of LI with empty LI with STRING and BR above in UL', function (editor) {
    editor.getBody().innerHTML = (
      '<ul>' +
      '<li>a</li>' +
      '<li><strong><br></strong></li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(3)', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().innerHTML, 'b');
  });

  suite.test('TestCase-TBA: Lists: Backspace at nested LI with adjacent BR', function (editor) {
    editor.getBody().innerHTML = (
      '<ul>' +
      '<li>1' +
      '<ul>' +
      '<li>' +
      '<br>' +
      '<ul>' +
      '<li>2</li>' +
      '</ul>' +
      '</li>' +
      '</ul>' +
      '</li>' +
      '<li>3</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'ul ul ul li', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(editor.getContent(), '<ul><li>1<ul><li></li><li>2</li></ul></li><li>3</li></ul>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Backspace at LI selected with triple-click in UL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '<li>b' +
      '<ul>' +
      '<li>c</li>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(1)', 0, 'li:nth-child(2)', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(LegacyUnit.trimBrs(editor.getContent()),
      '<ul>' +
      '<li>b' +
      '<ul>' +
      '<li>c</li>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Backspace at partially selected list', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<p>abc</p>' +
      '<ul>' +
      '<li>a</li>' +
      '<li>b' +
      '<ul>' +
      '<li>c</li>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'p', 1, 'li:nth-child(2)', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(LegacyUnit.trimBrs(editor.getContent()),
      '<p>ab</p>' +
      '<ul>' +
      '<li style="list-style-type: none;">' +
      '<ul>' +
      '<li>c</li>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  // Delete

  suite.test('TestCase-TBA: Lists: Delete at end of single LI in UL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 1);
    editor.plugins.lists.backspaceDelete(true);

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Delete at end of first LI in UL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 1);
    editor.plugins.lists.backspaceDelete(true);

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>ab</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Delete at end of middle LI in UL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 1);
    editor.plugins.lists.backspaceDelete(true);

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a</li>' +
      '<li>bc</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Delete at end of start LI in UL inside UL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li li', 1);
    editor.plugins.lists.backspaceDelete(true);

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>bc</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Delete at end of middle LI in UL inside UL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li li:nth-child(2)', 1);
    editor.plugins.lists.backspaceDelete(true);

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>cd</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Delete at end of LI before empty LI', function (editor) {
    editor.getBody().innerHTML = (
      '<ul>' +
      '<li>a</li>' +
      '<li></li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 1);
    editor.plugins.lists.backspaceDelete(true);

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().innerHTML, 'a');
  });

  suite.test('TestCase-TBA: Lists: Delete at end of LI before BR padded empty LI', function (editor) {
    editor.getBody().innerHTML = (
      '<ul>' +
      '<li>a</li>' +
      '<li><br></li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 1);
    editor.plugins.lists.backspaceDelete(true);

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().innerHTML, 'a');
  });

  suite.test('TestCase-TBA: Lists: Delete at end of LI before empty LI with STRONG', function (editor) {
    editor.getBody().innerHTML = (
      '<ul>' +
      '<li>a</li>' +
      '<li><strong><br></strong></li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 1);
    editor.plugins.lists.backspaceDelete(true);

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().innerHTML, 'a');
  });

  suite.test('TestCase-TBA: Lists: Delete at nested LI with adjacent BR', function (editor) {
    editor.getBody().innerHTML = (
      '<ul>' +
      '<li>1' +
      '<ul>' +
      '<li>' +
      '<br>' +
      '<ul>' +
      '<li>2</li>' +
      '</ul>' +
      '</li>' +
      '</ul>' +
      '</li>' +
      '<li>3</li>' +
      '</ul>'
    );

    editor.focus();
    editor.selection.setCursorLocation(editor.$('ul ul li')[0], 0);
    editor.plugins.lists.backspaceDelete(true);

    LegacyUnit.equal(editor.getContent(), '<ul><li>1<ul><li>2</li></ul></li><li>3</li></ul>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Delete at BR before text in LI', function (editor) {
    editor.getBody().innerHTML = (
      '<ul>' +
      '<li>1</li>' +
      '<li>2<br></li>' +
      '<li>3</li>' +
      '</ul>'
    );

    editor.focus();
    editor.selection.setCursorLocation(editor.$('li')[1], 1);
    editor.plugins.lists.backspaceDelete(false);

    LegacyUnit.equal(editor.getContent(), '<ul><li>1</li><li>2</li><li>3</li></ul>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Backspace merge li elements', function (editor) {
    // IE allows you to place the caret inside a LI without children
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '<li></li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);

    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
    LegacyUnit.equal(editor.selection.getRng().startContainer.nodeType, 3, 'Should be a text node');
  });

  suite.test('TestCase-TBA: Lists: Backspace at block inside li element into li without block element', function (editor) {
    editor.getBody().innerHTML = (
      '<ul>' +
        '<li>1</li>' +
        '<li><p>2</p></li>' +
        '<li>3</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(
      editor.getContent(),
      '<ul>' +
        '<li>12</li>' +
        '<li>3</li>' +
      '</ul>'
    );
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Backspace at block inside li element into li with block element', function (editor) {
    editor.getBody().innerHTML = (
      '<ul>' +
        '<li><p>1</p></li>' +
        '<li><p>2</p></li>' +
        '<li>3</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2) p', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(
      editor.getContent(),
      '<ul>' +
        '<li><p>12</p></li>' +
        '<li>3</li>' +
      '</ul>'
    );
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Backspace at block inside li element into li with multiple block elements', function (editor) {
    editor.getBody().innerHTML = (
      '<ul>' +
        '<li><p>1</p><p>2</p></li>' +
        '<li><p>3</p></li>' +
        '<li>4</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2) p', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(
      editor.getContent(),
      '<ul>' +
        '<li><p>1</p><p>2</p>3</li>' +
        '<li>4</li>' +
      '</ul>'
    );
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Delete at block inside li element into li without block element', function (editor) {
    editor.getBody().innerHTML = (
      '<ul>' +
        '<li><p>1</p></li>' +
        '<li>2</li>' +
        '<li>3</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.plugins.lists.backspaceDelete(true);

    LegacyUnit.equal(
      editor.getContent(),
      '<ul>' +
        '<li><p>12</p></li>' +
        '<li>3</li>' +
      '</ul>'
    );
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Delete at block inside li element into li with block element', function (editor) {
    editor.getBody().innerHTML = (
      '<ul>' +
        '<li><p>1</p></li>' +
        '<li><p>2</p></li>' +
        '<li>3</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(1) p', 1);
    editor.plugins.lists.backspaceDelete(true);

    LegacyUnit.equal(
      editor.getContent(),
      '<ul>' +
        '<li><p>12</p></li>' +
        '<li>3</li>' +
      '</ul>'
    );
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Delete at block inside li element into li with multiple block elements', function (editor) {
    editor.getBody().innerHTML = (
      '<ul>' +
        '<li>1</li>' +
        '<li><p>2</p><p>3</p></li>' +
        '<li>4</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(1)', 1);
    editor.plugins.lists.backspaceDelete(true);

    LegacyUnit.equal(
      editor.getContent(),
      '<ul>' +
        '<li>1<p>2</p><p>3</p></li>' +
        '<li>4</li>' +
      '</ul>'
    );
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('Backspace from indented list', function (editor) {
    editor.getBody().innerHTML = (
      '<ol>' +
        '<li>a' +
          '<ol>' +
            '<li style="list-style-type: none;">' +
              '<ol>' +
                '<li>b</li>' +
              '</ol>' +
            '</li>' +
          '</ol>' +
        '</li>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'ol li ol li ol li:nth-child(1)', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(
      editor.getContent(),
      '<ol>' +
        '<li>a' +
          '<ol>' +
            '<li>b</li>' +
          '</ol>' +
        '</li>' +
      '</ol>'
    );
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('Delete into indented list', function (editor) {
    editor.getBody().innerHTML = (
      '<ol>' +
        '<li>a' +
          '<ol>' +
            '<li style="list-style-type: none;">' +
              '<ol>' +
                '<li>b</li>' +
              '</ol>' +
            '</li>' +
          '</ol>' +
        '</li>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'ol li:nth-child(1)', 1);
    editor.plugins.lists.backspaceDelete(true);

    LegacyUnit.equal(
      editor.getContent(),
      '<ol>' +
        '<li>ab</li>' +
      '</ol>'
    );
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Backspace at beginning of LI in UL inside UL and then undo', function (editor) {
    editor.resetContent((
      '<ul>' +
        '<li>item 1</li>' +
        '<li>item 2' +
          '<ul>' +
            '<li>item 2.1' +
              '<ul>' +
                '<li>item 2.2</li>' +
              '</ul>' +
            '</li>' +
          '</ul>' +
        '</li>' +
        '<li>item 3</li>' +
      '</ul>'
    ));

    editor.focus();
    LegacyUnit.setSelection(editor, 'li li:nth-child(1)', 0);
    editor.plugins.lists.backspaceDelete();

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
    '<li>item 1</li>' +
    '<li>item 2</li>' +
    '<li>item 2.1' +
      '<ul>' +
        '<li style="list-style-type: none;">' +
          '<ul>' +
            '<li>item 2.2</li>' +
          '</ul>' +
        '</li>' +
      '</ul>' +
    '</li>' +
    '<li>item 3</li>' +
  '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');

    editor.undoManager.undo();
    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
        '<li>item 1</li>' +
        '<li>item 2' +
          '<ul>' +
            '<li>item 2.1' +
              '<ul>' +
                '<li>item 2.2</li>' +
              '</ul>' +
            '</li>' +
          '</ul>' +
        '</li>' +
        '<li>item 3</li>' +
      '</ul>'
    );
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, Log.steps('TBA', 'Lists: Backspace delete tests', suite.toSteps(editor)), onSuccess, onFailure);
  }, {
    plugins: 'lists',
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    valid_elements:
      'li[style|class|data-custom],ol[style|class|data-custom],' +
      'ul[style|class|data-custom],dl,dt,dd,em,strong,span,#p,div,br',
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,' +
        'font-style,text-decoration,float,margin,margin-top,margin-right,' +
        'margin-bottom,margin-left,display,position,top,left,list-style-type'
    },
    content_style: '.mce-content-body { line-height: normal; }', // Breaks tests in phantomjs unless we have this
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
