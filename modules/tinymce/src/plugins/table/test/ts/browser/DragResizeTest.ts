import {
    Assertions, Chain, Log, Mouse, Pipeline, Step, UiFinder, Waiter, RawAssertions, Logger, GeneralSteps
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Cell } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element, Height, Hierarchy, Width, Attr } from '@ephox/sugar';

import TablePlugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.DragResizeTest', (success, failure) => {
  SilverTheme();
  TablePlugin();

  const sDragDrop = (container, selector, dx, dy) => {
    return Logger.t('Drag from a point and drop at specified point', Chain.asStep(container, [
      UiFinder.cFindIn(selector),
      Mouse.cMouseDown,
      Mouse.cMouseMoveTo(dx, dy),
      Mouse.cMouseUpTo(dx, dy)
    ]));
  };

  const sDragDropBlocker = (container, selector, dx, dy) => {
    return Logger.t('Block dragging and dropping of any other element in the container', Chain.asStep({}, [
      Chain.fromParent(Chain.inject(container), [
        Chain.fromChains([
          UiFinder.cFindIn(selector),
          Mouse.cMouseDown
        ]),
        Chain.fromChains([
          UiFinder.cFindIn('div.ephox-dragster-blocker'),
          Mouse.cMouseMove,
          Mouse.cMouseMoveTo(dx, dy),
          Mouse.cMouseUpTo(dx, dy)
        ])
      ])
    ]));
  };

  const sMouseover = (container, selector) => {
    return Logger.t('Place mouse point over element', Chain.asStep(container, [
      UiFinder.cFindIn(selector),
      Mouse.cMouseOver
    ]));
  };

  const state = Cell(null);

  const sSetStateFrom = (editor, path) => {
    return Logger.t('Set height and width', Step.sync(() => {
      const element = Hierarchy.follow(Element.fromDom(editor.getBody()), path).getOrDie('could not find element');
      const height = Height.get(element);
      const width = Width.get(element);

      state.set({
        h: height,
        w: width
      });
    }));
  };

  const sResetState = Logger.t('Reset height and width', Step.sync(() => {
    state.set(null);
  }));

  const looseEqual = (exp, act, loose) => {
    return Math.abs(exp - act) <= loose;
  };

  const sAssertNoDataStyle = (editor, path) => Logger.t('Assert no data style is applied', Step.sync(() => {
    const element = Hierarchy.follow(Element.fromDom(editor.getBody()), path).getOrDie('could not find element');
    const hasDataStyle = Attr.has(element, 'data-mce-style');

    RawAssertions.assertEq('should not have data style', false, hasDataStyle);
  }));

  const sAssertSizeChange = (editor, path, change) => {
    return Logger.t('Asset change in height and width', Step.sync(() => {
      const element = Hierarchy.follow(Element.fromDom(editor.getBody()), path).getOrDie('could not find element');
      const height = Height.get(element);
      const width = Width.get(element);

      const changedHeight = state.get().h + change.dh;
      const changedWidth = state.get().w + change.dw;

      Assertions.assertEq('height is ' + height + ' but expected ' + changedHeight, true, looseEqual(changedHeight, height, 4));
      Assertions.assertEq('width is ' + width + ' but expected ' + changedWidth, true, looseEqual(changedWidth, width, 4));
    }));
  };

  const tableHtml = '<table style="border-collapse: collapse; width: 367px; height: 190px;" border="1">' +
                    '<tbody>' +
                      '<tr>' +
                        '<td style="width: 180px;">a</td>' +
                        '<td style="width: 180px;">b</td>' +
                      '</tr>' +
                      '<tr>' +
                        '<td style="width: 180px;">1</td>' +
                        '<td style="width: 180px;">2</td>' +
                      '</tr>' +
                    '</tbody>' +
                  '</table>';

  const sWaitForSelection = (editor, tinyApis) => {
    return Logger.t('Wait for resize handles to be visible', GeneralSteps.sequence([
      tinyApis.sSetSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 0),
      Waiter.sTryUntil(
        'wait for resize handles',
        UiFinder.sExists(Element.fromDom(editor.getBody()), '#mceResizeHandlese'),
        10, 1000
      )
    ]));
  };

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    Pipeline.async({}, [
      tinyApis.sFocus,

      Log.stepsAsStep('TBA', 'Table: resize table height by dragging bottom', [
        tinyApis.sSetContent('<table style="border-collapse: collapse;border: 0;"><tbody><tr><td style="height:45px;">a</td></tr><tr><td style="height:45px;">a</td></tr></tbody></table>'),
        sSetStateFrom(editor, [0, 0, 0, 0]),
        sWaitForSelection(editor, tinyApis),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, 50),
        sAssertSizeChange(editor, [0, 0, 0, 0], { dh: 50, dw: 0 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ]),

      Log.stepsAsStep('TBA', 'Table: resize table width by dragging right side', [
        tinyApis.sSetContent('<table style="border-collapse: collapse;border: 0;"><tbody><tr><td style="height:45px;">a</td></tr><tr><td style="height:45px;">a</td></tr></tbody></table>'),
        sSetStateFrom(editor, [0, 0, 0, 0]),
        sWaitForSelection(editor, tinyApis),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', 50, 0),
        sAssertSizeChange(editor, [0, 0, 0, 0], { dh: 0, dw: 50 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ]),

      Log.stepsAsStep('TBA', 'Table: Resize table bigger with handle, then resize row height bigger by dragging middle border', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [0]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, 50),
        sAssertSizeChange(editor, [0], { dh: 100, dw: 50 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ]),

      Log.stepsAsStep('TBA', 'Table: Resize table bigger with handle, then resize row height smaller by dragging middle border', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [0]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, -30),
        sAssertSizeChange(editor, [0], { dh: 20, dw: 50 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ]),

      Log.stepsAsStep('TBA', 'Table: Resize table bigger with handle, then resize column width bigger by dragging middle border', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [0]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', 50, 0),
        sAssertSizeChange(editor, [0], { dh: 50, dw: 50 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ]),

      Log.stepsAsStep('TBA', 'Table: Resize table bigger with handle, then resize column width smaller by dragging middle border', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [0]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', -30, 0),
        sAssertSizeChange(editor, [0], { dh: 50, dw: 50 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ]),

      Log.stepsAsStep('TBA', 'Table: Resize table smaller with handle, then resize row height bigger by dragging middle border', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [0]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', -10, -10),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, 50),
        sAssertSizeChange(editor, [0], { dh: 40, dw: -10 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ]),

      Log.stepsAsStep('TBA', 'Table: Resize table smaller with handle, then resize row height smaller by dragging middle border', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [0]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', -10, -10),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, -20),
        sAssertSizeChange(editor, [0], { dh: -30, dw: -10 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ]),

      Log.stepsAsStep('TBA', 'Table: Resize table smaller with handle, then resize column width bigger by dragging middle border', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [0]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', -10, -10),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', 50, 0),
        sAssertSizeChange(editor, [0], { dh: -10, dw: -10 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ]),

      Log.stepsAsStep('TBA', 'Table: Resize table smaller with handle, then resize column width smaller by dragging middle border', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [0]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', -10, -10),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', -20, 0),
        sAssertSizeChange(editor, [0], { dh: -10, dw: -10 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    content_style: 'table {border: 0;padding:0;} td {border: 0;padding:0;}',
    height: 400,
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    table_responsive_width: false
  }, success, failure);
});
