import { Assertions, Log, Step } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { TinyApis } from '@ephox/mcagar';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { sAssertTableStructureWithSizes } from './TableTestUtils';

type SizingMode = 'relative' | 'fixed' | 'responsive';

interface Scenario {
  mode: SizingMode;
  tableWidth: number;
  cols: number;
  rows: number;
  expectedTableWidth: number;
  expectedWidths: number[][];
  newMode: SizingMode;
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

interface TableModifiedEvent { type: string; structure: boolean; style: boolean }
const sTableSizingModeScenarioTest = (editor, tinyApis: TinyApis, title: string, description: string, withColGroups: boolean, scenario: Scenario, expectedEvents: TableModifiedEvent[] = [{ type: 'tablemodified', structure: true, style: false }]) => {
  let events = [];
  editor.on('TableModified', (event: EditorEvent<{ structure: boolean; style: boolean }>) => events.push({
    type: event.type,
    structure: event.structure,
    style: event.style,
  }));
  const clearEvents = Step.sync(() => events = []);

  return Log.stepsAsStep(title, description, [
    clearEvents,
    tinyApis.sSetContent(generateTable(scenario.mode, scenario.tableWidth, scenario.rows, scenario.cols, withColGroups)),
    tinyApis.sSetSelection([ 0, withColGroups ? 1 : 0, 0, 0 ], 0, [ 0, withColGroups ? 1 : 0, 0, 0 ], 0),
    tinyApis.sExecCommand('mceTableSizingMode', scenario.newMode),
    sAssertTableStructureWithSizes(editor, scenario.cols, scenario.rows, getUnit(scenario.newMode), scenario.expectedTableWidth, scenario.expectedWidths, withColGroups),
    Step.sync(() => Assertions.assertEq('Expected events fired', expectedEvents, events)),
    clearEvents,
  ]);
};

export {
  sTableSizingModeScenarioTest
};
