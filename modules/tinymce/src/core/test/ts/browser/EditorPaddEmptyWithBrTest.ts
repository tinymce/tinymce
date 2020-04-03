import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.EditorPaddEmptyWithBrTest', (success, failure) => {
  const suite = LegacyUnit.createSuite<Editor>();

  Theme();

  suite.test('Padd empty elements with br', (editor) => {
    editor.setContent('<p>a</p><p></p>');
    LegacyUnit.equal(editor.getContent(), '<p>a</p><p><br /></p>');
  });

  suite.test('Padd empty elements with br on insert at caret', (editor) => {
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.insertContent('<p>b</p><p></p>');
    LegacyUnit.equal(editor.getContent(), '<p>a</p><p>b</p><p><br /></p>');
  });

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    Pipeline.async({}, suite.toSteps(editor), () => {
      onSuccess();
    }, onFailure);
  }, {
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    custom_elements: 'custom1,~custom2',
    extended_valid_elements: 'custom1,custom2,script[*]',
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    padd_empty_with_br: true
  }, success, failure);
});
