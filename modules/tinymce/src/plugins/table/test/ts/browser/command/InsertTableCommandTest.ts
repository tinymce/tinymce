import { Log, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { sAssertTableStructureWithSizes } from '../../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.command.InsertTableCommandTest', (success, failure) => {
  Plugin();
  SilverTheme();

  const sInsertTable = (editor, args) => Logger.t('Insert table ', Step.sync(() => editor.execCommand('mceInsertTable', false, args)));

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Table: Try to insert table with incorrect data', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, { incorrect: 'data' }),
        tinyApis.sAssertContent('')
      ]),
      Log.stepsAsStep('TBA', 'Table: Try to insert table with incorrect rows value', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, { rows: 'two' }),
        tinyApis.sAssertContent('')
      ]),
      Log.stepsAsStep('TBA', 'Table: Insert table 2x2', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, { rows: 2, columns: 2 }),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ]),
        tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TBA', 'Table: Insert table 2x2 with 1 header row', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, { rows: 2, columns: 2, options: { headerRows: 1 }}),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ], { headerRows: 1, headerCols: 0 }),
        tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TBA', 'Table: Insert table 2x2 with 1 header column', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, { rows: 2, columns: 2, options: { headerColumns: 1 }}),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ], { headerRows: 0, headerCols: 1 }),
        tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TBA', 'Table: Insert table 2x2 with 1 header row and 1 header column', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, { rows: 2, columns: 2, options: { headerRows: 1, headerColumns: 1 }}),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ], { headerRows: 1, headerCols: 1 }),
        tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TBA', 'Table: Insert table 2x2 with 2 header rows and 2 header columns', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, { rows: 2, columns: 2, options: { headerRows: 2, headerColumns: 2 }}),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ], { headerRows: 2, headerCols: 2 }),
        tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TBA', 'Table: Insert table 2x2 with 3 header rows and 3 header columns - should only get 2', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, { rows: 2, columns: 2, options: { headerRows: 3, headerColumns: 3 }}),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ], { headerRows: 2, headerCols: 2 }),
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
    statusbar: false,
    table_header_type: 'cells'
  }, success, failure);
});
