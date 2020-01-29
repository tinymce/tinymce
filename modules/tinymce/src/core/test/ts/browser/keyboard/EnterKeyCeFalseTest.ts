import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import Theme from 'tinymce/themes/silver/Theme';
import HtmlUtils from '../../module/test/HtmlUtils';

UnitTest.asynctest('browser.tinymce.core.keyboard.EnterKeyCeFalseTest', function (success, failure) {
  const suite = LegacyUnit.createSuite<Editor>();

  Theme();

  const pressEnter = function (editor: Editor, evt?: any) {
    const dom = editor.dom, target = editor.selection.getNode();

    evt = Tools.extend({ keyCode: 13 }, evt);

    dom.fire(target, 'keydown', evt);
    dom.fire(target, 'keypress', evt);
    dom.fire(target, 'keyup', evt);
  };

  suite.test('Enter in text within contentEditable:true h1 inside contentEditable:false div', function (editor) {
    editor.getBody().innerHTML = '<div contenteditable="false"><h1 contenteditable="true">ab</h1></div>';
    LegacyUnit.setSelection(editor, 'div h1', 1);
    pressEnter(editor);
    LegacyUnit.equal(
      HtmlUtils.cleanHtml(editor.getBody().innerHTML),
      '<div contenteditable="false"><h1 contenteditable="true">ab</h1></div>'
    );
  });

  suite.test('Enter before cE=false div', function (editor) {
    editor.getBody().innerHTML = '<div contenteditable="false">x</div>';
    editor.selection.select(editor.dom.select('div')[0]);
    editor.selection.collapse(true);
    pressEnter(editor);
    LegacyUnit.equal(
      HtmlUtils.cleanHtml(editor.getBody().innerHTML),
      '<p><br data-mce-bogus="1"></p><div contenteditable="false">x</div>'
    );
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('Enter after cE=false div', function (editor) {
    editor.getBody().innerHTML = '<div contenteditable="false">x</div>';
    editor.selection.select(editor.dom.select('div')[0]);
    editor.selection.collapse(false);
    pressEnter(editor);
    LegacyUnit.equal(
      HtmlUtils.cleanHtml(editor.getBody().innerHTML),
      '<div contenteditable="false">x</div><p><br data-mce-bogus="1"></p>'
    );
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
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
