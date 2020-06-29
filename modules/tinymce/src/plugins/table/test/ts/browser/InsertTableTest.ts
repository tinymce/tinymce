import { Log, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';

import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { sAssertTableStructureWithSizes } from '../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.InsertTableTest', (success, failure) => {
  Plugin();
  SilverTheme();

  const sInsertTable = (editor: Editor, cols: number, rows: number) => Logger.t('Insert table ' + cols + 'x' + rows, Step.sync(() => {
    editor.plugins.table.insertTable(cols, rows);
  }));

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Table: Insert table 2x2', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, 2, 2),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ]),
        tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TBA', 'Table: Insert table 1x2', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, 1, 2),
        sAssertTableStructureWithSizes(editor, 1, 2, '%', 100, [
          [ 100 ],
          [ 100 ]
        ]),
        tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TBA', 'Table: Insert table 2x1', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, 2, 1),
        sAssertTableStructureWithSizes(editor, 2, 1, '%', 100, [
          [ 50, 50 ]
        ]),
        tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0)
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,' +
           'background-color,border,padding,border-spacing,border-collapse'
    },
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    statusbar: false
  }, success, failure);
});
