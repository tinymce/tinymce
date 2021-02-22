import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks } from '@ephox/mcagar';
import { SelectorFind } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import * as TableTestUtils from '../module/test/TableTestUtils';

interface Scenario {
  readonly html: string;
}

describe('browser.tinymce.plugins.table.InsertRowTableResizeTest', () => {
  let objectResizedCounter = 0;
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'table',
    width: 400,
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor) => {
      editor.on('ObjectResized', () => objectResizedCounter++);
    }
  }, [ Plugin, Theme ], true);

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
    const bodyElem = TinyDom.fromDom(editor.getBody());
    const tableElem = UiFinder.findIn(bodyElem, 'table').getOr(bodyElem);
    SelectorFind.descendant(tableElem, 'td,th').each((cell) => {
      editor.selection.select(cell.dom, true);
      editor.selection.collapse(true);
    });
    return tableElem;
  };

  const insertRowMeasureWidth = (editor: Editor, scenario: Scenario) => {
    const table = insertTable(editor, scenario.html);
    const widthBefore = TableTestUtils.getWidths(editor, table.dom);
    const cellWidthBefore = TableTestUtils.getCellWidth(editor, table, 0, 0);
    TableTestUtils.insertRowBefore(editor);
    TableTestUtils.insertRowAfter(editor);
    TableTestUtils.deleteRow(editor);
    const widthAfter = TableTestUtils.getWidths(editor, table.dom);
    const cellWidthAfter = TableTestUtils.getCellWidth(editor, table, 0, 0);
    return {
      widthBefore,
      widthAfter,
      cellWidthBefore,
      cellWidthAfter
    };
  };

  const insertRowAssertWidth = (scenario: Scenario) => {
    const widths = insertRowMeasureWidth(hook.editor(), scenario);
    TableTestUtils.assertWidths(widths);
    assert.deepEqual(widths.cellWidthAfter, widths.cellWidthBefore, 'table cell widths should not change');
    assert.equal(objectResizedCounter, 0, 'ObjectResized shouldn\'t have fired');
  };

  context('Insert rows, erase row and assert the table width and cell widths does not change', () => {
    it('table which is empty', () => insertRowAssertWidth(emptyTable));

    it('table with contents in some cells', () => insertRowAssertWidth(contentsInSomeCells));

    it('table with contents in all cells', () => insertRowAssertWidth(contentsInAllCells));

    it('table with headings', () => insertRowAssertWidth(tableWithHeadings));

    it('table with caption', () => insertRowAssertWidth(tableWithCaption));

    it('table with nested tables', () => insertRowAssertWidth(nestedTables));
  });
});
