import { ApproxStructure, Assertions, Log, Pipeline, Step, StructAssertAdv, StructAssertBasic } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { SugarElement, SugarNode } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import * as TableTestUtils from '../../module/test/TableTestUtils';

interface CommandTest {
  cmd: string;
  value?: any;
  table: string;
  tableStructure: StructAssertBasic | StructAssertAdv;
}

UnitTest.asynctest('browser.tinymce.plugins.table.command.CommandsOnLockedColumnsTest', (success, failure) => {
  Plugin();
  SilverTheme();

  let events = [];
  const logEvent = (event: EditorEvent<{}>) => {
    events.push(event);
  };

  const sClearEvents = Step.sync(() => events = []);

  const defaultEvents = [ 'tablemodified' ];
  const sAssertEvents = (expectedEvents: string[] = defaultEvents) => Step.sync(() => {
    if (events.length > 0) {
      Arr.each(events, (event) => {
        const tableElm = SugarElement.fromDom(event.table);
        Assertions.assertEq('Cell style commands do not modify table structure', event.structure, false);
        Assertions.assertEq('Cell style commands modify table style', event.style, true);
        Assertions.assertEq('Expected events should have been fired', true, SugarNode.isTag('table')(tableElm));
        Assertions.assertEq('Should not have structure modified', false, events[0].structure);
        Assertions.assertEq('Should have style modified', true, events[0].style);
      });
    }
    Assertions.assertEq('Expected events should have been fired', expectedEvents, Arr.map(events, (event) => event.type));
  });

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const table = '<table style="border-collapse: collapse; width: 100%;" border="1" data-snooker-locked-cols="0">' +
      '<tbody>' +
      '<tr>' +
      `<td style="width: 50%;">a</td>` +
      `<td style="width: 50%;">b</td>` +
      '</tr>' +
      '<tr>' +
      `<td style="width: 50%;">c</td>` +
      `<td style="width: 50%;">d</td>` +
      '</tr>' +
      '</tbody>' +
      '</table>';
    const tableStructure = ApproxStructure.fromHtml(table);

    const mergeCellTable = `<table data-snooker-locked-cols="0">` +
      `<tbody>` +
      `<tr>` +
      `<td data-mce-selected="1" data-mce-first-selected="1">a</td>` +
      `<td data-mce-selected="1" data-mce-last-selected="1">b</td>` +
      `</tr>` +
      `</tbody></table>`;
    const mergeCellTableStructure = ApproxStructure.fromHtml(mergeCellTable);

    const splitCellTable = `<table data-snooker-locked-cols="0">` +
      `<tbody>` +
      `<tr>` +
      `<td colspan="2">a</td>` +
      `</tr>` +
      `</tbody>` +
      `</table>`;
    const splitCellTableStructure = ApproxStructure.fromHtml(splitCellTable);

    const sTestCommand = (info: CommandTest) =>
      Log.stepsAsStep('TINY-6765', `Applying ${info.cmd} command on locked column should not change the table`, [
        sAssertEvents([]),
        tinyApis.sSetContent(info.table),
        tinyApis.sSetCursor([ 0, 0, 0, 0 ], 0),
        tinyApis.sExecCommand(info.cmd, info.value),
        TableTestUtils.sAssertTableStructure(editor, info.tableStructure),
        sAssertEvents([])
      ]);

    const tests = Arr.map([
      { cmd: 'mceTableSplitCells', table: splitCellTable, tableStructure: splitCellTableStructure },
      { cmd: 'mceTableMergeCells', table: mergeCellTable, tableStructure: mergeCellTableStructure },
      { cmd: 'mceTableInsertColBefore', table, tableStructure },
      { cmd: 'mceTableInsertColAfter', table, tableStructure },
      { cmd: 'mceTableDeleteCol', table, tableStructure },
      { cmd: 'mceTableCutCol', table, tableStructure },
      { cmd: 'mceTableCopyCol', table, tableStructure },
      { cmd: 'mceTablePasteColBefore', table, tableStructure },
      { cmd: 'mceTablePasteColAfter', table, tableStructure },
      {
        cmd: 'mceTableColType',
        value: { type: 'th' },
        table,
        tableStructure
      }
    ], sTestCommand);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      ...tests,
      sClearEvents
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('tablemodified', logEvent);
    }
  }, success, failure);
});

