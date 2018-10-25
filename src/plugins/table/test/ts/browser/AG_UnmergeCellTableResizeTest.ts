import { Assertions, Chain, Guard, Mouse, NamedChain, UiFinder, Log, Keyboard, Keys, TestLogs } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Editor, TinyDom } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from '../../../../../themes/silver/main/ts/Theme';
import { SelectorFind } from '@ephox/sugar';
import TableTestUtils from '../module/test/TableTestUtils';

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

    select: (editor) => { return; }
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

  const cUnmergeCellsMeasureTableWidth = (label, data) => {
    return NamedChain.asChain(
      Log.chains('TBA', 'Merge and unmerge cells, measure table widths', [
        NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
        NamedChain.direct('editor', cInsertTable(label, data.html), 'element'),
        NamedChain.read('element', Mouse.cTrueClick),
        NamedChain.read('editor', TableTestUtils.cDragHandle('se', -100, 0)),
        NamedChain.write('widthBefore', TableTestUtils.cGetWidth),
        NamedChain.read('element', Mouse.cTrueClick),
        NamedChain.read('editor', TableTestUtils.cMergeCells(data.select)),
        NamedChain.read('editor', TableTestUtils.cSplitCells),
        NamedChain.write('widthAfter', TableTestUtils.cGetWidth),
        NamedChain.merge(['widthBefore', 'widthAfter'], 'widths'),
        NamedChain.output('widths')
      ])
    );
  };

  const cMergeResizeUnmergeMeasureWidth = (label, data) => {
    return NamedChain.asChain(
      Log.chains('TBA', 'Merge cells and resize table, unmerge cells and measure table widths', [
        NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
        NamedChain.direct('editor', cInsertTable(label, data.html), 'element'),
        NamedChain.read('element', Mouse.cTrueClick),
        NamedChain.read('editor', TableTestUtils.cDragHandle('se', -100, 0)),
        NamedChain.read('element', Mouse.cTrueClick),
        NamedChain.read('editor', TableTestUtils.cMergeCells(data.select)),
        NamedChain.read('editor', TableTestUtils.cDragHandle('se', -100, 0)),
        NamedChain.write('widthBefore', TableTestUtils.cGetWidth),
        NamedChain.read('element', Mouse.cTrueClick),
        NamedChain.read('editor', TableTestUtils.cSplitCells),
        NamedChain.write('widthAfter', TableTestUtils.cGetWidth),
        NamedChain.merge(['widthBefore', 'widthAfter'], 'widths'),
        NamedChain.output('widths')
      ])
    );
  };

  const cAssertWidths = Chain.control(
    Chain.op((input: any) => {
      Assertions.assertEq('table width should not change', input.widthBefore, input.widthAfter);
    }),
    Guard.addLogging('Assert widths before and after unmerge are equal')
  );

  const cAssertWidth = (label, data) => {
    return Chain.control(
      NamedChain.asChain([
        NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
        NamedChain.direct('editor', cUnmergeCellsMeasureTableWidth(label, data), 'widths'),
        NamedChain.read('widths', cAssertWidths)
      ]),
      Guard.addLogging(`Assert width of table ${label}`)
    );
  };

  const cMergeResizeSplitAssertWidth = (label, data) => {
    return Chain.control(
      NamedChain.asChain([
        NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
        NamedChain.direct('editor', cMergeResizeUnmergeMeasureWidth(label, data), 'widths'),
        NamedChain.read('widths', cAssertWidths)
      ]),
      Guard.addLogging(`Assert width of table ${label}`)
    );
  };

  NamedChain.pipeline(Log.chains('TBA', 'Table: Resize table, merge and split cells, assert the table width does not change', [
    NamedChain.write('editor', Editor.cFromSettings({
      plugins: 'table',
      width: 400,
      theme: 'silver',
      skin_url: '/project/js/tinymce/skins/oxide',
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

    NamedChain.read('editor', Editor.cRemove)
  ]), function () {
    success();
  }, failure, TestLogs.init());
});
