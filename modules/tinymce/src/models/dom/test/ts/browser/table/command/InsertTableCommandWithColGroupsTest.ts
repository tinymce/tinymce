import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import * as TableTestUtils from '../../../module/table/TableTestUtils';

describe('browser.tinymce.models.dom.table.command.InsertTableCommandWithColGroupsTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,' +
        'background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce',
    statusbar: false,
    table_header_type: 'cells',
    table_use_colgroups: true
  }, []);

  beforeEach(() => {
    hook.editor().setContent('');
  });

  it('TINY-6050: Try to insert table with incorrect data', () => {
    const editor = hook.editor();
    TableTestUtils.insertTable(editor, { incorrect: 'data' });
    TinyAssertions.assertContent(editor, '');
  });

  it('TINY-6050: Try to insert table with incorrect rows value', () => {
    const editor = hook.editor();
    TableTestUtils.insertTable(editor, { rows: 'two' });
    TinyAssertions.assertContent(editor, '');
  });

  it('TINY-6050: Insert table 2x2', () => {
    const editor = hook.editor();
    TableTestUtils.insertTable(editor, { rows: 2, columns: 2 });
    TableTestUtils.assertTableStructureWithSizes(editor, 2, 2, '%', 100, [
      [ 50, 50 ],
      [ 50, 50 ]
    ], true);
    TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 0);
  });

  it('TINY-6050: Insert table 2x2 with 1 header row', () => {
    const editor = hook.editor();
    TableTestUtils.insertTable(editor, { rows: 2, columns: 2, options: { headerRows: 1 }});
    TableTestUtils.assertTableStructureWithSizes(editor, 2, 2, '%', 100, [
      [ 50, 50 ],
      [ 50, 50 ]
    ], true, { headerRows: 1, headerCols: 0 });
    TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 0);
  });

  it('TINY-6050: Insert table 2x2 with 1 header column', () => {
    const editor = hook.editor();
    TableTestUtils.insertTable(editor, { rows: 2, columns: 2, options: { headerColumns: 1 }});
    TableTestUtils.assertTableStructureWithSizes(editor, 2, 2, '%', 100, [
      [ 50, 50 ],
      [ 50, 50 ]
    ], true, { headerRows: 0, headerCols: 1 });
    TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 0);
  });

  it('TINY-6050: Insert table 2x2 with 1 header row and 1 header column', () => {
    const editor = hook.editor();
    TableTestUtils.insertTable(editor, { rows: 2, columns: 2, options: { headerRows: 1, headerColumns: 1 }});
    TableTestUtils.assertTableStructureWithSizes(editor, 2, 2, '%', 100, [
      [ 50, 50 ],
      [ 50, 50 ]
    ], true, { headerRows: 1, headerCols: 1 });
    TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 0);
  });

  it('TINY-6050: Insert table 2x2 with 2 header rows and 2 header columns', () => {
    const editor = hook.editor();
    TableTestUtils.insertTable(editor, { rows: 2, columns: 2, options: { headerRows: 2, headerColumns: 2 }});
    TableTestUtils.assertTableStructureWithSizes(editor, 2, 2, '%', 100, [
      [ 50, 50 ],
      [ 50, 50 ]
    ], true, { headerRows: 2, headerCols: 2 });
    TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 0);
  });

  it('TINY-6050: Insert table 2x2 with 3 header rows and 3 header columns - should only get 2', () => {
    const editor = hook.editor();
    editor.setContent('');
    TableTestUtils.insertTable(editor, { rows: 2, columns: 2, options: { headerRows: 3, headerColumns: 3 }});
    TableTestUtils.assertTableStructureWithSizes(editor, 2, 2, '%', 100, [
      [ 50, 50 ],
      [ 50, 50 ]
    ], true, { headerRows: 2, headerCols: 2 });
    TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 0);
  });
});
