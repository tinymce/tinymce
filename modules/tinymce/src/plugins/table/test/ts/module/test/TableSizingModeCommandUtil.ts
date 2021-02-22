import { Arr } from '@ephox/katamari';
import { TinySelections } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { assertTableStructureWithSizes } from './TableTestUtils';

type SizingMode = 'relative' | 'fixed' | 'responsive';

interface Scenario {
  readonly mode: SizingMode;
  readonly tableWidth: number;
  readonly cols: number;
  readonly rows: number;
  readonly expectedTableWidth: number;
  readonly expectedWidths: number[][];
  readonly newMode: SizingMode;
}

interface PartialTableModifiedEvent {
  readonly type: string;
  readonly style: boolean;
  readonly structure: boolean;
}

const getUnit = (mode: SizingMode): 'px' | '%' | null => {
  switch (mode) {
    case 'fixed':
      return 'px';
    case 'relative':
      return '%';
    case 'responsive':
      return null;
  }
};

const generateWidth = (mode: SizingMode, tableWidth: number, cols: number) => {
  if (mode === 'responsive') {
    return '';
  } else {
    return `width: ${tableWidth / cols}${getUnit(mode)}`;
  }
};

const generateTable = (mode: SizingMode, width: number, rows: number, cols: number, useColumns: boolean) => {
  const tableWidth = generateWidth(mode, width, 1);
  const cellWidth = generateWidth(mode, width, cols);

  const getCellStyle = useColumns ? '' : ` style="${cellWidth}"`;

  const renderedRows = Arr.range(rows, (row) =>
    '<tr>' + Arr.range(cols, (col) => {
      const cellNum = (row * cols) + col + 1;
      return `<td${getCellStyle}>Cell ${cellNum}</td>`;
    }).join('') + '</tr>'
  ).join('');

  const renderedColumns = Arr.range(cols, () =>
    `<col style="${cellWidth}"></col>`
  ).join('');

  const getColumns = () =>
    useColumns ? '<colgroup>' + renderedColumns + '</colgroup>' : '';

  return `<table border="1" style="border-collapse: collapse;${tableWidth}">${getColumns()}<tbody>${renderedRows}</tbody></table>`;
};

const defaultEvents = [{ type: 'tablemodified', structure: true, style: false }];

const tableSizingModeScenarioTest = (editor: Editor, withColGroups: boolean, scenario: Scenario, expectedEvents: PartialTableModifiedEvent[] = defaultEvents) => {
  let events: PartialTableModifiedEvent[] = [];
  editor.on('TableModified', (event: EditorEvent<{ structure: boolean; style: boolean }>) => events.push({
    type: event.type,
    structure: event.structure,
    style: event.style,
  }));
  const clearEvents = () => events = [];

  clearEvents();
  editor.setContent(generateTable(scenario.mode, scenario.tableWidth, scenario.rows, scenario.cols, withColGroups));
  TinySelections.setCursor(editor, [ 0, withColGroups ? 1 : 0, 0, 0 ], 0);
  editor.execCommand('mceTableSizingMode', false, scenario.newMode);
  assertTableStructureWithSizes(editor, scenario.cols, scenario.rows, getUnit(scenario.newMode), scenario.expectedTableWidth, scenario.expectedWidths, withColGroups);
  assert.deepEqual(events, expectedEvents, 'Expected events fired');
  clearEvents();
};

export {
  tableSizingModeScenarioTest
};
