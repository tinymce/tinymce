import { Assertions, Chain, Guard, NamedChain, UiFinder, Log, TestLogs, RawAssertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Editor, TinyDom } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { SelectorFind } from '@ephox/sugar';
import TableTestUtils from '../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.InsertColumnTableResizeTest', (success, failure) => {

  Plugin();
  SilverTheme();

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

  const cInsertTable = (label, table) => {
    return Chain.control(
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
  };

  const cInsertColumnMeasureWidth = (label, data) => {
    return Log.chain('TBA', 'Insert column before, insert column after, erase column and measure table widths', NamedChain.asChain(
      [
        NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
        Chain.label('Insert table', NamedChain.direct('editor', cInsertTable(label, data.html), 'element')),
        Chain.label('Drag SE (-100, 0)', NamedChain.read('editor', TableTestUtils.cDragHandle('se', -100, 0))),
        Chain.label('Store width before split', NamedChain.write('widthBefore', TableTestUtils.cGetWidth)),
        Chain.label('Insert column before', NamedChain.read('editor', TableTestUtils.cInsertColumnBefore)),
        Chain.label('Insert column after', NamedChain.read('editor', TableTestUtils.cInsertColumnAfter)),
        Chain.label('Delete column', NamedChain.read('editor', TableTestUtils.cDeleteColumn)),
        Chain.label('Store width after split', NamedChain.write('widthAfter', TableTestUtils.cGetWidth)),
        NamedChain.merge(['widthBefore', 'widthAfter'], 'widths'),
        NamedChain.output('widths')
      ]
    ));
  };

  const cAssertWidths = Chain.label(
    'Assert widths before and after insert column are equal',
    Chain.op((input: any) => {
      if (input.widthBefore.isPercent) {
        // due to rounding errors we can be off by one pixel for percentage tables
        const actualDiff = Math.abs(input.widthBefore.px - input.widthAfter.px);
        RawAssertions.assertEq(`table width should be approx (within 1px): ${input.widthBefore.raw}% (${input.widthBefore.px}px) ~= ${input.widthAfter.raw}% (${input.widthAfter.px}px)`, true,  actualDiff <= 1);
      } else {
        Assertions.assertEq('table width should not change', input.widthBefore, input.widthAfter);
      }
    })
  );

  const cAssertWidth = (label, data) => {
    return Chain.label(
      `Assert width of table ${label} after inserting column`,
      NamedChain.asChain([
        NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
        NamedChain.direct('editor', cInsertColumnMeasureWidth(label, data), 'widths'),
        NamedChain.read('widths', cAssertWidths)
      ])
    );
  };

  NamedChain.pipeline(Log.chains('TBA', 'Table: Insert columns, erase column and assert the table width does not change', [
    NamedChain.write('editor', Editor.cFromSettings({
      plugins: 'table',
      width: 400,
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce'
    })),

    NamedChain.read('editor', cAssertWidth('which is empty', emptyTable)),
    NamedChain.read('editor', cAssertWidth('with contents in some cells', contentsInSomeCells)),
    NamedChain.read('editor', cAssertWidth('with contents in all cells', contentsInAllCells)),
    NamedChain.read('editor', cAssertWidth('with headings', tableWithHeadings)),
    NamedChain.read('editor', cAssertWidth('with caption', tableWithCaption)),
    NamedChain.read('editor', cAssertWidth('with nested tables', nestedTables)),

    NamedChain.read('editor', Editor.cRemove)
  ]),
   function () {
    success();
  }, failure, TestLogs.init());
});
