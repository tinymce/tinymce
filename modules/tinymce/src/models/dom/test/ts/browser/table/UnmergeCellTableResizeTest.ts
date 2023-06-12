import { Keys, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';
import { TinyContentActions, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import * as TableTestUtils from '../../module/table/TableTestUtils';

interface Scenario {
  readonly html: string;
  readonly select: (editor: Editor) => void;
}

describe('browser.tinymce.models.dom.table.UnmergeCellTableResizeTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    width: 400,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const emptyTable: Scenario = {
    html: '<table style = "width: 100%;">' +
            '<tbody>' +
              '<tr>' +
                '<td></td>' +
                '<td></td>' +
              '</tr>' +
              '<tr>' +
                '<td></td>' +
                '<td></td>' +
              '</tr>' +
            '</tbody>' +
            '</table>',

    select: (editor) => {
      TinyContentActions.keydown(editor, Keys.down(), { shift: true });
    }
  };

  const contentsInSomeCells: Scenario = {
    html: '<table style = "width: 100%;">' +
            '<tbody>' +
              '<tr>' +
                '<td>a1</td>' +
                '<td>b1</td>' +
              '</tr>' +
              '<tr>' +
                '<td></td>' +
                '<td></td>' +
              '</tr>' +
            '</tbody>' +
          '</table>',

    select: (editor) => {
      TinyContentActions.keydown(editor, Keys.down(), { shift: true });
    }
  };

  const contentsInAllCells: Scenario = {
    html: '<table style = "width: 100%;">' +
            '<tbody>' +
              '<tr>' +
                '<td>a1</td>' +
                '<td>b1</td>' +
              '</tr>' +
              '<tr>' +
                '<td>a2</td>' +
                '<td>b2</td>' +
              '</tr>' +
              '<tr>' +
                '<td>a3</td>' +
                '<td>b3</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>',

    select: (editor) => {
      TinyContentActions.keydown(editor, Keys.down(), { shift: true });
    }
  };

  const tableWithHeadings: Scenario = {
    html: '<table style = "width: 100%;">' +
            '<tbody>' +
              '<tr>' +
                '<th>a1</th>' +
                '<th>b1</th>' +
              '</tr>' +
              '<tr>' +
                '<td>a1</td>' +
                '<td>b1</td>' +
              '</tr>' +
              '<tr>' +
                '<td>a2</td>' +
                '<td>b2</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>',

    select: (editor) => {
      TinyContentActions.keydown(editor, Keys.down());
      TinyContentActions.keydown(editor, Keys.down(), { shift: true });
    }
  };

  const tableWithCaption: Scenario = {
    html: '<table style = "width: 100%;">' +
            '<caption>alphabet</caption>' +
            '<tbody>' +
              '<tr>' +
                '<td>a1</td>' +
                '<td>b1</td>' +
              '</tr>' +
              '<tr>' +
                '<td>a2</td>' +
                '<td>b2</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>',

    select: (editor) => {
      TinyContentActions.keydown(editor, Keys.down(), { shift: true });
    }
  };

  const nestedTables: Scenario = {
    html: '<table style = "width: 100%;">' +
            '<tbody>' +
              '<tr>' +
                '<td>a1' +
                  '<table style = "width: 100%;">' +
                  '<tbody>' +
                    '<tr>' +
                      '<td></td>' +
                      '<td></td>' +
                    '</tr>' +
                    '<tr>' +
                      '<td></td>' +
                      '<td></td>' +
                    '</tr>' +
                  '</tbody>' +
                  '</table>' +
                '</td>' +
                '<td>b1</td>' +
              '</tr>' +
              '<tr>' +
                '<td>a2</td>' +
                '<td>b2</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>',

    select: (editor) => {
      TinyContentActions.keydown(editor, Keys.down(), { shift: true });
    }
  };

  const singleCell: Scenario = {
    html: '<table style = "width: 100%;">' +
            '<tbody>' +
              '<tr>' +
                '<td>a1</td>' +
                '<td>b1</td>' +
              '</tr>' +
              '<tr>' +
                '<td>a2</td>' +
                '<td>b2</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>',

    select: Fun.noop
  };

  const selectedRow: Scenario = {
    html: '<table style = "width: 100%;">' +
            '<tbody>' +
              '<tr>' +
                '<td>a1</td>' +
                '<td>b1</td>' +
              '</tr>' +
              '<tr>' +
                '<td>a2</td>' +
                '<td>b2</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>',

    select: (editor) => {
      TinyContentActions.keydown(editor, Keys.right(), { shift: true });
    }
  };

  const mergeWholeTable: Scenario = {
    html: '<table style = "width: 100%;">' +
            '<tbody>' +
              '<tr>' +
                '<td>a1</td>' +
                '<td>b1</td>' +
              '</tr>' +
              '<tr>' +
                '<td>a2</td>' +
                '<td>b2</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>',

    select: (editor) => {
      TinyContentActions.keydown(editor, Keys.down(), { shift: true });
      TinyContentActions.keydown(editor, Keys.right(), { shift: true });
    }
  };

  const mergeResizeSplit: Scenario = {
    html: '<table style = "width: 100%;">' +
            '<tbody>' +
              '<tr>' +
                '<td>a1</td>' +
                '<td>b1</td>' +
              '</tr>' +
              '<tr>' +
                '<td>a2</td>' +
                '<td>b2</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>',

    select: (editor) => {
      TinyContentActions.keydown(editor, Keys.down(), { shift: true });
    }
  };

  const insertTable = (editor: Editor, table: string) => {
    editor.setContent(table);
    const bodyElem = TinyDom.body(editor);
    const tableElem = UiFinder.findIn<HTMLTableElement>(bodyElem, 'table').getOrDie();
    SelectorFind.descendant(tableElem, 'td,th').each((cell) => {
      editor.selection.select(cell.dom, true);
      editor.selection.collapse(true);
    });
    return tableElem;
  };

  const pUnmergeCellsMeasureTableWidth = async (editor: Editor, scenario: Scenario) => {
    editor.focus();
    const table = insertTable(editor, scenario.html);
    await TableTestUtils.pDragHandle(editor, 'se', -100, 0);
    const widthBefore = TableTestUtils.getWidths(editor, table.dom);
    TableTestUtils.mergeCells(editor, scenario.select);
    TableTestUtils.splitCells(editor);
    const widthAfter = TableTestUtils.getWidths(editor, table.dom);
    return {
      widthBefore,
      widthAfter
    };
  };

  const pMergeResizeUnmergeMeasureWidth = async (editor: Editor, scenario: Scenario) => {
    const table = insertTable(editor, scenario.html);
    await TableTestUtils.pDragHandle(editor, 'se', -100, 0);
    TableTestUtils.mergeCells(editor, scenario.select);
    await TableTestUtils.pDragHandle(editor, 'se', -100, 0);
    const widthBefore = TableTestUtils.getWidths(editor, table.dom);
    TableTestUtils.splitCells(editor);
    const widthAfter = TableTestUtils.getWidths(editor, table.dom);
    return {
      widthBefore,
      widthAfter
    };
  };

  const pUnmergeCellsAssertWidth = async (scenario: Scenario) => {
    const widths = await pUnmergeCellsMeasureTableWidth(hook.editor(), scenario);
    TableTestUtils.assertWidths(widths);
  };

  const pMergeResizeSplitAssertWidth = async (scenario: Scenario) => {
    const widths = await pMergeResizeUnmergeMeasureWidth(hook.editor(), scenario);
    TableTestUtils.assertWidths(widths);
  };

  context('Resize table, merge and split cells, assert the table width does not change', () => {
    it('table which is empty', () => pUnmergeCellsAssertWidth(emptyTable));

    it('table with contents content in some cells', () => pUnmergeCellsAssertWidth(contentsInSomeCells));

    it('table with contents in all cells', () => pUnmergeCellsAssertWidth(contentsInAllCells));

    it('table with headings', () => pUnmergeCellsAssertWidth(tableWithHeadings));

    it('table with caption', () => pUnmergeCellsAssertWidth(tableWithCaption));

    it('table with nested tables', () => pUnmergeCellsAssertWidth(nestedTables));

    it('table with an entire row merged and split', () => pUnmergeCellsAssertWidth(selectedRow));

    it('table with one selected cell', () => pUnmergeCellsAssertWidth(singleCell));

    it('table with whole table merged and split', () => pUnmergeCellsAssertWidth(mergeWholeTable));

    it('table resized after merge and then split', () => pMergeResizeSplitAssertWidth(mergeResizeSplit));
  });
});
