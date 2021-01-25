import { ApproxStructure, Assertions, GeneralSteps, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { SugarElement, SugarNode } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { TableEventData } from 'tinymce/plugins/table/api/Events';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import * as TableTestUtils from '../../module/test/TableTestUtils';

type TableModifiedEvent = EditorEvent<TableEventData>;

interface Cursor {
  readonly start: number[];
  readonly offset: number;
}

interface CommandTest {
  readonly cmd: string;
  readonly value?: any;
  readonly before: string;
  readonly after: string;
  readonly cursor: Cursor;
  readonly expectedEvents: TableModifiedEvent[];
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
        Assertions.assertEq('Commands do not modify table structure', false, event.structure);
        Assertions.assertEq('Commands modify table style', true, event.style);
        Assertions.assertEq('Expected table in event', true, SugarNode.isTag('table')(tableElm));
      });
    }
    Assertions.assertEq('Expected events should have been fired', expectedEvents, Arr.map(events, (event) => event.type));
  });

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const table = (lockedColumns: number[] = [ 0 ]) =>
      `<table style="border-collapse: collapse; width: 100%;" border="1" data-snooker-locked-cols="${lockedColumns.join(',')}">` +
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

    const mergeCellTable = `<table data-snooker-locked-cols="0">` +
      `<tbody>` +
      `<tr>` +
      `<td data-mce-selected="1" data-mce-first-selected="1">a</td>` +
      `<td data-mce-selected="1" data-mce-last-selected="1">b</td>` +
      `</tr>` +
      `</tbody></table>`;

    const splitCellTable = `<table data-snooker-locked-cols="0">` +
      `<tbody>` +
      `<tr>` +
      `<td colspan="2">a</td>` +
      `</tr>` +
      `</tbody>` +
      `</table>`;

    const defaultCursor = {
      start: [ 0, 0, 0, 0 ],
      offset: 0
    };

    const sPopulateTableClipboard = (rowOrCol: 'row' | 'col') => GeneralSteps.sequence([
      tinyApis.sSetContent(`<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>`),
      tinyApis.sSetCursor([ 0, 0, 0, 0 ], 0),
      tinyApis.sExecCommand(rowOrCol === 'col' ? 'mceTableCopyCol' : 'mceTableCopyRow'),
      tinyApis.sSetContent(''),
    ]);

    const sAssertTableInContent = (expectedTableHtml: string) => {
      const structure = ApproxStructure.fromHtml(expectedTableHtml);
      return TableTestUtils.sAssertTableStructure(editor, structure);
    };

    const sTestCommand = (id: string, label: string, info: CommandTest) =>
      Log.stepsAsStep(id, label, [
        sPopulateTableClipboard('col'),
        sClearEvents,
        tinyApis.sSetContent(info.before),
        tinyApis.sSetCursor(info.cursor.start, info.cursor.offset),
        tinyApis.sExecCommand(info.cmd, info.value),
        sAssertTableInContent(info.after),
        sAssertEvents([])
      ]);

    Pipeline.async({}, [
      sTestCommand('TINY-6765', `Applying 'mceTableSplitCells' command on locked column should not change the table`, {
        cmd: 'mceTableSplitCells',
        before: splitCellTable,
        after: splitCellTable,
        cursor: defaultCursor,
        expectedEvents: []
      }),
      sTestCommand('TINY-6765', `Applying 'mceTableMergeCells' command on locked column should not change the table`, {
        cmd: 'mceTableSplitCells',
        before: mergeCellTable,
        after: mergeCellTable,
        cursor: defaultCursor,
        expectedEvents: []
      }),
      sTestCommand('TINY-6765', `Applying 'mceTableInsertColBefore' command on locked column that is the first column in the table should not change the table`, {
        cmd: 'mceTableInsertColBefore',
        before: table(),
        after: table(),
        cursor: defaultCursor,
        expectedEvents: []
      }),
      sTestCommand('TINY-6765', `Applying 'mceTableInsertColAfter' command on locked column that is the last column in the table should not change the table`, {
        cmd: 'mceTableInsertColAfter',
        before: table([ 1 ]),
        after: table([ 1 ]),
        cursor: {
          start: [ 0, 0, 0, 1 ],
          offset: 0
        },
        expectedEvents: []
      }),
      sTestCommand('TINY-6765', `Applying 'mceTableDeleteCol' command on locked column should not change the table`, {
        cmd: 'mceTableDeleteCol',
        before: table(),
        after: table(),
        cursor: defaultCursor,
        expectedEvents: []
      }),
      sTestCommand('TINY-6765', `Applying 'mceTableCutCol' command on locked column should not change the table`, {
        cmd: 'mceTableCutCol',
        before: table(),
        after: table(),
        cursor: defaultCursor,
        expectedEvents: []
      }),
      sTestCommand('TINY-6765', `Applying 'mceTableCopyCol' command on locked column should not change the table`, {
        cmd: 'mceTableCopyCol',
        before: table(),
        after: table(),
        cursor: defaultCursor,
        expectedEvents: []
      }),
      sTestCommand('TINY-6765', `Applying 'mceTablePasteColBefore' command on locked column that is the first column in the table should not change the table`, {
        cmd: 'mceTablePasteColBefore',
        before: table(),
        after: table(),
        cursor: defaultCursor,
        expectedEvents: []
      }),
      sTestCommand('TINY-6765', `Applying 'mceTablePasteColAfter' command on locked column that is the last column in the table should not change the table`, {
        cmd: 'mceTablePasteColAfter',
        before: table([ 1 ]),
        after: table([ 1 ]),
        cursor: {
          start: [ 0, 0, 0, 1 ],
          offset: 0
        },
        expectedEvents: []
      }),
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

