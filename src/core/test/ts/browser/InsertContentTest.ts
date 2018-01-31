import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import InsertContent from 'tinymce/core/InsertContent';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.InsertContentTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Theme();

  const assertSelection = function (editor, selector, offset) {
    const node = editor.$(selector)[0];
    const rng = editor.selection.getRng();

    LegacyUnit.equalDom(rng.startContainer, node.firstChild);
    LegacyUnit.equal(rng.startOffset, offset);
    LegacyUnit.equal(rng.collapsed, true);
  };

  suite.test('insertAtCaret - i inside text, converts to em', function (editor) {
    editor.setContent('<p>1234</p>');
    editor.focus();
    LegacyUnit.setSelection(editor, 'p', 2);
    InsertContent.insertAtCaret(editor, '<i>a</i>');
    LegacyUnit.equal(editor.getContent(), '<p>12<em>a</em>34</p>');
  });

  suite.test('insertAtCaret - ul at beginning of li', function (editor) {
    editor.setContent('<ul><li>12</li></ul>');
    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 0);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li></ul>', paste: true });
    LegacyUnit.equal(editor.getContent(), '<ul><li>a</li><li>12</li></ul>');
    assertSelection(editor, 'li:nth-child(2)', 0);
  });

  suite.test('insertAtCaret - ul with multiple items at beginning of li', function (editor) {
    editor.setContent('<ul><li>12</li></ul>');
    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 0);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li><li>b</li></ul>', paste: true });
    LegacyUnit.equal(editor.getContent(), '<ul><li>a</li><li>b</li><li>12</li></ul>');
    assertSelection(editor, 'li:nth-child(3)', 0);
  });

  suite.test('insertAtCaret - ul at end of li', function (editor) {
    editor.setContent('<ul><li>12</li></ul>');
    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 2);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li></ul>', paste: true });
    LegacyUnit.equal(editor.getContent(), '<ul><li>12</li><li>a</li></ul>');
    assertSelection(editor, 'li:nth-child(2)', 1);
  });

  suite.test('insertAtCaret - ul with multiple items at end of li', function (editor) {
    editor.setContent('<ul><li>12</li></ul>');
    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 2);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li><li>b</li><li>c</li></ul>', paste: true });
    LegacyUnit.equal(editor.getContent(), '<ul><li>12</li><li>a</li><li>b</li><li>c</li></ul>');
    assertSelection(editor, 'li:nth-child(4)', 1);
  });

  suite.test('insertAtCaret - ul with multiple items in middle of li', function (editor) {
    editor.setContent('<ul><li>12</li></ul>');
    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 1);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li><li>b</li></ul>', paste: true });
    LegacyUnit.equal(editor.getContent(), '<ul><li>1</li><li>a</li><li>b</li><li>2</li></ul>');
    assertSelection(editor, 'li:nth-child(3)', 1);
  });

  suite.test('insertAtCaret - ul in middle of li with formatting', function (editor) {
    editor.setContent('<ul><li><em><strong>12</strong></em></li></ul>');
    editor.focus();
    LegacyUnit.setSelection(editor, 'strong', 1);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li></ul>', paste: true });
    LegacyUnit.equal(
      editor.getContent(),
      '<ul><li><em><strong>1</strong></em></li><li>a</li><li><em><strong>2</strong></em></li></ul>'
    );
    assertSelection(editor, 'li:nth-child(2)', 1);
  });

  suite.test('insertAtCaret - ul with trailing empty block in middle of li', function (editor) {
    editor.setContent('<ul><li>a</li><li>d</li></ul>');
    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(1)', 1);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>b</li><li>c</li></ul><p>\u00a0</p>', paste: true });
    LegacyUnit.equal(
      editor.getContent(),
      '<ul><li>a</li><li>b</li><li>c</li><li>d</li></ul>'
    );
    assertSelection(editor, 'li:nth-child(3)', 1);
  });

  suite.test('insertAtCaret - ul at beginning of li with empty end li', function (editor) {
    editor.setContent('<ul><li>12</li></ul>');
    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 0);
    InsertContent.insertAtCaret(editor, { content: '<ul><li>a</li><li></li></ul>', paste: true });
    LegacyUnit.equal(editor.getContent(), '<ul><li>a</li><li>12</li></ul>');
    assertSelection(editor, 'li:nth-child(2)', 0);
  });

  suite.test('insertAtCaret - merge inline elements', function (editor) {
    editor.setContent('<strong><em>abc</em></strong>');
    editor.focus();
    LegacyUnit.setSelection(editor, 'em', 1);
    InsertContent.insertAtCaret(editor, { content: '<em><strong>123</strong></em>', merge: true });
    LegacyUnit.equal(editor.getContent(), '<p><strong><em>a123bc</em></strong></p>');
  });

  suite.test('insertAtCaret - list into empty table cell with invalid contents #TINY-1231', function (editor) {
    editor.getBody().innerHTML = '<table class="mce-item-table"><tbody><tr><td><br></td></tr></tbody></table>';
    editor.focus();
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('td')[0], 0);
    rng.setEnd(editor.dom.select('td')[0], 0);
    editor.selection.setRng(rng);
    InsertContent.insertAtCaret(editor, { content: '<meta http-equiv="content-type" content="text/html; charset=utf-8"><ul><li>a</li></ul>', paste: true });
    LegacyUnit.equal(editor.getBody().innerHTML, '<table class="mce-item-table"><tbody><tr><td><ul><li>a</li></ul></td></tr></tbody></table>');
    assertSelection(editor, 'li', 1);
  });

  suite.test('insertAtCaret - empty paragraph pad the empty element with br on insert and nbsp on save', function (editor) {
    editor.setContent('<p>ab</p>');
    editor.focus();
    LegacyUnit.setSelection(editor, 'p', 1);
    InsertContent.insertAtCaret(editor, { content: '<p></p>', merge: true });
    LegacyUnit.equal(editor.getContent({ format: 'raw' }), '<p>a</p><p><br data-mce-bogus="1"></p><p>b</p>');
    LegacyUnit.equal(editor.getContent(), '<p>a</p><p>\u00a0</p><p>b</p>');
  });

  suite.test('insertAtCaret prevent default of beforeSetContent', function (editor) {
    let args;

    const handler = function (e) {
      if (e.selection === true) {
        e.preventDefault();
        e.content = '<h1>b</h1>';
        editor.getBody().innerHTML = '<h1>c</h1>';
      }
    };

    const collector = function (e) {
      args = e;
    };

    editor.on('BeforeSetContent', handler);
    editor.on('SetContent', collector);

    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 0);
    InsertContent.insertAtCaret(editor, { content: '<p>b</p>', paste: true });
    LegacyUnit.equal(editor.getContent(), '<h1>c</h1>');
    LegacyUnit.equal(args.content, '<h1>b</h1>');
    LegacyUnit.equal(args.type, 'setcontent');
    LegacyUnit.equal(args.paste, true);

    editor.off('BeforeSetContent', handler);
    editor.on('BeforeSetContent', collector);
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
