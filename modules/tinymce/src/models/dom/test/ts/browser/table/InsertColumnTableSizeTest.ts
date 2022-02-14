import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SelectorFind } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import * as TableTestUtils from '../../module/table/TableTestUtils';

interface Scenario {
  readonly html: string;
}

describe('browser.tinymce.models.dom.table.InsertColumnTableSizeTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    width: 400,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const emptyTable = {
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
            '</table>'
  };

  const contentsInSomeCells = {
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
          '</table>'
  };

  const contentsInAllCells = {
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
          '</table>'
  };

  const tableWithHeadings = {
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
          '</table>'
  };

  const tableWithCaption = {
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
          '</table>'
  };

  const nestedTables = {
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
          '</table>'
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

  const pInsertColumnMeasureWidth = async (editor: Editor, scenario: Scenario) => {
    const table = insertTable(editor, scenario.html);
    await TableTestUtils.pDragHandle(editor, 'se', -100, 0);
    const widthBefore = TableTestUtils.getWidths(editor, table.dom);
    TableTestUtils.insertColumnBefore(editor);
    TableTestUtils.insertColumnAfter(editor);
    TableTestUtils.deleteColumn(editor);
    const widthAfter = TableTestUtils.getWidths(editor, table.dom);
    return {
      widthBefore,
      widthAfter
    };
  };

  const pInsertColumnAssertWidth = async (scenario: Scenario) => {
    const widths = await pInsertColumnMeasureWidth(hook.editor(), scenario);
    TableTestUtils.assertWidths(widths);
  };

  context('Insert columns, erase column and assert the table width does not change', () => {
    it('table which is empty', () => pInsertColumnAssertWidth(emptyTable));

    it('table with contents in some cells', () => pInsertColumnAssertWidth(contentsInSomeCells));

    it('table with contents in all cells', () => pInsertColumnAssertWidth(contentsInAllCells));

    it('table with headings', () => pInsertColumnAssertWidth(tableWithHeadings));

    it('table with caption', () => pInsertColumnAssertWidth(tableWithCaption));

    it('table with nested tables', () => pInsertColumnAssertWidth(nestedTables));
  });
});
