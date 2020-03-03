import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('tinymce.lists.browser.RemoveForcedRootBlockAttrsTest', (success, failure) => {
  const suite = LegacyUnit.createSuite<Editor>();

  Plugin();
  Theme();

  suite.test('TestCase-TBA: Lists: Remove UL with forced_root_block_attrs', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li data-editor="1">a</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 0);
    LegacyUnit.execCommand(editor, 'InsertUnorderedList');

    LegacyUnit.equal(editor.getContent(),
      '<p data-editor="1">a</p>'
    );
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'P');
  });

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
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
    forced_root_block_attrs: {
      'data-editor': '1'
    }
  }, success, failure);
});
