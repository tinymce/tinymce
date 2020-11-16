import { Assertions, Chain, GeneralSteps, Log, Logger, Mouse, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Attribute, Height, Hierarchy, SelectorFind, SugarElement, Width } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

import TablePlugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.DragResizeTest', (success, failure) => {
  SilverTheme();
  TablePlugin();

  const sDragDrop = (container: SugarElement, selector: string, dx: number, dy: number) => Logger.t('Drag from a point and drop at specified point', Chain.asStep(container, [
    UiFinder.cFindIn(selector),
    Mouse.cMouseDown,
    Mouse.cMouseMoveTo(dx, dy),
    Mouse.cMouseUpTo(dx, dy)
  ]));

  const sDragDropBlocker = (container: SugarElement, selector: string, dx: number, dy: number) => Logger.t('Block dragging and dropping of any other element in the container', Chain.asStep({}, [
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

  const sMouseover = (container: SugarElement, selector: string) => Logger.t('Place mouse point over element', Chain.asStep(container, [
    UiFinder.cFindIn(selector),
    Mouse.cMouseOver
  ]));

  const state = Cell(null);

  const sSetStateFrom = (editor: Editor, path: number[]) => Logger.t('Set height and width', Step.sync(() => {
    const element = Hierarchy.follow(SugarElement.fromDom(editor.getBody()), path).getOrDie('could not find element') as SugarElement<HTMLElement>;
    const height = Height.get(element);
    const width = Width.get(element);

    state.set({
      h: height,
      w: width
    });
  }));

  const sResetState = Logger.t('Reset height and width', Step.sync(() => {
    state.set(null);
  }));

  const looseEqual = (exp: number, act: number, loose: number) => Math.abs(exp - act) <= loose;

  const sAssertNoDataStyle = (editor: Editor, path: number[]) => Logger.t('Assert no data style is applied', Step.sync(() => {
    const element = Hierarchy.follow(SugarElement.fromDom(editor.getBody()), path).getOrDie('could not find element');
    const hasDataStyle = Attribute.has(element, 'data-mce-style');

    Assert.eq('should not have data style', false, hasDataStyle);
  }));

  const sAssertSizeChange = (editor: Editor, path: number[], change: { dh: number; dw: number }) => Logger.t('Asset change in height and width', Step.sync(() => {
    const element = Hierarchy.follow(SugarElement.fromDom(editor.getBody()), path).getOrDie('could not find element') as SugarElement<HTMLElement>;
    const height = Height.get(element);
    const width = Width.get(element);

    const changedHeight = state.get().h + change.dh;
    const changedWidth = state.get().w + change.dw;

    Assertions.assertEq('height is ' + height + ' but expected ' + changedHeight, true, looseEqual(changedHeight, height, 4));
    Assertions.assertEq('width is ' + width + ' but expected ' + changedWidth, true, looseEqual(changedWidth, width, 4));
  }));

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

  const colGroupTableHtml = '<table style="border-collapse: collapse; width: 367px; height: 190px;" border="1">' +
    `<colgroup><col style="width: 180px;" /><col style="width: 180px;" /></colgroup>` +
    '<tbody>' +
    '<tr>' +
    '<td>a</td>' +
    '<td>b</td>' +
    '</tr>' +
    '<tr>' +
    '<td>1</td>' +
    '<td>2</td>' +
    '</tr>' +
    '</tbody>' +
    '</table>';

  const sWaitForSelection = (editor: Editor, tinyApis: TinyApis) => Logger.t('Wait for resize handles to be visible', GeneralSteps.sequence([
    tinyApis.sSetSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0),
    Waiter.sTryUntil(
      'wait for resize handles',
      UiFinder.sExists(SugarElement.fromDom(editor.getBody()), '#mceResizeHandlese')
    )
  ]));

  const sSetResizeFalse = (editor: Editor, selector: string) => Step.sync(() => {
    const elm = SelectorFind.descendant(SugarElement.fromDom(editor.getBody()), selector).getOrDie(`Could not find ${selector}`);
    Attribute.set(elm, 'data-mce-resize', 'false');
  });

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    Pipeline.async({}, [
      tinyApis.sFocus(),

      Log.stepsAsStep('TBA', 'Table: resize table height by dragging bottom', [
        tinyApis.sSetContent('<table style="border-collapse: collapse;border: 0;"><tbody><tr><td style="height:45px;">a</td></tr><tr><td style="height:45px;">a</td></tr></tbody></table>'),
        sSetStateFrom(editor, [ 0, 0, 0, 0 ]),
        sWaitForSelection(editor, tinyApis),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, 50),
        sAssertSizeChange(editor, [ 0, 0, 0, 0 ], { dh: 50, dw: 0 }),
        sAssertNoDataStyle(editor, [ 0 ]),
        sResetState
      ]),

      Log.stepsAsStep('TBA', 'Table: resize table width by dragging right side', [
        tinyApis.sSetContent('<table style="border-collapse: collapse;border: 0;"><tbody><tr><td style="height:45px;">a</td></tr><tr><td style="height:45px;">a</td></tr></tbody></table>'),
        sSetStateFrom(editor, [ 0, 0, 0, 0 ]),
        sWaitForSelection(editor, tinyApis),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', 50, 0),
        sAssertSizeChange(editor, [ 0, 0, 0, 0 ], { dh: 0, dw: 50 }),
        sAssertNoDataStyle(editor, [ 0 ]),
        sResetState
      ]),

      Log.stepsAsStep('TBA', 'Table: Resize table bigger with handle, then resize row height bigger by dragging middle border', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [ 0 ]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(SugarElement.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, 50),
        sAssertSizeChange(editor, [ 0 ], { dh: 100, dw: 50 }),
        sAssertNoDataStyle(editor, [ 0 ]),
        sResetState
      ]),

      Log.stepsAsStep('TBA', 'Table: Resize table bigger with handle, then resize row height smaller by dragging middle border', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [ 0 ]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(SugarElement.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, -30),
        sAssertSizeChange(editor, [ 0 ], { dh: 20, dw: 50 }),
        sAssertNoDataStyle(editor, [ 0 ]),
        sResetState
      ]),

      Log.stepsAsStep('TBA', 'Table: Resize table bigger with handle, then resize column width bigger by dragging middle border', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [ 0 ]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(SugarElement.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', 50, 0),
        sAssertSizeChange(editor, [ 0 ], { dh: 50, dw: 50 }),
        sAssertNoDataStyle(editor, [ 0 ]),
        sResetState
      ]),

      Log.stepsAsStep('TBA', 'Table: Resize table bigger with handle, then resize column width smaller by dragging middle border', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [ 0 ]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(SugarElement.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', -30, 0),
        sAssertSizeChange(editor, [ 0 ], { dh: 50, dw: 50 }),
        sAssertNoDataStyle(editor, [ 0 ]),
        sResetState
      ]),

      Log.stepsAsStep('TBA', 'Table: Resize table smaller with handle, then resize row height bigger by dragging middle border', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [ 0 ]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(SugarElement.fromDom(editor.getBody()), '#mceResizeHandlese', -10, -10),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, 50),
        sAssertSizeChange(editor, [ 0 ], { dh: 40, dw: -10 }),
        sAssertNoDataStyle(editor, [ 0 ]),
        sResetState
      ]),

      Log.stepsAsStep('TBA', 'Table: Resize table smaller with handle, then resize row height smaller by dragging middle border', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [ 0 ]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(SugarElement.fromDom(editor.getBody()), '#mceResizeHandlese', -10, -10),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, -20),
        sAssertSizeChange(editor, [ 0 ], { dh: -30, dw: -10 }),
        sAssertNoDataStyle(editor, [ 0 ]),
        sResetState
      ]),

      Log.stepsAsStep('TBA', 'Table: Resize table smaller with handle, then resize column width bigger by dragging middle border', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [ 0 ]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(SugarElement.fromDom(editor.getBody()), '#mceResizeHandlese', -10, -10),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', 50, 0),
        sAssertSizeChange(editor, [ 0 ], { dh: -10, dw: -10 }),
        sAssertNoDataStyle(editor, [ 0 ]),
        sResetState
      ]),

      Log.stepsAsStep('TBA', 'Table: Resize table smaller with handle, then resize column width smaller by dragging middle border', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [ 0 ]),
        sWaitForSelection(editor, tinyApis),
        sDragDrop(SugarElement.fromDom(editor.getBody()), '#mceResizeHandlese', -10, -10),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', -20, 0),
        sAssertSizeChange(editor, [ 0 ], { dh: -10, dw: -10 }),
        sAssertNoDataStyle(editor, [ 0 ]),
        sResetState
      ]),

      Log.stepsAsStep('TINY-6600', 'Table (normal): Resize table and column with resize prevented on td', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [ 0 ]),
        sSetResizeFalse(editor, 'td'),
        sWaitForSelection(editor, tinyApis),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        Waiter.sTryUntil(
          'wait for bar to be removed',
          UiFinder.sNotExists(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]')
        ),
        // Verify resize handle can be used and the other column without data-mce-resize="false" can be resized
        sDragDrop(SugarElement.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-column="1"]', 50, 0),
        sAssertSizeChange(editor, [ 0 ], { dh: 50, dw: 100 }),
        sAssertNoDataStyle(editor, [ 0 ]),
        sResetState
      ]),

      Log.stepsAsStep('TINY-6600', 'Table (colgroup): Resize table and column with resize prevented on td', [
        tinyApis.sSetContent(colGroupTableHtml),
        sSetStateFrom(editor, [ 0 ]),
        sSetResizeFalse(editor, 'td'),
        // Set selection in first cell
        tinyApis.sSetSelection([ 0, 1, 0, 0, 0 ], 0, [ 0, 1, 0, 0, 0 ], 0),
        Waiter.sTryUntil(
          'wait for resize handles',
          UiFinder.sExists(SugarElement.fromDom(editor.getBody()), '#mceResizeHandlese')
        ),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        Waiter.sTryUntil(
          'wait for bar to be removed',
          UiFinder.sNotExists(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]')
        ),
        // Verify resize handle can be used and the other column without data-mce-resize="false" can be resized
        sDragDrop(SugarElement.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-column="1"]', 50, 0),
        sAssertSizeChange(editor, [ 0 ], { dh: 50, dw: 100 }),
        sAssertNoDataStyle(editor, [ 0 ]),
        sResetState
      ]),

      Log.stepsAsStep('TINY-6600', 'Table (colgroup): Resize table and column with resize prevented on col', [
        tinyApis.sSetContent(colGroupTableHtml),
        sSetStateFrom(editor, [ 0 ]),
        sSetResizeFalse(editor, 'col'),
        // Set selection in first cell
        tinyApis.sSetSelection([ 0, 1, 0, 0, 0 ], 0, [ 0, 1, 0, 0, 0 ], 0),
        Waiter.sTryUntil(
          'wait for resize handles',
          UiFinder.sExists(SugarElement.fromDom(editor.getBody()), '#mceResizeHandlese')
        ),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        Waiter.sTryUntil(
          'wait for bar to be removed',
          UiFinder.sNotExists(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]')
        ),
        // Verify resize handle can be used and the other column without data-mce-resize="false" can be resized
        sDragDrop(SugarElement.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-column="1"]', 50, 0),
        sAssertSizeChange(editor, [ 0 ], { dh: 50, dw: 100 }),
        sAssertNoDataStyle(editor, [ 0 ]),
        sResetState
      ]),

      Log.stepsAsStep('TINY-6600', 'Table: Resize table and row with resize prevented on tr', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [ 0 ]),
        sSetResizeFalse(editor, 'tr'),
        sWaitForSelection(editor, tinyApis),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        Waiter.sTryUntil(
          'wait for bar to be removed',
          UiFinder.sNotExists(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]')
        ),
        // Verify resize handle can be used and the other row without data-mce-resize="false" can be resized
        sDragDrop(SugarElement.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        sDragDropBlocker(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-row="1"]', 0, 50),
        sAssertSizeChange(editor, [ 0 ], { dh: 100, dw: 50 }),
        sAssertNoDataStyle(editor, [ 0 ]),
        sResetState
      ]),

      Log.stepsAsStep('TINY-6600', 'Table: Resize table with resize prevented on table', [
        tinyApis.sSetContent(tableHtml),
        sSetStateFrom(editor, [ 0 ]),
        sSetResizeFalse(editor, 'table'),
        // Set selection in first cell
        tinyApis.sSetSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0),
        sMouseover(SugarElement.fromDom(editor.getBody()), 'td'),
        Waiter.sTryUntil(
          'resize handle should not exist',
          UiFinder.sNotExists(SugarElement.fromDom(editor.getDoc().documentElement), '#mceResizeHandlese')
        ),
        Waiter.sTryUntil(
          'resize bars should not exist',
          UiFinder.sNotExists(SugarElement.fromDom(editor.getDoc().documentElement), 'div[data-row],div[data-column]')
        )
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
