import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('tinymce.lists.browser.IndentTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  Plugin();
  Theme();

  suite.test('TestCase-TBA: Lists: Remove UL in inline body element contained in LI', function (editor) {
    editor.setContent('<ul><li>a</li></ul>');
    editor.selection.setCursorLocation();
    editor.execCommand('InsertUnorderedList');
    LegacyUnit.equal(editor.getContent(), '<p>a</p>');
  });

  suite.test('TestCase-TBA: Lists: Backspace in LI in UL in inline body element contained within LI', function (editor) {
    editor.setContent('<ul><li>a</li></ul>');
    editor.focus();
    editor.selection.select(editor.getBody(), true);
    editor.selection.collapse(true);
    editor.plugins.lists.backspaceDelete();
    LegacyUnit.equal(editor.getContent(), '<p>a</p>');
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, Log.steps('TBA', 'Lists: Inline tests', suite.toSteps(editor)), onSuccess, onFailure);
  }, {
    inline: true,
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
