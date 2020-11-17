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

const sTableSizingModeScenarioTest = (editor, tinyApis: TinyApis, title: string, description: string, withColGroups: boolean, scenario: Scenario, expectedEventsLength: number = 1) => {
  let events = [];
  editor.on('TableModified', (e: EditorEvent<{}>) => events.push(e));
  const clearEvents = Step.sync(() => events = []);

  return Log.stepsAsStep(title, description, [
    clearEvents,
    tinyApis.sSetContent(generateTable(scenario.mode, scenario.tableWidth, scenario.rows, scenario.cols, withColGroups)),
    tinyApis.sSetSelection([ 0, withColGroups ? 1 : 0, 0, 0 ], 0, [ 0, withColGroups ? 1 : 0, 0, 0 ], 0),
    tinyApis.sExecCommand('mceTableSizingMode', scenario.newMode),
    sAssertTableStructureWithSizes(editor, scenario.cols, scenario.rows, getUnit(scenario.newMode), scenario.expectedTableWidth, scenario.expectedWidths, withColGroups),
    Step.sync(() => Assertions.assertEq('Expected events fired', expectedEventsLength, events.length)),
    clearEvents,
  ]);
};

export {
  sTableSizingModeScenarioTest
};
