import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.TabKeyNavigationTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  Plugin();
  SilverTheme();

  suite.test('TestCase-TBA: Table: Tab key navigation', function (editor) {
    editor.focus();

    editor.setContent('<table><tbody><tr><td>A1</td><td>A2</td></tr><tr><td>B1</td><td>B2</td></tr></tbody></table><p>x</p>');

    LegacyUnit.setSelection(editor, 'td', 0);
    editor.fire('keydown', { keyCode: 9 });
    LegacyUnit.equal(editor.selection.getStart().innerHTML, 'A2');

    LegacyUnit.setSelection(editor, 'td', 0);
    editor.fire('keydown', { keyCode: 9, shiftKey: true });
    LegacyUnit.equal(editor.selection.getStart().innerHTML, 'A1');

    LegacyUnit.setSelection(editor, 'td:nth-child(2)', 0);
    editor.fire('keydown', { keyCode: 9, shiftKey: true });
    LegacyUnit.equal(editor.selection.getStart().innerHTML, 'A1');

    LegacyUnit.setSelection(editor, 'tr:nth-child(2) td:nth-child(2)', 0);
    editor.fire('keydown', { keyCode: 9 });
    LegacyUnit.equal(editor.selection.getStart(true).nodeName, 'TD');
    LegacyUnit.equal(
      editor.getContent(),
      '<table><tbody><tr><td>A1</td><td>A2</td></tr><tr><td>B1</td><td>B2' +
      '</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table><p>x</p>'
    );
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, Log.steps('TBA', 'Table: Navigate the table using tab key', suite.toSteps(editor)), onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
