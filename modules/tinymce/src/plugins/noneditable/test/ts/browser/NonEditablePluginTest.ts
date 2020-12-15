import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/noneditable/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.noneditable.NonEditablePluginTest', (success, failure) => {
  const suite = LegacyUnit.createSuite<Editor>();

  Plugin();
  Theme();

  suite.test('TestCase-TBA: NonEditable: noneditable class', (editor) => {
    editor.setContent('<p><span class="mceNonEditable">abc</span></p>');
    LegacyUnit.equal(editor.dom.select('span')[0].contentEditable, 'false');
  });

  suite.test('TestCase-TBA: NonEditable: editable class', (editor) => {
    editor.setContent('<p><span class="mceEditable">abc</span></p>');
    LegacyUnit.equal(editor.dom.select('span')[0].contentEditable, 'true');
  });

  suite.test('TestCase-TBA: NonEditable: noneditable regexp', (editor) => {
    editor.setContent('<p>{test1}{test2}</p>');

    LegacyUnit.equal(editor.dom.select('span').length, 2);
    LegacyUnit.equal(editor.dom.select('span')[0].contentEditable, 'false');
    LegacyUnit.equal(editor.dom.select('span')[1].contentEditable, 'false');
    LegacyUnit.equal(editor.getContent(), '<p>{test1}{test2}</p>');
  });

  suite.test('TestCase-TBA: NonEditable: noneditable regexp inside cE=false', (editor) => {
    editor.setContent('<span contenteditable="false">{test1}</span>');
    LegacyUnit.equal(editor.dom.select('span').length, 1);
  });

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    Pipeline.async({}, Log.steps('TBA', 'NonEditable: Test noneditable class and regexp', suite.toSteps(editor)), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    indent: false,
    noneditable_regexp: [ /\{[^\}]+\}/g ],
    plugins: 'noneditable',
    entities: 'raw',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
