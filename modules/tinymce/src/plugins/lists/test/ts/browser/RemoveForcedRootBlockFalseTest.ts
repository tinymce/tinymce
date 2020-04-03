import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('tinymce.lists.browser.RemoveForcedRootBlockFalseTest', (success, failure) => {
  const suite = LegacyUnit.createSuite<Editor>();

  Plugin();
  Theme();

  suite.test('TestCase-TBA: Lists: Remove UL with single LI in BR mode', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 1);
    LegacyUnit.execCommand(editor, 'InsertUnorderedList');

    LegacyUnit.equal(editor.getContent(),
      'a'
    );
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'BODY');
  });

  suite.test('TestCase-TBA: Lists: Remove UL with multiple LI in BR mode', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:first', 1, 'li:last', 1);
    LegacyUnit.execCommand(editor, 'InsertUnorderedList');

    LegacyUnit.equal(editor.getContent(),
      'a<br />' +
      'b'
    );
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'BODY');
  });

  suite.test('TestCase-TBA: Lists: Remove empty UL between two textblocks in BR mode', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<div>a</div>' +
      '<ul>' +
      '<li></li>' +
      '</ul>' +
      '<div>b</div>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:first', 0);
    LegacyUnit.execCommand(editor, 'InsertUnorderedList');

    LegacyUnit.equal(editor.getContent(),
      '<div>a</div>' +
      '<br />' +
      '<div>b</div>'
    );
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'BR');
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, Log.steps('TBA', 'Link: Remove tests', suite.toSteps(editor)), onSuccess, onFailure);
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
    base_url: '/project/tinymce/js/tinymce',
    forced_root_block: false
  }, success, failure);
});
