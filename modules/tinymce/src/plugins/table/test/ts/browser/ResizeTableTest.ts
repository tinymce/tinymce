import { Assertions, Chain, Log, Mouse, NamedChain, Pipeline, TestLogs } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Cell } from '@ephox/katamari';
import { ApiChains, Editor as McEditor } from '@ephox/mcagar';
import { TableGridSize } from '@ephox/snooker';
import { SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import * as TableTestUtils from '../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.ResizeTableTest', (success, failure) => {
  const lastObjectResizeStartEvent = Cell<any>(null);
  const lastObjectResizedEvent = Cell<any>(null);
  const pixelDiffThreshold = 3;
  const percentDiffThreshold = 1;

  Plugin();
  SilverTheme();

  const pixelTable = '<table style="width: 200px;"><tbody><tr><td></td><td></td></tr></tbody></table>';
  const percentTable = '<table style="width: 100%;"><tbody><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr></tbody></table>';
  const responsiveTable = '<table><tbody><tr><td><br></td><td><br></td></tr></tbody></table>';

  const assertWithin = function (value, min, max) {
    Assertions.assertEq('asserting if value falls within a certain range', true, value >= min && value <= max);
  };

  const cAssertWidths = Chain.op(function (input: any) {
    const expectedPx = input.widthBefore.px - 100;
    const expectedPercent = input.widthAfter.px / input.widthBefore.px * 100;

    // not able to match the percent exactly - there's always a difference in fractions, so lets assert a small range instead
    assertWithin(input.widthAfter.px, expectedPx - 1, expectedPx + 1);
    Assertions.assertEq('table width should be in percents', true, input.widthAfter.isPercent);
    assertWithin(input.widthAfter.raw, expectedPercent - 1, expectedPercent + 1);
  });

  const cBindResizeEvents = Chain.mapper(function (input: any) {
    const objectResizeStart = (e) => {
      lastObjectResizeStartEvent.set(e);
    };

    const objectResized = (e) => {
      lastObjectResizedEvent.set(e);
    };

    input.editor.on('ObjectResizeStart', objectResizeStart);
    input.editor.on('ObjectResized', objectResized);

    return {
      objectResizeStart,
      objectResized
    };
  });

  const cUnbindResizeEvents = Chain.mapper(function (input: any) {
    input.editor.off('ObjectResizeStart', input.events.objectResizeStart);
    input.editor.off('ObjectResized', input.events.objectResized);
    return {};
  });

  const cClearResizeEventData = Chain.op(() => {
    lastObjectResizeStartEvent.set(null);
    lastObjectResizedEvent.set(null);
  });

  const cResizeWithHandle = TableTestUtils.cDragHandle('se', -100, -20);

  const cGetColWidths = Chain.mapper((input: any) => {
    const size = TableGridSize.getGridSize(input.element);
    return Arr.range(size.columns, (col) => TableTestUtils.getCellWidth(input.editor, input.element, 0, col));
  });

  const cInsertResizeMeasure = (cResize: Chain<any, any>, cInsert: Chain<Editor, SugarElement>) => NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
    NamedChain.write('events', cBindResizeEvents),
    NamedChain.direct('editor', cInsert, 'element'),
    NamedChain.write('widthBefore', TableTestUtils.cGetWidth),
    NamedChain.write('colWidthsBefore', cGetColWidths),
    NamedChain.read('element', Mouse.cTrueClick),
    NamedChain.read('editor', cResize),
    NamedChain.write('widthAfter', TableTestUtils.cGetWidth),
    NamedChain.write('colWidthsAfter', cGetColWidths),
    NamedChain.write('events', cUnbindResizeEvents),
    NamedChain.merge([ 'widthBefore', 'widthAfter', 'colWidthsBefore', 'colWidthsAfter', 'element' ], 'widths'),
    NamedChain.output('widths')
  ]);

  const cAssertUnitBeforeResize = (unit: string) => Chain.op((widths: any) => {
    Assertions.assertEq(`table width before resizing is in ${unit}`, unit, widths.widthBefore.unit);
  });

  const cAssertUnitAfterResize = (unit: string) => Chain.op((widths: any) => {
    Assertions.assertEq(`table width after resizing is in ${unit}`, unit, widths.widthAfter.unit);
  });

  const cAssertWidthBeforeResize = (width: number) => Chain.op((widths: any) => {
    Assertions.assertEq(`table raw width before resizing is ${width}`, width, widths.widthBefore.raw);
  });

  const cAssertWidthAfterResize = (width: number, approx: boolean = false) => Chain.op((widths: any) => {
    if (approx) {
      Assertions.assertEq(`table raw width after resizing is ~${width}`, true, Math.abs(widths.widthAfter.raw - width) < pixelDiffThreshold);
    } else {
      Assertions.assertEq(`table raw width after resizing is ${width}`, width, widths.widthAfter.raw);
    }
  });

  const cAssertEventData = (state, expectedEventName) => Chain.op((_) => {
    Assertions.assertEq('Should be table element', 'TABLE', state.get().target.nodeName);
    Assertions.assertEq('Should be expected resize event', expectedEventName, state.get().type);
    Assertions.assertEq('Should have width', 'number', typeof state.get().width);
    Assertions.assertEq('Should have height', 'number', typeof state.get().height);
  });

  Pipeline.async({}, [
    Log.chainsAsStep('TBA', 'Test default config of [table_sizing_mode=unset], resize should detect current unit', [
      NamedChain.write('editor', McEditor.cFromSettings({
        plugins: 'table',
        width: 400,
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce'
      })),

      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(cResizeWithHandle, TableTestUtils.cInsertRaw(percentTable)), 'widths'),
      NamedChain.read('widths', cAssertUnitAfterResize('%')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(cResizeWithHandle, TableTestUtils.cInsertRaw(pixelTable)), 'widths'),
      NamedChain.read('widths', cAssertUnitAfterResize('px')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      NamedChain.read('editor', McEditor.cRemove)
    ]),

    Log.chainsAsStep('TBA', 'Test default config of [table_sizing_mode="relative"], new tables should default to % and resize should force %', [
      NamedChain.write('editor', McEditor.cFromSettings({
        plugins: 'table',
        width: 400,
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
        table_sizing_mode: 'relative'
      })),

      cClearResizeEventData,
      NamedChain.direct('editor', cInsertResizeMeasure(cResizeWithHandle, TableTestUtils.cInsertTable(5, 2)), 'widths'),
      NamedChain.read('widths', cAssertWidths),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(cResizeWithHandle, TableTestUtils.cInsertTable(5, 2)), 'widths'),
      NamedChain.read('widths', cAssertUnitBeforeResize('%')),
      NamedChain.read('widths', cAssertUnitAfterResize('%')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      // Force % on unset tables with [table_sizing_mode="relative"]
      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(cResizeWithHandle, TableTestUtils.cInsertRaw(responsiveTable)), 'widths'),
      NamedChain.read('widths', cAssertUnitAfterResize('%')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      // Force % on tables with that are initially set to px with [table_sizing_mode="relative"]
      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(cResizeWithHandle, TableTestUtils.cInsertRaw(pixelTable)), 'widths'),
      NamedChain.read('widths', cAssertUnitAfterResize('%')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      NamedChain.read('editor', McEditor.cRemove)
    ]),

    Log.chainsAsStep('TBA', 'Test [table_sizing_mode="fixed"], new tables should default to px and resize should force px', [
      NamedChain.write('editor', McEditor.cFromSettings({
        plugins: 'table',
        width: 400,
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
        table_sizing_mode: 'fixed'
      })),

      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(cResizeWithHandle, TableTestUtils.cInsertTable(5, 2)), 'widths'),
      NamedChain.read('widths', cAssertUnitBeforeResize('px')),
      NamedChain.read('widths', cAssertUnitAfterResize('px')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      // Force px on unset tables with [table_sizing_mode="fixed"]
      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(cResizeWithHandle, TableTestUtils.cInsertRaw(responsiveTable)), 'widths'),
      NamedChain.read('widths', cAssertUnitAfterResize('px')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      // Force px on tables with that are initially set to % with [table_sizing_mode="fixed"]
      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(cResizeWithHandle, TableTestUtils.cInsertRaw(percentTable)), 'widths'),
      NamedChain.read('widths', cAssertUnitAfterResize('px')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      NamedChain.read('editor', McEditor.cRemove)
    ]),

    Log.chainsAsStep('TINY-6051', 'Test [table_sizing_mode="responsive"], new tables should default to no widths and resize should force percentage', [
      NamedChain.write('editor', McEditor.cFromSettings({
        plugins: 'table',
        width: 400,
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
        table_sizing_mode: 'responsive'
      })),

      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(cResizeWithHandle, TableTestUtils.cInsertTable(5, 2)), 'widths'),
      NamedChain.read('widths', cAssertUnitBeforeResize(null)),
      NamedChain.read('widths', cAssertUnitAfterResize('%')),
      NamedChain.read('widths', cAssertWidthBeforeResize(null)),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      // Force % on unset tables with [table_sizing_mode="responsive"]
      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(cResizeWithHandle, TableTestUtils.cInsertRaw(responsiveTable)), 'widths'),
      NamedChain.read('widths', cAssertUnitAfterResize('%')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      // Force % on tables with that are initially set to px with [table_sizing_mode="responsive"]
      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(cResizeWithHandle, TableTestUtils.cInsertRaw(pixelTable)), 'widths'),
      NamedChain.read('widths', cAssertUnitAfterResize('%')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      NamedChain.read('editor', McEditor.cRemove)
    ]),

    Log.chainsAsStep('TINY-6001', 'Test [table_column_resizing="preservetable"], adjusting an inner column should not change the table width', [
      NamedChain.write('editor', McEditor.cFromSettings({
        plugins: 'table',
        width: 400,
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
        table_toolbar: '',
        table_column_resizing: 'preservetable',
        table_sizing_mode: 'fixed'
      })),

      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cDragResizeBar('column', 0, 20, 0), TableTestUtils.cInsertRaw(pixelTable)), 'widths'),
      NamedChain.read('widths', cAssertWidthAfterResize(200)),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      NamedChain.read('editor', McEditor.cRemove)
    ]),

    Log.chainsAsStep('TINY-6001', 'Test [table_column_resizing="resizetable"], adjusting an inner column should change the table width', [
      NamedChain.write('editor', McEditor.cFromSettings({
        plugins: 'table',
        width: 400,
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
        table_toolbar: '',
        table_column_resizing: 'resizetable',
        table_sizing_mode: 'fixed'
      })),

      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cDragResizeBar('column', 0, 20, 0), TableTestUtils.cInsertRaw(pixelTable)), 'widths'),
      NamedChain.read('widths', cAssertWidthAfterResize(220)),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      NamedChain.read('editor', McEditor.cRemove)
    ]),

    Log.chainsAsStep('TINY-6242', 'Test [table_column_resizing="preservetable"], adjusting the entire table should resize all columns', [
      NamedChain.write('editor', McEditor.cFromSettings({
        plugins: 'table',
        width: 400,
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
        table_toolbar: '',
        table_column_resizing: 'preservetable',
        table_sizing_mode: 'fixed'
      })),

      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cDragHandle('se', 20, 0), TableTestUtils.cInsertRaw(pixelTable)), 'widths'),
      NamedChain.read('widths', cAssertWidthAfterResize(220)),
      NamedChain.read('widths', Chain.op((widths: any) => {
        const firstColWidth = widths.colWidthsAfter[0];
        const lastColWidth = widths.colWidthsAfter[1];
        // Note: Use 96px as the padding + borders are about 14px which adds up to ~110px per cell
        Assertions.assertEq(`First column raw width ${firstColWidth.raw + firstColWidth.unit} should be ~96px`, true, Math.abs(96 - firstColWidth.raw) < pixelDiffThreshold);
        Assertions.assertEq('First column unit width', 'px', firstColWidth.unit);
        Assertions.assertEq(`Last column raw width ${lastColWidth.raw + lastColWidth.unit} should be ~96px`, true, Math.abs(96 - lastColWidth.raw) < pixelDiffThreshold);
        Assertions.assertEq('Last column unit width', 'px', lastColWidth.unit);
      })),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      NamedChain.read('editor', McEditor.cRemove)
    ]),

    Log.chainsAsStep('TINY-6242', 'Test [table_column_resizing="resizetable"], adjusting the entire table should resize the last column', [
      NamedChain.write('editor', McEditor.cFromSettings({
        plugins: 'table',
        width: 400,
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
        table_toolbar: '',
        table_column_resizing: 'resizetable',
        table_sizing_mode: 'fixed'
      })),

      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cDragHandle('ne', 20, 0), TableTestUtils.cInsertRaw(pixelTable)), 'widths'),
      NamedChain.read('widths', cAssertWidthAfterResize(220)),
      NamedChain.read('widths', Chain.op((widths: any) => {
        const lastColWidth = widths.colWidthsAfter[1];
        // Note: Use 106px as the padding + borders are about 14px
        Assertions.assertEq(`Last column raw width ${lastColWidth.raw + lastColWidth.unit} should be ~106px`, true, Math.abs(106 - lastColWidth.raw) < pixelDiffThreshold);
        Assertions.assertEq('Last column unit width', 'px', lastColWidth.unit);
        const firstColWidthBefore = widths.colWidthsBefore[0];
        const firstColWidthAfter = widths.colWidthsAfter[0];
        // Allow for a 1px variation here due to potential rounding issues
        Assertions.assertEq(`First column raw width ${firstColWidthBefore.px + firstColWidthBefore.unit} should be unchanged`, true, Math.abs(firstColWidthBefore.px - firstColWidthAfter.px) <= 1);
        Assertions.assertEq('First column unit width', 'px', firstColWidthAfter.unit);
      })),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      NamedChain.read('editor', McEditor.cRemove)
    ]),

    Log.chainsAsStep('TINY-6242', 'Test [table_column_resizing="resizetable"], adjusting the entire table should not resize more than the last column width', [
      NamedChain.write('editor', McEditor.cFromSettings({
        plugins: 'table',
        width: 400,
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
        table_toolbar: '',
        table_column_resizing: 'resizetable',
        table_sizing_mode: 'relative'
      })),

      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cDragHandle('ne', -250, 0), TableTestUtils.cInsertRaw(percentTable)), 'widths'),
      NamedChain.read('widths', cAssertWidthAfterResize(53, true)),
      NamedChain.read('widths', Chain.op((widths: any) => {
        const firstColWidth = widths.colWidthsAfter[0];
        const lastColWidth = widths.colWidthsAfter[1];
        Assertions.assertEq(`First column raw width ${firstColWidth.raw + firstColWidth.unit} should be ~95%`, true, Math.abs(95 - firstColWidth.raw) <= percentDiffThreshold);
        Assertions.assertEq('First column unit width', '%', firstColWidth.unit);
        Assertions.assertEq(`Last column raw width ${lastColWidth.raw + lastColWidth.unit} should be ~5%`, true, Math.abs(5 - lastColWidth.raw) <= percentDiffThreshold);
        Assertions.assertEq('Last column unit width', '%', lastColWidth.unit);
      })),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      NamedChain.read('editor', McEditor.cRemove)
    ])
  ], success, failure, TestLogs.init());
});
