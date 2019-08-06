import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('tinymce.lists.browser.ApplyTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  Plugin();
  Theme();

  suite.test('TestCase-TBA: Lists: Apply DL list to multiple Ps', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<p>a</p>' +
      '<p>b</p>' +
      '<p>c</p>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'p', 0, 'p:last', 0);
    LegacyUnit.execCommand(editor, 'InsertDefinitionList');

    LegacyUnit.equal(editor.getContent(),
      '<dl>' +
      '<dt>a</dt>' +
      '<dt>b</dt>' +
      '<dt>c</dt>' +
      '</dl>'
    );
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'DT');
  });

  suite.test('TestCase-TBA: Lists: Apply OL list to single P', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<p>a</p>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'p', 0);
    LegacyUnit.execCommand(editor, 'InsertDefinitionList');

    LegacyUnit.equal(editor.getContent(), '<dl><dt>a</dt></dl>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'DT');
  });

  suite.test('TestCase-TBA: Lists: Apply DL to P and merge with adjacent lists', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<dl>' +
      '<dt>a</dt>' +
      '</dl>' +
      '<p>b</p>' +
      '<dl>' +
      '<dt>c</dt>' +
      '</dl>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'p', 1);
    LegacyUnit.execCommand(editor, 'InsertDefinitionList');

    LegacyUnit.equal(editor.getContent(),
      '<dl>' +
      '<dt>a</dt>' +
      '<dt>b</dt>' +
      '<dt>c</dt>' +
      '</dl>'
    );
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'DT');
  });

  suite.test('TestCase-TBA: Lists: Indent single DT in DL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<dl>' +
      '<dt>a</dt>' +
      '</dl>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'dt', 0);
    LegacyUnit.execCommand(editor, 'Indent');

    LegacyUnit.equal(editor.getContent(),
      '<dl>' +
      '<dd>a</dd>' +
      '</dl>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'DD');
  });

  suite.test('TestCase-TBA: Lists: Outdent single DD in DL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<dl>' +
      '<dd>a</dd>' +
      '</dl>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'dd', 1);
    LegacyUnit.execCommand(editor, 'Outdent');

    LegacyUnit.equal(editor.getContent(),
      '<dl>' +
      '<dt>a</dt>' +
      '</dl>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'DT');
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, Log.steps('TBA', 'Lists: Apply DL tests', suite.toSteps(editor)), onSuccess, onFailure);
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
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
