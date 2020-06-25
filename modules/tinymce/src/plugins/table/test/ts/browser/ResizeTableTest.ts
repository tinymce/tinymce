import { Assertions, Chain, Log, Mouse, NamedChain, Pipeline, TestLogs } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { ApiChains, Editor as McEditor } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import * as TableTestUtils from '../module/test/TableTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.table.ResizeTableTest', (success, failure) => {
  const lastObjectResizeStartEvent = Cell<any>(null);
  const lastObjectResizedEvent = Cell<any>(null);

  Plugin();
  SilverTheme();

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

  const cInsertResizeMeasure = (cInsert: Chain<Editor, Element>) => NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
    NamedChain.write('events', cBindResizeEvents),
    NamedChain.direct('editor', cInsert, 'element'),
    NamedChain.write('widthBefore', TableTestUtils.cGetWidth),
    NamedChain.read('element', Mouse.cTrueClick),
    NamedChain.read('editor', TableTestUtils.cDragHandle('se', -100, -20)),
    NamedChain.write('widthAfter', TableTestUtils.cGetWidth),
    NamedChain.write('events', cUnbindResizeEvents),
    NamedChain.merge([ 'widthBefore', 'widthAfter' ], 'widths'),
    NamedChain.output('widths')
  ]);

  const cAssertUnitBeforeResize = (unit: string) => Chain.op((widths: any) => {
    Assertions.assertEq(`table width before resizing is in ${unit}`, unit, widths.widthBefore.unit);
  });

  const cAssertUnitAfterResize = (unit: string) => Chain.op((widths: any) => {
    Assertions.assertEq(`table width after resizing is in ${unit}`, unit, widths.widthAfter.unit);
  });

  const cAssertWidthBeforeResize = (width: string) => Chain.op((widths: any) => {
    Assertions.assertEq(`table raw width before resizing is ${width}`, width, widths.widthBefore.raw);
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
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cInsertRaw('<table style="width: 100%;"><tbody><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr></tbody></table>')), 'widths'),
      NamedChain.read('widths', cAssertUnitAfterResize('%')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cInsertRaw('<table style="width: 200px;"><tbody><tr><td></td><td></td></tr></tbody></table>')), 'widths'),
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
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cInsertTable(5, 2)), 'widths'),
      NamedChain.read('widths', cAssertWidths),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cInsertTable(5, 2)), 'widths'),
      NamedChain.read('widths', cAssertUnitBeforeResize('%')),
      NamedChain.read('widths', cAssertUnitAfterResize('%')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      // Force % on unset tables with [table_sizing_mode="relative"]
      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cInsertRaw('<table><tbody><tr><td><br></td><td><br></td></tr></tbody></table>')), 'widths'),
      NamedChain.read('widths', cAssertUnitAfterResize('%')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      // Force % on tables with that are initially set to px with [table_sizing_mode="relative"]
      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cInsertRaw('<table style="width: 200px;"><tbody><tr><td></td><td></td></tr></tbody></table>')), 'widths'),
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
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cInsertTable(5, 2)), 'widths'),
      NamedChain.read('widths', cAssertUnitBeforeResize('px')),
      NamedChain.read('widths', cAssertUnitAfterResize('px')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      // Force px on unset tables with [table_sizing_mode="fixed"]
      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cInsertRaw('<table><tbody><tr><td><br></td><td><br></td></tr></tbody></table>')), 'widths'),
      NamedChain.read('widths', cAssertUnitAfterResize('px')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      // Force px on tables with that are initially set to % with [table_sizing_mode="fixed"]
      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cInsertRaw('<table style="width: 100%;"><tbody><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr></tbody></table>')), 'widths'),
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
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cInsertTable(5, 2)), 'widths'),
      NamedChain.read('widths', cAssertUnitBeforeResize(null)),
      NamedChain.read('widths', cAssertUnitAfterResize('%')),
      NamedChain.read('widths', cAssertWidthBeforeResize(null)),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      // Force % on unset tables with [table_sizing_mode="responsive"]
      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cInsertRaw('<table><tbody><tr><td><br></td><td><br></td></tr></tbody></table>')), 'widths'),
      NamedChain.read('widths', cAssertUnitAfterResize('%')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      // Force % on tables with that are initially set to px with [table_sizing_mode="responsive"]
      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cInsertRaw('<table style="width: 200px;"><tbody><tr><td></td><td></td></tr></tbody></table>')), 'widths'),
      NamedChain.read('widths', cAssertUnitAfterResize('%')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      NamedChain.read('editor', McEditor.cRemove)
    ])
  ], success, failure, TestLogs.init());
});
