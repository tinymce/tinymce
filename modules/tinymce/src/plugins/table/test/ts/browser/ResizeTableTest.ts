import { Assertions, Chain, Logger, Mouse, NamedChain, Pipeline, TestLogs } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Cell } from '@ephox/katamari';
import { ApiChains, Editor as McEditor } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import TableTestUtils from '../module/test/TableTestUtils';
import Editor from 'tinymce/core/api/Editor';

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
    NamedChain.merge(['widthBefore', 'widthAfter'], 'widths'),
    NamedChain.output('widths')
  ]);

  const cAssertUnitBeforeResize = (unit: string) => Chain.op((widths: any) => {
    Assertions.assertEq(`table width before resizing is in ${unit}`, unit === '%', widths.widthBefore.isPercent);
  });

  const cAssertUnitAfterResize = (unit: string) => Chain.op((widths: any) => {
    Assertions.assertEq(`table width after resizing is in ${unit}`, unit === '%', widths.widthAfter.isPercent);
  });

  const cAssertEventData = (state, expectedEventName) => Chain.op((_) => {
    Assertions.assertEq('Should be table element', 'TABLE', state.get().target.nodeName);
    Assertions.assertEq('Should be expected resize event', expectedEventName, state.get().type);
    Assertions.assertEq('Should have width', 'number', typeof state.get().width);
    Assertions.assertEq('Should have height', 'number', typeof state.get().height);
  });

  Pipeline.async({}, [
    Logger.t('Test default config of [table_responsive_width=unset], resize should detect current unit', Chain.asStep({}, [
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
    ])),

    Logger.t('Test default config of [table_responsive_width=true], new tables should default to % and resize should force %', Chain.asStep({}, [
      NamedChain.write('editor', McEditor.cFromSettings({
        plugins: 'table',
        width: 400,
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
        table_responsive_width: true
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

      // Force % on unset tables with [table_responsive_width=true]
      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cInsertRaw('<table><tbody><tr><td><br></td><td><br></td></tr></tbody></table>')), 'widths'),
      NamedChain.read('widths', cAssertUnitAfterResize('%')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      // Force % on tables with that are initially set to px with [table_responsive_width=true]
      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cInsertRaw('<table style="width: 200px;"><tbody><tr><td></td><td></td></tr></tbody></table>')), 'widths'),
      NamedChain.read('widths', cAssertUnitAfterResize('%')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      NamedChain.read('editor', McEditor.cRemove)
    ])),

    Logger.t('Test [table_responsive_width=false], new tables should default to px and resize should force px', Chain.asStep({}, [
      NamedChain.write('editor', McEditor.cFromSettings({
        plugins: 'table',
        width: 400,
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
        table_responsive_width: false
      })),

      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cInsertTable(5, 2)), 'widths'),
      NamedChain.read('widths', cAssertUnitBeforeResize('px')),
      NamedChain.read('widths', cAssertUnitAfterResize('px')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      // Force px on unset tables with [table_responsive_width=false]
      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cInsertRaw('<table><tbody><tr><td><br></td><td><br></td></tr></tbody></table>')), 'widths'),
      NamedChain.read('widths', cAssertUnitAfterResize('px')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      // Force px on tables with that are initially set to % with [table_responsive_width=false]
      cClearResizeEventData,
      NamedChain.read('editor', ApiChains.cSetContent('')),
      NamedChain.direct('editor', cInsertResizeMeasure(TableTestUtils.cInsertRaw('<table style="width: 100%;"><tbody><tr><td style="width: 50%;"></td><td style="width: 50%;"></td></tr></tbody></table>')), 'widths'),
      NamedChain.read('widths', cAssertUnitAfterResize('px')),
      cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
      cAssertEventData(lastObjectResizedEvent, 'objectresized'),

      NamedChain.read('editor', McEditor.cRemove)
    ])),
  ], function () {
    success();
  }, failure, TestLogs.init());
});