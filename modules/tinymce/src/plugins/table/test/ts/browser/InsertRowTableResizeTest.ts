import { Assertions, Chain, Guard, Log, NamedChain, TestLogs, UiFinder } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Editor, TinyDom } from '@ephox/mcagar';
import { SelectorFind } from '@ephox/sugar';

import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import * as TableTestUtils from '../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.InsertRowTableResizeTest', (success, failure) => {

  Plugin();
  SilverTheme();

  interface TestData {
    html: string;
  }

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

  const cInsertTable = (label: string, table: string) => Chain.control(
    Chain.mapper((editor: any) => {
      editor.setContent(table);
      const bodyElem = TinyDom.fromDom(editor.getBody());
      const tableElem = UiFinder.findIn(bodyElem, 'table').getOr(bodyElem);
      SelectorFind.descendant(tableElem, 'td,th').each((cell) => {
        editor.selection.select(cell.dom(), true);
        editor.selection.collapse(true);
      });
      return tableElem;
    }),
    Guard.addLogging(`Insert ${label}`)
  );

  const cInsertRowMeasureWidth = (label: string, data: TestData) => Log.chain('TBA', 'Insert row before, insert row after, erase row and measure table widths', NamedChain.asChain(
    [
      NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
      Chain.label('Insert table', NamedChain.direct('editor', cInsertTable(label, data.html), 'element')),
      Chain.label('Store width before split', NamedChain.write('widthBefore', TableTestUtils.cGetWidth)),
      Chain.label('Store cell width before split', NamedChain.write('cellWidthBefore', TableTestUtils.cGetCellWidth(0, 0))),
      Chain.label('Insert column before', NamedChain.read('editor', TableTestUtils.cInsertRowBefore)),
      Chain.label('Insert column after', NamedChain.read('editor', TableTestUtils.cInsertRowAfter)),
      Chain.label('Delete column', NamedChain.read('editor', TableTestUtils.cDeleteRow)),
      Chain.label('Store width after split', NamedChain.write('widthAfter', TableTestUtils.cGetWidth)),
      Chain.label('Store cell width before split', NamedChain.write('cellWidthAfter', TableTestUtils.cGetCellWidth(0, 0))),
      NamedChain.merge([ 'widthBefore', 'cellWidthBefore', 'widthAfter', 'cellWidthAfter' ], 'widths'),
      NamedChain.output('widths')
    ]
  ));

  const cAssertWidths = Chain.label(
    'Assert widths before and after insert row are equal',
    Chain.op((input: any) => {
      if (input.widthBefore.isPercent) {
        // due to rounding errors we can be off by one pixel for percentage tables
        const actualDiff = Math.abs(input.widthBefore.px - input.widthAfter.px);
        Assert.eq(`table width should be approx (within 1px): ${input.widthBefore.raw}% (${input.widthBefore.px}px) ~= ${input.widthAfter.raw}% (${input.widthAfter.px}px)`, true, actualDiff <= 1);
      } else {
        Assertions.assertEq('table width should not change', input.widthBefore, input.widthAfter);
      }

      Assertions.assertEq('table cell widths should not change', input.cellWidthBefore, input.cellWidthAfter);
    })
  );

  const cAssertWidth = (label: string, data: TestData) => Chain.label(
    `Assert width of table ${label} after inserting row`,
    NamedChain.asChain([
      NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
      NamedChain.direct('editor', cInsertRowMeasureWidth(label, data), 'widths'),
      NamedChain.read('widths', cAssertWidths)
    ])
  );

  let objectResizedCounter = 0;

  NamedChain.pipeline(Log.chains('TBA', 'Table: Insert rows, erase row and assert the table width and cell widths does not change', [
    NamedChain.write('editor', Editor.cFromSettings({
      plugins: 'table',
      width: 400,
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
      setup: (editor) => {
        editor.on('ObjectResized', () => objectResizedCounter++);
      }
    })),

    NamedChain.read('editor', cAssertWidth('which is empty', emptyTable)),
    NamedChain.read('editor', cAssertWidth('with contents in some cells', contentsInSomeCells)),
    NamedChain.read('editor', cAssertWidth('with contents in all cells', contentsInAllCells)),
    NamedChain.read('editor', cAssertWidth('with headings', tableWithHeadings)),
    NamedChain.read('editor', cAssertWidth('with caption', tableWithCaption)),
    NamedChain.read('editor', cAssertWidth('with nested tables', nestedTables)),

    NamedChain.read('editor', Chain.op(() => {
      Assertions.assertEq('ObjectResized shouldn\'t have fired', 0, objectResizedCounter);
    })),

    NamedChain.read('editor', Editor.cRemove)
  ]),
  success, failure, TestLogs.init());
});
