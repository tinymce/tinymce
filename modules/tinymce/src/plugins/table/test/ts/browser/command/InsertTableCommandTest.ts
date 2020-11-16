import { Log, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { sAssertTableStructureWithSizes, sInsertTable } from '../../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.command.InsertTableCommandTest', (success, failure) => {
  Plugin();
  SilverTheme();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const sResetContent = Step.sync(() => editor.resetContent(''));
    const sAssertNumNewUndoLevels = (expected: number) => Step.sync(() => {
      Assert.eq('Number of new undo levels', expected, editor.undoManager.data.length - 1);
    });

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Table: Try to insert table with incorrect data', [
        sResetContent,
        sInsertTable(editor, { incorrect: 'data' }),
        sAssertNumNewUndoLevels(0),
        tinyApis.sAssertContent('')
      ]),
      Log.stepsAsStep('TBA', 'Table: Try to insert table with incorrect rows value', [
        sResetContent,
        sInsertTable(editor, { rows: 'two' }),
        sAssertNumNewUndoLevels(0),
        tinyApis.sAssertContent('')
      ]),
      Log.stepsAsStep('TBA', 'Table: Insert table 2x2', [
        sResetContent,
        sInsertTable(editor, { rows: 2, columns: 2 }),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ], false),
        sAssertNumNewUndoLevels(1),
        tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TBA', 'Table: Insert table 2x2 with 1 header row', [
        sResetContent,
        sInsertTable(editor, { rows: 2, columns: 2, options: { headerRows: 1 }}),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ], false, { headerRows: 1, headerCols: 0 }),
        sAssertNumNewUndoLevels(1),
        tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TBA', 'Table: Insert table 2x2 with 1 header column', [
        sResetContent,
        sInsertTable(editor, { rows: 2, columns: 2, options: { headerColumns: 1 }}),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ], false, { headerRows: 0, headerCols: 1 }),
        sAssertNumNewUndoLevels(1),
        tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TBA', 'Table: Insert table 2x2 with 1 header row and 1 header column', [
        sResetContent,
        sInsertTable(editor, { rows: 2, columns: 2, options: { headerRows: 1, headerColumns: 1 }}),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ], false, { headerRows: 1, headerCols: 1 }),
        sAssertNumNewUndoLevels(1),
        tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TBA', 'Table: Insert table 2x2 with 2 header rows and 2 header columns', [
        sResetContent,
        sInsertTable(editor, { rows: 2, columns: 2, options: { headerRows: 2, headerColumns: 2 }}),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ], false, { headerRows: 2, headerCols: 2 }),
        sAssertNumNewUndoLevels(1),
        tinyApis.sAssertSelection([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TBA', 'Table: Insert table 2x2 with 3 header rows and 3 header columns - should only get 2', [
        sResetContent,
        sInsertTable(editor, { rows: 2, columns: 2, options: { headerRows: 3, headerColumns: 3 }}),
        sAssertTableStructureWithSizes(editor, 2, 2, '%', 100, [
          [ 50, 50 ],
          [ 50, 50 ]
        ], false, { headerRows: 2, headerCols: 2 }),
        sAssertNumNewUndoLevels(1),
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
