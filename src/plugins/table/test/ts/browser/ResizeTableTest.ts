import { Assertions, Chain, Mouse, NamedChain, TestLogs } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Editor, ApiChains } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from '../../../../../themes/silver/main/ts/Theme';
import { Cell } from '@ephox/katamari';
import TableTestUtils from '../module/test/TableTestUtils';

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

  const cTableInsertResizeMeasure = NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
    NamedChain.write('events', cBindResizeEvents),
    NamedChain.direct('editor', TableTestUtils.cInsertTable(5, 2), 'element'),
    NamedChain.write('widthBefore', TableTestUtils.cGetWidth),
    NamedChain.read('element', Mouse.cTrueClick),
    NamedChain.read('editor', TableTestUtils.cDragHandle('se', -100, 0)),
    NamedChain.write('widthAfter', TableTestUtils.cGetWidth),
    NamedChain.write('events', cUnbindResizeEvents),
    NamedChain.merge(['widthBefore', 'widthAfter'], 'widths'),
    NamedChain.output('widths')
  ]);

  const cAssertWidthsShouldBe = (unit: string) => Chain.op((input: any) => {
    const expectingPercent = (unit === '%');
    Assertions.assertEq(`table width before resizing is in ${unit}`, expectingPercent, input.widthBefore.isPercent);
    Assertions.assertEq(`table width after resizing is in ${unit}`, expectingPercent, input.widthAfter.isPercent);
  });

  const cAssertEventData = (state, expectedEventName) => Chain.op((_) => {
    Assertions.assertEq('Should be table element', 'TABLE', state.get().target.nodeName);
    Assertions.assertEq('Should be expected resize event', expectedEventName, state.get().type);
    Assertions.assertEq('Should have width', 'number', typeof state.get().width);
    Assertions.assertEq('Should have height', 'number', typeof state.get().height);
  });

  NamedChain.pipeline([
    NamedChain.write('editor', Editor.cFromSettings({
      plugins: 'table',
      width: 400,
      theme: 'silver',
      base_url: '/project/js/tinymce',
    })),

    // when table is resized by one of the handlers it should retain the dimension units after the resize, be it px or %
    cClearResizeEventData,
    NamedChain.direct('editor', cTableInsertResizeMeasure, 'widths'),
    NamedChain.read('widths', cAssertWidths),
    cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
    cAssertEventData(lastObjectResizedEvent, 'objectresized'),

    // using configuration option [table_responsive_width=true] we are able to control the default units of the table
    cClearResizeEventData,
    NamedChain.read('editor', ApiChains.cSetContent('')),
    NamedChain.direct('editor', cTableInsertResizeMeasure, 'widths'),
    NamedChain.read('widths', cAssertWidthsShouldBe('%')),
    cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
    cAssertEventData(lastObjectResizedEvent, 'objectresized'),

    cClearResizeEventData,
    NamedChain.read('editor', ApiChains.cSetContent('')),
    NamedChain.read('editor', ApiChains.cSetSetting('table_responsive_width', false)),
    NamedChain.direct('editor', cTableInsertResizeMeasure, 'widths'),
    NamedChain.read('widths', cAssertWidthsShouldBe('px')),
    cAssertEventData(lastObjectResizeStartEvent, 'objectresizestart'),
    cAssertEventData(lastObjectResizedEvent, 'objectresized'),

    NamedChain.read('editor', Editor.cRemove)
  ], function () {
    success();
  }, failure, TestLogs.init());
});
