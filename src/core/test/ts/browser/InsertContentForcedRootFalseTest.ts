import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import InsertContent from 'tinymce/core/InsertContent';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.InsertContentForcedRootBlockFalseTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Theme();

  const trimBrs = function (string) {
    return string.replace(/<br>/g, '');
  };

  suite.test('insertAtCaret - selected image with bogus div', function (editor) {
    editor.getBody().innerHTML = '<img src="about:blank" /><div data-mce-bogus="all">x</div>';
    editor.focus();
    // editor.selection.setCursorLocation(editor.getBody(), 0);
    editor.selection.select(editor.dom.select('img')[0]);
    InsertContent.insertAtCaret(editor, 'a');
    LegacyUnit.equal(trimBrs(editor.getBody().innerHTML), 'a<div data-mce-bogus="all">x</div>');
  });

  suite.test('insertAtCaret - selected text with bogus div', function (editor) {
    editor.getBody().innerHTML = 'a<div data-mce-bogus="all">x</div>';
    editor.focus();
    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild, 0);
    rng.setEnd(editor.getBody().firstChild, 1);
    editor.selection.setRng(rng);
    InsertContent.insertAtCaret(editor, 'b');
    LegacyUnit.equal(trimBrs(editor.getBody().innerHTML), 'b<div data-mce-bogus="all">x</div>');
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    forced_root_block: false,
    entities: 'raw',
    indent: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
