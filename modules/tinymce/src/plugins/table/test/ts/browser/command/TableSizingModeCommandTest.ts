import { GeneralSteps, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { sAssertTableStructureWithSizes } from '../../module/test/TableTestUtils';

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

UnitTest.asynctest('browser.tinymce.plugins.table.command.TableSizingModeCommandTest', (success, failure) => {
  Plugin();
  SilverTheme();

  const getUnit = (mode: SizingMode) => {
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

  const generateTable = (mode: SizingMode, width: number, rows: number, cols: number) => {
    const tableWidth = generateWidth(mode, width, 1);
    const renderedRows = Arr.range(rows, (row) => '<tr>' + Arr.range(cols, (col) => {
      const cellWidth = generateWidth(mode, width, cols);
      const cellNum = (row * cols) + col + 1;
      return `<td style="${cellWidth}">Cell ${cellNum}</td>`;
    }).join('') + '</tr>').join('');
    return `<table border="1" style="border-collapse: collapse;${tableWidth}"><tbody>${renderedRows}</tbody></table>`;
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const sTest = (scenario: Scenario) => GeneralSteps.sequence([
      tinyApis.sSetContent(generateTable(scenario.mode, scenario.tableWidth, scenario.rows, scenario.cols)),
      tinyApis.sSetSelection([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 0),
      tinyApis.sExecCommand('mceTableSizingMode', scenario.newMode),
      sAssertTableStructureWithSizes(editor, scenario.cols, scenario.rows, getUnit(scenario.newMode), scenario.expectedTableWidth, scenario.expectedWidths)
    ]);

    Pipeline.async({}, [
      Log.step('TINY-6000', 'Percent (relative) to pixel (fixed) sizing', sTest({
        mode: 'relative',
        tableWidth: 100,
        rows: 3,
        cols: 2,
        newMode: 'fixed',
        expectedTableWidth: 800,
        expectedWidths: [
          [ 400, 400 ],
          [ 400, 400 ],
          [ 400, 400 ]
        ]
      })),
      Log.step('TINY-6000', 'Percent (relative) to none (responsive) sizing', sTest({
        mode: 'relative',
        tableWidth: 100,
        rows: 3,
        cols: 2,
        newMode: 'responsive',
        expectedTableWidth: null,
        expectedWidths: [
          [ null, null ],
          [ null, null ],
          [ null, null ]
        ]
      })),
      Log.step('TINY-6000', 'Pixel (fixed) to percent (relative) sizing', sTest({
        mode: 'fixed',
        tableWidth: 600,
        rows: 2,
        cols: 2,
        newMode: 'relative',
        expectedTableWidth: 75,
        expectedWidths: [
          [ 50, 50 ],
          [ 50, 50 ]
        ]
      })),
      Log.step('TINY-6000', 'Pixel (fixed) to none (responsive) sizing', sTest({
        mode: 'fixed',
        tableWidth: 600,
        rows: 2,
        cols: 2,
        newMode: 'responsive',
        expectedTableWidth: null,
        expectedWidths: [
          [ null, null ],
          [ null, null ]
        ]
      })),
      Log.step('TINY-6000', 'None (responsive) to percent (relative) sizing', sTest({
        mode: 'responsive',
        tableWidth: null,
        rows: 2,
        cols: 3,
        newMode: 'relative',
        expectedTableWidth: 16,
        expectedWidths: [
          [ 31, 31, 31 ],
          [ 31, 31, 31 ]
        ]
      })),
      Log.step('TINY-6000', 'None (responsive) to pixel (fixed) sizing', sTest({
        mode: 'responsive',
        tableWidth: null,
        rows: 2,
        cols: 3,
        newMode: 'fixed',
        expectedTableWidth: 133,
        expectedWidths: [
          [ 41, 41, 41 ],
          [ 41, 41, 41 ]
        ]
      }))
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent: false,
    width: 850,
    content_css: false,
    content_style: 'body { margin: 10px; max-width: 800px }',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
