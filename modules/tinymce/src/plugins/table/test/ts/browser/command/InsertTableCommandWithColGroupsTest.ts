import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { sAssertTableStructureWithSizes, sInsertTable } from '../../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.command.InsertTableCommandWithColGroupsTest', (success, failure) => {
  Plugin();
  SilverTheme();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TINY-6050', 'Table: Try to insert table with incorrect data', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, { incorrect: 'data' }),
        tinyApis.sAssertContent('')
      ]),
      Log.stepsAsStep('TINY-6050', 'Table: Try to insert table with incorrect rows value', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, { rows: 'two' }),
        tinyApis.sAssertContent('')
      ]),
      Log.stepsAsStep('TINY-6050', 'Table: Insert table 2x2', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, { rows: 2, columns: 2 }),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ], true),
        tinyApis.sAssertSelection([ 0, 1, 0, 0 ], 0, [ 0, 1, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TINY-6050', 'Table: Insert table 2x2 with 1 header row', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, { rows: 2, columns: 2, options: { headerRows: 1 }}),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ], true, { headerRows: 1, headerCols: 0 }),
        tinyApis.sAssertSelection([ 0, 1, 0, 0 ], 0, [ 0, 1, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TINY-6050', 'Table: Insert table 2x2 with 1 header column', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, { rows: 2, columns: 2, options: { headerColumns: 1 }}),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ], true, { headerRows: 0, headerCols: 1 }),
        tinyApis.sAssertSelection([ 0, 1, 0, 0 ], 0, [ 0, 1, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TINY-6050', 'Table: Insert table 2x2 with 1 header row and 1 header column', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, { rows: 2, columns: 2, options: { headerRows: 1, headerColumns: 1 }}),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ], true, { headerRows: 1, headerCols: 1 }),
        tinyApis.sAssertSelection([ 0, 1, 0, 0 ], 0, [ 0, 1, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TINY-6050', 'Table: Insert table 2x2 with 2 header rows and 2 header columns', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, { rows: 2, columns: 2, options: { headerRows: 2, headerColumns: 2 }}),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ], true, { headerRows: 2, headerCols: 2 }),
        tinyApis.sAssertSelection([ 0, 1, 0, 0 ], 0, [ 0, 1, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TINY-6050', 'Table: Insert table 2x2 with 3 header rows and 3 header columns - should only get 2', [
        tinyApis.sSetContent(''),
        sInsertTable(editor, { rows: 2, columns: 2, options: { headerRows: 3, headerColumns: 3 }}),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ], true, { headerRows: 2, headerCols: 2 }),
        tinyApis.sAssertSelection([ 0, 1, 0, 0 ], 0, [ 0, 1, 0, 0 ], 0)
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
    table_header_type: 'cells',
    table_use_colgroups: true
  }, success, failure);
});
