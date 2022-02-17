import { ApproxStructure, Cursors } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarElement, SugarNode } from '@ephox/sugar';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { TableModifiedEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import * as TableTestUtils from '../../../module/table/TableTestUtils';

interface CommandTest {
  readonly cmd: string;
  readonly before: string;
  readonly after: string;
  readonly cursor: Cursors.CursorSpec;
  readonly expectedEvents: TableModifiedEvent[];
}

describe('browser.tinymce.models.dom.table.command.CommandsOnLockedColumnsTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('TableModified', logEvent);
    }
  }, [], true);

  let events: Array<EditorEvent<TableModifiedEvent>> = [];
  const logEvent = (event: EditorEvent<TableModifiedEvent>) => {
    events.push(event);
  };
  const clearEvents = () => events = [];

  const defaultEvents = [ 'tablemodified' ];
  const assertEvents = (expectedEvents: string[] = defaultEvents) => {
    if (events.length > 0) {
      Arr.each(events, (event) => {
        const tableElm = SugarElement.fromDom(event.table);
        assert.isFalse(event.structure, 'Commands do not modify table structure');
        assert.isTrue(event.style, 'Commands modify table style');
        assert.isTrue(SugarNode.isTag('table')(tableElm), 'Expected table in event');
      });
    }
    assert.deepEqual(Arr.map(events, (event) => event.type), expectedEvents, 'Expected events should have been fired');
  };

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
    element: [ 0, 0, 0, 0 ],
    offset: 0
  };

  const populateTableClipboard = (editor: Editor, rowOrCol: 'row' | 'col') => {
    editor.setContent(`<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>`);
    TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
    editor.execCommand(rowOrCol === 'col' ? 'mceTableCopyCol' : 'mceTableCopyRow');
    editor.setContent('');
  };

  const assertTableInContent = (editor: Editor, expectedTableHtml: string) => {
    const structure = ApproxStructure.fromHtml(expectedTableHtml);
    TableTestUtils.assertTableStructure(editor, structure);
  };

  const testCommand = (info: CommandTest) => {
    const editor = hook.editor();
    populateTableClipboard(editor, 'col');
    clearEvents();
    editor.setContent(info.before);
    TinySelections.setSelectionFrom(editor, info.cursor);
    editor.execCommand(info.cmd);
    assertTableInContent(editor, info.after);
    assertEvents([]);
  };

  it(`TINY-6765: Applying 'mceTableSplitCells' command on locked column should not change the table`, () => testCommand({
    cmd: 'mceTableSplitCells',
    before: splitCellTable,
    after: splitCellTable,
    cursor: defaultCursor,
    expectedEvents: []
  }));

  it(`TINY-6765: Applying 'mceTableMergeCells' command on locked column should not change the table`, () => testCommand({
    cmd: 'mceTableSplitCells',
    before: mergeCellTable,
    after: mergeCellTable,
    cursor: defaultCursor,
    expectedEvents: []
  }));

  it(`TINY-6765: Applying 'mceTableInsertColBefore' command on locked column that is the first column in the table should not change the table`, () => testCommand({
    cmd: 'mceTableInsertColBefore',
    before: table(),
    after: table(),
    cursor: defaultCursor,
    expectedEvents: []
  }));

  it(`TINY-6765: Applying 'mceTableInsertColAfter' command on locked column that is the last column in the table should not change the table`, () => testCommand({
    cmd: 'mceTableInsertColAfter',
    before: table([ 1 ]),
    after: table([ 1 ]),
    cursor: {
      element: [ 0, 0, 0, 1 ],
      offset: 0
    },
    expectedEvents: []
  }));

  it(`TINY-6765: Applying 'mceTableDeleteCol' command on locked column should not change the table`, () => testCommand({
    cmd: 'mceTableDeleteCol',
    before: table(),
    after: table(),
    cursor: defaultCursor,
    expectedEvents: []
  }));

  it(`TINY-6765: Applying 'mceTableCutCol' command on locked column should not change the table`, () => testCommand({
    cmd: 'mceTableCutCol',
    before: table(),
    after: table(),
    cursor: defaultCursor,
    expectedEvents: []
  }));

  it(`TINY-6765: Applying 'mceTableCopyCol' command on locked column should not change the table`, () => testCommand({
    cmd: 'mceTableCopyCol',
    before: table(),
    after: table(),
    cursor: defaultCursor,
    expectedEvents: []
  }));

  it(`TINY-6765: Applying 'mceTablePasteColBefore' command on locked column that is the first column in the table should not change the table`, () => testCommand({
    cmd: 'mceTablePasteColBefore',
    before: table(),
    after: table(),
    cursor: defaultCursor,
    expectedEvents: []
  }));

  it(`TINY-6765: Applying 'mceTablePasteColAfter' command on locked column that is the last column in the table should not change the table`, () => testCommand({
    cmd: 'mceTablePasteColAfter',
    before: table([ 1 ]),
    after: table([ 1 ]),
    cursor: {
      element: [ 0, 0, 0, 1 ],
      offset: 0
    },
    expectedEvents: []
  }));
});

