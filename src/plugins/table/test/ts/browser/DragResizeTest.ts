import {
    Assertions, Chain, GeneralSteps, Logger, Mouse, Pipeline, Step, UiFinder, Waiter, RawAssertions
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Cell } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element, Height, Hierarchy, Width, Attr } from '@ephox/sugar';

import TablePlugin from 'tinymce/plugins/table/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.DragResizeTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  TablePlugin();

  const sDragDrop = function (container, selector, dx, dy) {
    return Chain.asStep(container, [
      UiFinder.cFindIn(selector),
      Mouse.cMouseDown,
      Mouse.cMouseMoveTo(dx, dy),
      Mouse.cMouseUpTo(dx, dy)
    ]);
  };

  const sDragDropBlocker = function (container, selector, dx, dy) {
    return Chain.asStep({}, [
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
    ]);
  };

  const sMouseover = function (container, selector) {
    return Chain.asStep(container, [
      UiFinder.cFindIn(selector),
      Mouse.cMouseOver
    ]);
  };

  const state = Cell(null);

  const sSetStateFrom = function (editor, path) {
    return Step.sync(function () {
      const element = Hierarchy.follow(Element.fromDom(editor.getBody()), path).getOrDie('could not find element');
      const height = Height.get(element);
      const width = Width.get(element);

      state.set({
        h: height,
        w: width
      });
    });
  };

  const sResetState = Step.sync(function () {
    state.set(null);
  });

  const looseEqual = function (exp, act, loose) {
    return Math.abs(exp - act) <= loose;
  };

  const sAssertNoDataStyle = (editor, path) => Step.sync(() => {
    const element = Hierarchy.follow(Element.fromDom(editor.getBody()), path).getOrDie('could not find element');
    const hasDataStyle = Attr.has(element, 'data-mce-style');

    RawAssertions.assertEq('should not have data style', false, hasDataStyle);
  });

  const sAssertSizeChange = function (editor, path, change) {
    return Step.sync(function () {
      const element = Hierarchy.follow(Element.fromDom(editor.getBody()), path).getOrDie('could not find element');
      const height = Height.get(element);
      const width = Width.get(element);

      const changedHeight = state.get().h + change.dh;
      const changedWidth = state.get().w + change.dw;

      Assertions.assertEq('height has changed as expected', true, looseEqual(changedHeight, height, 2));
      Assertions.assertEq('width has changed as expected', true, looseEqual(changedWidth, width, 2));
    });
  };

  const tableHtml = '<table style="border-collapse: collapse; width: 367px; height: 90px;" border="1">' +
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

  const sWaitForSelection = function (editor, tinyApis) {
    return GeneralSteps.sequence([
      tinyApis.sSetSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 0),
      Waiter.sTryUntil(
        'wait for resize handles',
        UiFinder.sExists(Element.fromDom(editor.getBody()), '#mceResizeHandlese'),
        10, 1000
      )
    ]);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    Pipeline.async({}, [
      tinyApis.sFocus,

      Logger.t('resize table height by dragging bottom', GeneralSteps.sequence([
        tinyApis.sSetContent('<table style="border-collapse: collapse;border: 0;"><tbody><tr><td style="height:45px;">a</td></tr><tr><td style="height:45px;">a</td></tr></tbody></table>'),
        sSetStateFrom(editor, [0, 0, 0, 0]),
        sWaitForSelection(editor, tinyApis),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, 50),
        sAssertSizeChange(editor, [0, 0, 0, 0], { dh: 50, dw: 0 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ])),

      Logger.t('resize table width by dragging right side', GeneralSteps.sequence([
        tinyApis.sSetContent('<table style="border-collapse: collapse;border: 0;"><tbody><tr><td style="height:45px;">a</td></tr><tr><td style="height:45px;">a</td></tr></tbody></table>'),
        sSetStateFrom(editor, [0, 0, 0, 0]),
        sWaitForSelection(editor, tinyApis),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', 50, 0),
        sAssertSizeChange(editor, [0, 0, 0, 0], { dh: 0, dw: 50 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ])),

      Logger.t('Resize table bigger with handle, then resize row height bigger by dragging middle border', GeneralSteps.sequence([
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [0]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, 50),
        sAssertSizeChange(editor, [0], { dh: 100, dw: 50 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ])),

      Logger.t('Resize table bigger with handle, then resize row height smaller by dragging middle border', GeneralSteps.sequence([
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [0]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, -30),
        sAssertSizeChange(editor, [0], { dh: 20, dw: 50 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ])),

      Logger.t('Resize table bigger with handle, then resize column width bigger by dragging middle border', GeneralSteps.sequence([
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [0]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', 50, 0),
        sAssertSizeChange(editor, [0], { dh: 50, dw: 50 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ])),

      Logger.t('Resize table bigger with handle, then resize column width smaller by dragging middle border', GeneralSteps.sequence([
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [0]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', -30, 0),
        sAssertSizeChange(editor, [0], { dh: 50, dw: 50 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ])),

      Logger.t('Resize table smaller with handle, then resize row height bigger by dragging middle border', GeneralSteps.sequence([
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [0]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', -10, -10),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, 50),
        sAssertSizeChange(editor, [0], { dh: 40, dw: -10 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ])),

      Logger.t('Resize table smaller with handle, then resize row height smaller by dragging middle border', GeneralSteps.sequence([
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [0]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', -10, -10),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, -20),
        sAssertSizeChange(editor, [0], { dh: -30, dw: -10 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ])),

      Logger.t('Resize table smaller with handle, then resize column width bigger by dragging middle border', GeneralSteps.sequence([
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [0]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', -10, -10),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', 50, 0),
        sAssertSizeChange(editor, [0], { dh: -10, dw: -10 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ])),

      Logger.t('Resize table smaller with handle, then resize column width smaller by dragging middle border', GeneralSteps.sequence([
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [0]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', -10, -10),
        sMouseover(Element.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(Element.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', -20, 0),
        sAssertSizeChange(editor, [0], { dh: -10, dw: -10 }),
        sAssertNoDataStyle(editor, [0]),
        sResetState
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'table',
    content_style: 'table {border: 0;padding:0;} td {border: 0;padding:0;}',
    height: 400,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
