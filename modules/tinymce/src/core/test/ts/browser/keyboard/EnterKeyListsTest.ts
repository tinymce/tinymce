import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Tools from 'tinymce/core/api/util/Tools';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.keyboard.EnterKeyListsTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Theme();

  const pressEnter = function (editor, evt?) {
    const dom = editor.dom, target = editor.selection.getNode();

    evt = Tools.extend({ keyCode: 13, shiftKey: false }, evt);

    dom.fire(target, 'keydown', evt);
    dom.fire(target, 'keypress', evt);
    dom.fire(target, 'keyup', evt);
  };

  const trimBrsOnIE = function (html) {
    return html.replace(/<br[^>]*>/gi, '');
  };

  suite.test('Enter inside empty li in beginning of ol', function (editor) {
    editor.getBody().innerHTML = '<ol><li><br></li><li>a</li></ol>';
    LegacyUnit.setSelection(editor, 'li', 0);
    pressEnter(editor);
    LegacyUnit.equal(editor.getContent(), '<p>\u00a0</p><ol><li>a</li></ol>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('Enter inside empty li at the end of ol', function (editor) {
    editor.getBody().innerHTML = '<ol><li>a</li><li><br></li></ol>';
    LegacyUnit.setSelection(editor, 'li:last', 0);
    pressEnter(editor);
    LegacyUnit.equal(editor.getContent(), '<ol><li>a</li></ol><p>\u00a0</p>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('Shift+Enter inside empty li in the middle of ol', function (editor) {
    editor.getBody().innerHTML = '<ol><li>a</li><li><br></li><li>b</li></ol>';
    editor.selection.setCursorLocation(editor.dom.select('li:nth-child(2)')[0], 0);
    pressEnter(editor, { shiftKey: true });
    LegacyUnit.equal(editor.getBody().innerHTML, '<ol><li>a</li><li><br><br></li><li>b</li></ol>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('Shift+Enter inside empty li in beginning of ol', function (editor) {
    editor.getBody().innerHTML = '<ol><li><br></li><li>a</li></ol>';
    editor.selection.setCursorLocation(editor.dom.select('li')[0], 0);
    pressEnter(editor, { shiftKey: true });
    LegacyUnit.equal(editor.getBody().innerHTML, '<ol><li><br><br></li><li>a</li></ol>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('Shift+Enter inside empty li at the end of ol', function (editor) {
    editor.getBody().innerHTML = '<ol><li>a</li><li><br></li></ol>';
    editor.selection.setCursorLocation(editor.dom.select('li')[1], 0);
    pressEnter(editor, { shiftKey: true });
    LegacyUnit.equal(editor.getBody().innerHTML, '<ol><li>a</li><li><br><br></li></ol>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('Enter inside empty li in the middle of ol with forced_root_block: false', function (editor) {
    editor.settings.forced_root_block = false;
    editor.getBody().innerHTML = '<ol><li>a</li><li><br></li><li>b</li></ol>';
    editor.selection.setCursorLocation(editor.dom.select('li:nth-child(2)')[0], 0);
    pressEnter(editor);
    LegacyUnit.equal(editor.getBody().innerHTML, '<ol><li>a</li></ol><br><ol><li>b</li></ol>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'BODY');
    editor.settings.forced_root_block = 'p';
  });

  suite.test('Enter inside empty li in beginning of ol with forced_root_block: false', function (editor) {
    editor.settings.forced_root_block = false;
    editor.getBody().innerHTML = '<ol><li><br></li><li>a</li></ol>';
    editor.selection.setCursorLocation(editor.dom.select('li')[0], 0);
    pressEnter(editor);
    LegacyUnit.equal(editor.getBody().innerHTML, '<br><ol><li>a</li></ol>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'BODY');
    editor.settings.forced_root_block = 'p';
  });

  suite.test('Enter inside empty li at the end of ol with forced_root_block: false', function (editor) {
    editor.settings.forced_root_block = false;
    editor.getBody().innerHTML = '<ol><li>a</li><li><br></li></ol>';
    editor.selection.setCursorLocation(editor.dom.select('li')[1], 0);
    pressEnter(editor);
    LegacyUnit.equal(editor.getBody().innerHTML, '<ol><li>a</li></ol><br>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'BODY');
    editor.settings.forced_root_block = 'p';
  });

  suite.test('Enter inside empty li in the middle of ol', function (editor) {
    editor.getBody().innerHTML = '<ol><li>a</li><li><br></li><li>b</li></ol>';
    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);
    pressEnter(editor);
    LegacyUnit.equal(editor.getContent(), '<ol><li>a</li></ol><p>\u00a0</p><ol><li>b</li></ol>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  // Nested lists in LI elements

  suite.test('Enter inside empty LI in beginning of OL in LI', function (editor) {
    editor.getBody().innerHTML = trimBrsOnIE(
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li><br></li>' +
      '<li>a</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li li', 0);
    editor.focus();
    pressEnter(editor);

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li>a</li>' +
      '<li>' +
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('Enter inside empty LI in middle of OL in LI', function (editor) {
    editor.getBody().innerHTML = trimBrsOnIE(
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>a</li>' +
      '<li><br></li>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li li:nth-child(2)', 0);
    editor.focus();
    pressEnter(editor);

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '</li>' +
      '<li>\u00a0' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('Enter inside empty LI in end of OL in LI', function (editor) {
    editor.getBody().innerHTML = trimBrsOnIE(
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>a</li>' +
      '<li><br></li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li li:last', 0);
    editor.focus();
    pressEnter(editor);

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '</li>' +
      '<li>\u00a0</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  // Nested lists in OL elements

  suite.test('Enter before nested list', function (editor) {
    editor.getBody().innerHTML = trimBrsOnIE(
      '<ol>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ol > li', 1);
    editor.focus();
    pressEnter(editor);

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li>a</li>' +
      '<li>\u00a0' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('Enter inside empty LI in beginning of OL in OL', function (editor) {
    editor.getBody().innerHTML = trimBrsOnIE(
      '<ol>' +
      '<li>a</li>' +
      '<ol>' +
      '<li><br></li>' +
      '<li>a</li>' +
      '</ol>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ol ol li', 0);
    editor.focus();
    pressEnter(editor);

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li>a</li>' +
      '<li>\u00a0</li>' +
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('Enter inside empty LI in middle of OL in OL', function (editor) {
    editor.getBody().innerHTML = trimBrsOnIE(
      '<ol>' +
      '<li>a</li>' +
      '<ol>' +
      '<li>a</li>' +
      '<li><br></li>' +
      '<li>b</li>' +
      '</ol>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ol ol li:nth-child(2)', 0);
    editor.focus();
    pressEnter(editor);

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li>a</li>' +
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '<li>\u00a0</li>' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('Enter inside empty LI in end of OL in OL', function (editor) {
    editor.getBody().innerHTML = trimBrsOnIE(
      '<ol>' +
      '<li>a</li>' +
      '<ol>' +
      '<li>a</li>' +
      '<li><br></li>' +
      '</ol>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ol ol li:last', 0);
    editor.focus();
    pressEnter(editor);

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li>a</li>' +
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '<li>\u00a0</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('Enter at beginning of first DT inside DL', function (editor) {
    editor.getBody().innerHTML = '<dl><dt>a</dt></dl>';
    LegacyUnit.setSelection(editor, 'dt', 0);
    pressEnter(editor);
    LegacyUnit.equal(editor.getContent(), '<dl><dt>\u00a0</dt><dt>a</dt></dl>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'DT');
  });

  suite.test('Enter at beginning of first DD inside DL', function (editor) {
    editor.getBody().innerHTML = '<dl><dd>a</dd></dl>';
    LegacyUnit.setSelection(editor, 'dd', 0);
    pressEnter(editor);
    LegacyUnit.equal(editor.getContent(), '<dl><dd>\u00a0</dd><dd>a</dd></dl>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'DD');
  });

  suite.test('Enter at beginning of middle DT inside DL', function (editor) {
    editor.getBody().innerHTML = '<dl><dt>a</dt><dt>b</dt><dt>c</dt></dl>';
    LegacyUnit.setSelection(editor, 'dt:nth-child(2)', 0);
    pressEnter(editor);
    LegacyUnit.equal(editor.getContent(), '<dl><dt>a</dt><dt>\u00a0</dt><dt>b</dt><dt>c</dt></dl>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'DT');
  });

  suite.test('Enter at beginning of middle DD inside DL', function (editor) {
    editor.getBody().innerHTML = '<dl><dd>a</dd><dd>b</dd><dd>c</dd></dl>';
    LegacyUnit.setSelection(editor, 'dd:nth-child(2)', 0);
    pressEnter(editor);
    LegacyUnit.equal(editor.getContent(), '<dl><dd>a</dd><dd>\u00a0</dd><dd>b</dd><dd>c</dd></dl>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'DD');
  });

  suite.test('Enter at end of last DT inside DL', function (editor) {
    editor.getBody().innerHTML = '<dl><dt>a</dt></dl>';
    LegacyUnit.setSelection(editor, 'dt', 1);
    pressEnter(editor);
    LegacyUnit.equal(editor.getContent(), '<dl><dt>a</dt><dt>\u00a0</dt></dl>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'DT');
  });

  suite.test('Enter at end of last DD inside DL', function (editor) {
    editor.getBody().innerHTML = '<dl><dd>a</dd></dl>';
    LegacyUnit.setSelection(editor, 'dd', 1);
    pressEnter(editor);
    LegacyUnit.equal(editor.getContent(), '<dl><dd>a</dd><dd>\u00a0</dd></dl>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'DD');
  });

  suite.test('Enter at end of last empty DT inside DL', function (editor) {
    editor.getBody().innerHTML = '<dl><dt>a</dt><dt></dt></dl>';
    LegacyUnit.setSelection(editor, 'dt:nth-child(2)', 0);
    pressEnter(editor);
    LegacyUnit.equal(editor.getContent(), '<dl><dt>a</dt></dl><p>\u00a0</p>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('Enter at end of last empty DD inside DL', function (editor) {
    editor.getBody().innerHTML = '<dl><dd>a</dd><dd></dd></dl>';
    LegacyUnit.setSelection(editor, 'dd:nth-child(2)', 0);
    pressEnter(editor);
    LegacyUnit.equal(editor.getContent(), '<dl><dd>a</dd></dl><p>\u00a0</p>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('Enter at beginning of P inside LI', function (editor) {
    editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor);
    LegacyUnit.equal(editor.getContent(), '<ol><li>\u00a0</li><li><p>abcd</p></li></ol>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('Enter inside middle of P inside LI', function (editor) {
    editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
    LegacyUnit.setSelection(editor, 'p', 2);
    pressEnter(editor);
    LegacyUnit.equal(editor.getContent(), '<ol><li><p>ab</p></li><li><p>cd</p></li></ol>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('Enter at end of P inside LI', function (editor) {
    editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
    LegacyUnit.setSelection(editor, 'p', 4);
    pressEnter(editor);
    LegacyUnit.equal(editor.getContent(), '<ol><li><p>abcd</p></li><li>\u00a0</li></ol>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('Shift+Enter at beginning of P inside LI', function (editor) {
    editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor, { shiftKey: true });
    LegacyUnit.equal(editor.getContent(), '<ol><li><p><br />abcd</p></li></ol>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('Shift+Enter inside middle of P inside LI', function (editor) {
    editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
    LegacyUnit.setSelection(editor, 'p', 2);
    pressEnter(editor, { shiftKey: true });
    LegacyUnit.equal(editor.getContent(), '<ol><li><p>ab<br />cd</p></li></ol>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('Shift+Enter at end of P inside LI', function (editor) {
    editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
    LegacyUnit.setSelection(editor, 'p', 4);
    pressEnter(editor, { shiftKey: true });
    LegacyUnit.equal(
      editor.getContent(),
      '<ol><li><p>abcd<br /><br /></p></li></ol>'
    );
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('Ctrl+Enter at beginning of P inside LI', function (editor) {
    editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor, { ctrlKey: true });
    LegacyUnit.equal(editor.getContent(), '<ol><li><p>\u00a0</p><p>abcd</p></li></ol>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('Ctrl+Enter inside middle of P inside LI', function (editor) {
    editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
    LegacyUnit.setSelection(editor, 'p', 2);
    pressEnter(editor, { ctrlKey: true });
    LegacyUnit.equal(editor.getContent(), '<ol><li><p>ab</p><p>cd</p></li></ol>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('Ctrl+Enter at end of P inside LI', function (editor) {
    editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
    LegacyUnit.setSelection(editor, 'p', 4);
    pressEnter(editor, { ctrlKey: true });
    LegacyUnit.equal(editor.getContent(), '<ol><li><p>abcd</p><p>\u00a0</p></li></ol>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('Shift+enter in LI when forced_root_block: false', function (editor) {
    editor.settings.forced_root_block = false;
    editor.getBody().innerHTML = '<ul><li>text</li></ul>';
    LegacyUnit.setSelection(editor, 'li', 2);
    pressEnter(editor, { shiftKey: true });
    LegacyUnit.equal(editor.getContent(), '<ul><li>te<br />xt</li></ul>');
    editor.settings.forced_root_block = 'p';
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    disable_nodechange: true,
    schema: 'html5',
    extended_valid_elements: 'div[id|style|contenteditable],span[id|style|contenteditable],#dt,#dd',
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
