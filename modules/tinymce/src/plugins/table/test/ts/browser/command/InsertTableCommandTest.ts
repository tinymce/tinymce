import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { assertTableStructureWithSizes, insertTable } from '../../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.command.InsertTableCommandTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,' +
        'background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce',
    statusbar: false,
    table_header_type: 'cells'
  }, [ Plugin, Theme ], true);

  const assertNumNewUndoLevels = (editor: Editor, expected: number) => {
    // Add one to expected to account for the initial undo level
    assert.lengthOf(editor.undoManager.data, expected + 1, 'Number of new undo levels');
  };

  beforeEach(() => {
    hook.editor().resetContent('');
  });

  it('TBA: Try to insert table with incorrect data', () => {
    const editor = hook.editor();
    insertTable(editor, { incorrect: 'data' });
    assertNumNewUndoLevels(editor, 0);
    TinyAssertions.assertContent(editor, '');
  });

  it('TBA: Try to insert table with incorrect rows value', () => {
    const editor = hook.editor();
    insertTable(editor, { rows: 'two' });
    assertNumNewUndoLevels(editor, 0);
    TinyAssertions.assertContent(editor, '');
  });

  it('TBA: Insert table 2x2', () => {
    const editor = hook.editor();
    insertTable(editor, { rows: 2, columns: 2 });
    assertTableStructureWithSizes(editor, 2, 2, '%', 100, [
      [ 50, 50 ],
      [ 50, 50 ]
    ], false);
    assertNumNewUndoLevels(editor, 1);
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0 ], 0);
  });

  it('TBA: Insert table 2x2 with 1 header row', () => {
    const editor = hook.editor();
    insertTable(editor, { rows: 2, columns: 2, options: { headerRows: 1 }});
    assertTableStructureWithSizes(editor, 2, 2, '%', 100, [
      [ 50, 50 ],
      [ 50, 50 ]
    ], false, { headerRows: 1, headerCols: 0 });
    assertNumNewUndoLevels(editor, 1);
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0 ], 0);
  });

  it('TBA: Insert table 2x2 with 1 header column', () => {
    const editor = hook.editor();
    insertTable(editor, { rows: 2, columns: 2, options: { headerColumns: 1 }});
    assertTableStructureWithSizes(editor, 2, 2, '%', 100, [
      [ 50, 50 ],
      [ 50, 50 ]
    ], false, { headerRows: 0, headerCols: 1 });
    assertNumNewUndoLevels(editor, 1);
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0 ], 0);
  });

  it('TBA: Insert table 2x2 with 1 header row and 1 header column', () => {
    const editor = hook.editor();
    insertTable(editor, { rows: 2, columns: 2, options: { headerRows: 1, headerColumns: 1 }});
    assertTableStructureWithSizes(editor, 2, 2, '%', 100, [
      [ 50, 50 ],
      [ 50, 50 ]
    ], false, { headerRows: 1, headerCols: 1 });
    assertNumNewUndoLevels(editor, 1);
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0 ], 0);
  });

  it('TBA: Insert table 2x2 with 2 header rows and 2 header columns', () => {
    const editor = hook.editor();
    insertTable(editor, { rows: 2, columns: 2, options: { headerRows: 2, headerColumns: 2 }});
    assertTableStructureWithSizes(editor, 2, 2, '%', 100, [
      [ 50, 50 ],
      [ 50, 50 ]
    ], false, { headerRows: 2, headerCols: 2 });
    assertNumNewUndoLevels(editor, 1);
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0 ], 0);
  });

  it('TBA: Insert table 2x2 with 3 header rows and 3 header columns - should only get 2', () => {
    const editor = hook.editor();
    insertTable(editor, { rows: 2, columns: 2, options: { headerRows: 3, headerColumns: 3 }});
    assertTableStructureWithSizes(editor, 2, 2, '%', 100, [
      [ 50, 50 ],
      [ 50, 50 ]
    ], false, { headerRows: 2, headerCols: 2 });
    assertNumNewUndoLevels(editor, 1);
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0 ], 0);
  });
});
