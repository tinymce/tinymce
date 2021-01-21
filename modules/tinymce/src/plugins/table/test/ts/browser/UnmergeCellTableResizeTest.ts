import { Assertions, Chain, Guard, Keyboard, Keys, Log, NamedChain, TestLogs, UiFinder } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { McEditor, TinyDom } from '@ephox/mcagar';
import { SelectorFind } from '@ephox/sugar';

import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import * as TableTestUtils from '../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.UnmergeCellTableResizeTest', (success, failure) => {

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
            '</table>',

    select: (editor) => {
      Keyboard.keydown(Keys.down(), { shift: true }, TinyDom.fromDom(editor.getBody()));
    }
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
          '</table>',

    select: (editor) => {
      Keyboard.keydown(Keys.down(), { shift: true }, TinyDom.fromDom(editor.getBody()));
    }
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
          '</table>',

    select: (editor) => {
      Keyboard.keydown(Keys.down(), { shift: true }, TinyDom.fromDom(editor.getBody()));
    }
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
          '</table>',

    select: (editor) => {
      Keyboard.keydown(Keys.down(), { }, TinyDom.fromDom(editor.getBody()));
      Keyboard.keydown(Keys.down(), { shift: true }, TinyDom.fromDom(editor.getBody()));
    }
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
          '</table>',

    select: (editor) => {
      Keyboard.keydown(Keys.down(), { shift: true }, TinyDom.fromDom(editor.getBody()));
    }
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
          '</table>',

    select: (editor) => {
      Keyboard.keydown(Keys.down(), { shift: true }, TinyDom.fromDom(editor.getBody()));
    }
  };

  const singleCell = {
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

    select: (_editor) => {}
  };

  const selectedRow = {
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
      Keyboard.keydown(Keys.right(), { shift: true }, TinyDom.fromDom(editor.getBody()));
    }
  };

  const mergeWholeTable = {
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
      Keyboard.keydown(Keys.down(), { shift: true }, TinyDom.fromDom(editor.getBody()));
      Keyboard.keydown(Keys.right(), { shift: true }, TinyDom.fromDom(editor.getBody()));
    }
  };

  const mergeResizeSplit = {
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
      Keyboard.keydown(Keys.down(), { shift: true }, TinyDom.fromDom(editor.getBody()));
    }
  };

  const cInsertTable = (label, table) => Chain.control(
    Chain.mapper((editor: any) => {
      editor.setContent(table);
      const bodyElem = TinyDom.fromDom(editor.getBody());
      const tableElem = UiFinder.findIn(bodyElem, 'table').getOr(bodyElem);
      SelectorFind.descendant(tableElem, 'td,th').each((cell) => {
        editor.selection.select(cell.dom, true);
        editor.selection.collapse(true);
      });
      return tableElem;
    }),
    Guard.addLogging(`Insert ${label}`)
  );

  const cUnmergeCellsMeasureTableWidth = (label, data) => Log.chain('TBA', 'Merge and unmerge cells, measure table widths', NamedChain.asChain(
    [
      NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
      Chain.label('Insert table', NamedChain.direct('editor', cInsertTable(label, data.html), 'element')),
      Chain.label('Drag SE (-100, 0)', NamedChain.read('editor', TableTestUtils.cDragHandle('se', -100, 0))),
      Chain.label('Store width before merge', NamedChain.write('widthBefore', TableTestUtils.cGetWidth)),
      Chain.label('Merge table cells', NamedChain.read('editor', TableTestUtils.cMergeCells(data.select))),
      Chain.label('Split table cells', NamedChain.read('editor', TableTestUtils.cSplitCells)),
      Chain.label('Store width after merge/unmerge', NamedChain.write('widthAfter', TableTestUtils.cGetWidth)),
      NamedChain.merge([ 'widthBefore', 'widthAfter' ], 'widths'),
      NamedChain.output('widths')
    ]
  ));

  const cMergeResizeUnmergeMeasureWidth = (label, data) => Log.chain('TBA', 'Merge cells and resize table, unmerge cells and measure table widths', NamedChain.asChain(
    [
      NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
      Chain.label('Insert table', NamedChain.direct('editor', cInsertTable(label, data.html), 'element')),
      Chain.label('Drag SE (-100, 0)', NamedChain.read('editor', TableTestUtils.cDragHandle('se', -100, 0))),
      Chain.label('Merge table cells', NamedChain.read('editor', TableTestUtils.cMergeCells(data.select))),
      Chain.label('Drag SE (-100, 0)', NamedChain.read('editor', TableTestUtils.cDragHandle('se', -100, 0))),
      Chain.label('Store width before split', NamedChain.write('widthBefore', TableTestUtils.cGetWidth)),
      Chain.label('Split table cells', NamedChain.read('editor', TableTestUtils.cSplitCells)),
      Chain.label('Store width after split', NamedChain.write('widthAfter', TableTestUtils.cGetWidth)),
      NamedChain.merge([ 'widthBefore', 'widthAfter' ], 'widths'),
      NamedChain.output('widths')
    ]
  ));

  const cAssertWidths = Chain.label(
    'Assert widths before and after unmerge are equal',
    Chain.op((input: any) => {
      if (input.widthBefore.isPercent) {
        // due to rounding errors we can be off by one pixel for percentage tables
        const actualDiff = Math.abs(input.widthBefore.px - input.widthAfter.px);
        Assert.eq(`table width should be approx (within 1px): ${input.widthBefore.raw}% (${input.widthBefore.px}px) ~= ${input.widthAfter.raw}% (${input.widthAfter.px}px)`, true, actualDiff <= 1);
      } else {
        Assertions.assertEq('table width should not change', input.widthBefore, input.widthAfter);
      }
    })
  );

  const cAssertWidth = (label, data) => Chain.label(
    `Assert width of table ${label}`,
    NamedChain.asChain([
      NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
      NamedChain.direct('editor', cUnmergeCellsMeasureTableWidth(label, data), 'widths'),
      NamedChain.read('widths', cAssertWidths)
    ])
  );

  const cMergeResizeSplitAssertWidth = (label, data) => Chain.label(
    `Assert width of table ${label}`,
    NamedChain.asChain([
      NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
      NamedChain.direct('editor', cMergeResizeUnmergeMeasureWidth(label, data), 'widths'),
      NamedChain.read('widths', cAssertWidths)
    ])
  );

  NamedChain.pipeline(Log.chains('TBA', 'Table: Resize table, merge and split cells, assert the table width does not change', [
    NamedChain.write('editor', McEditor.cFromSettings({
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

    NamedChain.read('editor', cAssertWidth('with an entire row merged and split', selectedRow)),
    NamedChain.read('editor', cAssertWidth('with one selected cell', singleCell)),
    NamedChain.read('editor', cAssertWidth('with whole table merged and split', mergeWholeTable)),
    NamedChain.read('editor', cMergeResizeSplitAssertWidth('resized after merge and then split', mergeResizeSplit)),

    NamedChain.read('editor', McEditor.cRemove)
  ]), success, failure, TestLogs.init());
});
