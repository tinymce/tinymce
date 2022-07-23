import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { Attribute, Height, Hierarchy, SelectorFind, SugarElement, Width } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.models.dom.table.DragResizeTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    content_style: 'table {border: 0;padding:0;} td {border: 0;padding:0;}',
    height: 400,
    base_url: '/project/tinymce/js/tinymce',
    table_sizing_mode: 'fixed'
  }, [], true);

  const dragDrop = (container: SugarElement<HTMLElement>, selector: string, dx: number, dy: number) => {
    const elem = UiFinder.findIn(container, selector).getOrDie();
    Mouse.mouseDown(elem);
    Mouse.mouseMoveTo(elem, dx, dy);
    Mouse.mouseUpTo(elem, dx, dy);
  };

  const dragDropBlocker = (container: SugarElement<HTMLElement>, selector: string, dx: number, dy: number) => {
    const elem = UiFinder.findIn(container, selector).getOrDie();
    Mouse.mouseDown(elem);
    const blocker = UiFinder.findIn(container, 'div.ephox-dragster-blocker').getOrDie();
    Mouse.mouseMove(blocker);
    Mouse.mouseMoveTo(blocker, dx, dy);
    Mouse.mouseUpTo(blocker, dx, dy);
  };

  const mouseover = (container: SugarElement<HTMLElement>, selector: string) => {
    const elem = UiFinder.findIn(container, selector).getOrDie();
    Mouse.mouseOver(elem);
  };

  const state = Cell<{ h: number; w: number } | null>(null);

  const setStateFrom = (editor: Editor, path: number[]) => {
    const element = Hierarchy.follow(TinyDom.body(editor), path).getOrDie('could not find element') as SugarElement<HTMLElement>;
    const height = Height.get(element);
    const width = Width.get(element);

    state.set({
      h: height,
      w: width
    });
  };

  const resetState = () => state.set(null);

  const assertNoDataStyle = (editor: Editor, path: number[]) => {
    const element = Hierarchy.follow(TinyDom.body(editor), path).getOrDie('could not find element');
    const hasDataStyle = Attribute.has(element, 'data-mce-style');

    assert.isFalse(hasDataStyle, 'should not have data style');
  };

  const assertSizeChange = (editor: Editor, path: number[], change: { dh: number; dw: number }) => {
    const element = Hierarchy.follow(TinyDom.body(editor), path).getOrDie('could not find element') as SugarElement<HTMLElement>;
    const height = Height.get(element);
    const width = Width.get(element);

    const currentState = state.get() as { h: number; w: number };
    assert.isNotNull(currentState);

    const changedHeight = currentState.h + change.dh;
    const changedWidth = currentState.w + change.dw;

    assert.approximately(changedHeight, height, 4, 'height is ' + height + ' but expected ' + changedHeight);
    assert.approximately(changedWidth, width, 4, 'width is ' + width + ' but expected ' + changedWidth);
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

  const pWaitForSelection = async (editor: Editor) => {
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    await Waiter.pTryUntil(
      'wait for resize handles',
      () => UiFinder.exists(TinyDom.body(editor), '#mceResizeHandlese')
    );
  };

  const setResizeFalse = (editor: Editor, selector: string) => {
    const elm = SelectorFind.descendant(TinyDom.body(editor), selector).getOrDie(`Could not find ${selector}`);
    Attribute.set(elm, 'data-mce-resize', 'false');
  };

  afterEach(() => {
    resetState();
  });

  it('TBA: resize table height by dragging bottom', async () => {
    const editor = hook.editor();
    editor.setContent('<table style="border-collapse: collapse;border: 0;"><tbody><tr><td style="height:45px;">a</td></tr><tr><td style="height:45px;">a</td></tr></tbody></table>');
    setStateFrom(editor, [ 0, 0, 0, 0 ]);
    await pWaitForSelection(editor);
    mouseover(TinyDom.body(editor), 'td');
    dragDropBlocker(TinyDom.documentElement(editor), 'div[data-row="0"]', 0, 50);
    assertSizeChange(editor, [ 0, 0, 0, 0 ], { dh: 50, dw: 0 });
    assertNoDataStyle(editor, [ 0 ]);
  });

  it('TBA: resize table width by dragging right side', async () => {
    const editor = hook.editor();
    editor.setContent('<table style="border-collapse: collapse;border: 0;"><tbody><tr><td style="height:45px;">a</td></tr><tr><td style="height:45px;">a</td></tr></tbody></table>');
    setStateFrom(editor, [ 0, 0, 0, 0 ]);
    await pWaitForSelection(editor);
    mouseover(TinyDom.body(editor), 'td');
    dragDropBlocker(TinyDom.documentElement(editor), 'div[data-column="0"]', 50, 0);
    assertSizeChange(editor, [ 0, 0, 0, 0 ], { dh: 0, dw: 50 });
    assertNoDataStyle(editor, [ 0 ]);
  });

  it('TBA: Resize table bigger with handle, then resize row height bigger by dragging middle border', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    setStateFrom(editor, [ 0 ]);
    await pWaitForSelection(editor);
    dragDrop(TinyDom.body(editor), '#mceResizeHandlese', 50, 50);
    mouseover(TinyDom.body(editor), 'td');
    dragDropBlocker(TinyDom.documentElement(editor), 'div[data-row="0"]', 0, 50);
    assertSizeChange(editor, [ 0 ], { dh: 100, dw: 50 });
    assertNoDataStyle(editor, [ 0 ]);
  });

  it('TBA: Resize table bigger with handle, then resize row height smaller by dragging middle border', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    setStateFrom(editor, [ 0 ]);
    await pWaitForSelection(editor);
    dragDrop(TinyDom.body(editor), '#mceResizeHandlese', 50, 50);
    mouseover(TinyDom.body(editor), 'td');
    dragDropBlocker(TinyDom.documentElement(editor), 'div[data-row="0"]', 0, -30);
    assertSizeChange(editor, [ 0 ], { dh: 20, dw: 50 });
    assertNoDataStyle(editor, [ 0 ]);
  });

  it('TBA: Resize table bigger with handle, then resize column width bigger by dragging middle border', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    setStateFrom(editor, [ 0 ]);
    await pWaitForSelection(editor);
    dragDrop(TinyDom.body(editor), '#mceResizeHandlese', 50, 50);
    mouseover(TinyDom.body(editor), 'td');
    dragDropBlocker(TinyDom.documentElement(editor), 'div[data-column="0"]', 50, 0);
    assertSizeChange(editor, [ 0 ], { dh: 50, dw: 50 });
    assertNoDataStyle(editor, [ 0 ]);
  });

  it('TBA: Resize table bigger with handle, then resize column width smaller by dragging middle border', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    setStateFrom(editor, [ 0 ]);
    await pWaitForSelection(editor);
    dragDrop(TinyDom.body(editor), '#mceResizeHandlese', 50, 50);
    mouseover(TinyDom.body(editor), 'td');
    dragDropBlocker(TinyDom.documentElement(editor), 'div[data-column="0"]', -30, 0);
    assertSizeChange(editor, [ 0 ], { dh: 50, dw: 50 });
    assertNoDataStyle(editor, [ 0 ]);
  });

  it('TBA: Resize table smaller with handle, then resize row height bigger by dragging middle border', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    setStateFrom(editor, [ 0 ]);
    await pWaitForSelection(editor);
    dragDrop(TinyDom.body(editor), '#mceResizeHandlese', -10, -10);
    mouseover(TinyDom.body(editor), 'td');
    dragDropBlocker(TinyDom.documentElement(editor), 'div[data-row="0"]', 0, 50);
    assertSizeChange(editor, [ 0 ], { dh: 40, dw: -10 });
    assertNoDataStyle(editor, [ 0 ]);
  });

  it('TBA: Resize table smaller with handle, then resize row height smaller by dragging middle border', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    setStateFrom(editor, [ 0 ]);
    await pWaitForSelection(editor);
    dragDrop(TinyDom.body(editor), '#mceResizeHandlese', -10, -10);
    mouseover(TinyDom.body(editor), 'td');
    dragDropBlocker(TinyDom.documentElement(editor), 'div[data-row="0"]', 0, -20);
    assertSizeChange(editor, [ 0 ], { dh: -30, dw: -10 });
    assertNoDataStyle(editor, [ 0 ]);
  });

  it('TBA: Resize table smaller with handle, then resize column width bigger by dragging middle border', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    setStateFrom(editor, [ 0 ]);
    await pWaitForSelection(editor);
    dragDrop(TinyDom.body(editor), '#mceResizeHandlese', -10, -10);
    mouseover(TinyDom.body(editor), 'td');
    dragDropBlocker(TinyDom.documentElement(editor), 'div[data-column="0"]', 50, 0);
    assertSizeChange(editor, [ 0 ], { dh: -10, dw: -10 });
    assertNoDataStyle(editor, [ 0 ]);
  });

  it('TBA: Resize table smaller with handle, then resize column width smaller by dragging middle border', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    setStateFrom(editor, [ 0 ]);
    await pWaitForSelection(editor);
    dragDrop(TinyDom.body(editor), '#mceResizeHandlese', -10, -10);
    mouseover(TinyDom.body(editor), 'td');
    dragDropBlocker(TinyDom.documentElement(editor), 'div[data-column="0"]', -20, 0);
    assertSizeChange(editor, [ 0 ], { dh: -10, dw: -10 });
    assertNoDataStyle(editor, [ 0 ]);
  });

  it('TINY-6600: Resize normal table and column with resize prevented on td', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    setStateFrom(editor, [ 0 ]);
    setResizeFalse(editor, 'td');
    await pWaitForSelection(editor);
    mouseover(TinyDom.body(editor), 'td');
    await Waiter.pTryUntil(
      'wait for bar to be removed',
      () => UiFinder.notExists(TinyDom.documentElement(editor), 'div[data-column="0"]')
    );
    // Verify resize handle can be used and the other column without data-mce-resize="false" can be resized
    dragDrop(TinyDom.body(editor), '#mceResizeHandlese', 50, 50);
    mouseover(TinyDom.body(editor), 'td');
    dragDropBlocker(TinyDom.documentElement(editor), 'div[data-column="1"]', 50, 0);
    assertSizeChange(editor, [ 0 ], { dh: 50, dw: 100 });
    assertNoDataStyle(editor, [ 0 ]);
  });

  it('TINY-6600: Resize colgroup table and column with resize prevented on td', async () => {
    const editor = hook.editor();
    editor.setContent(colGroupTableHtml);
    setStateFrom(editor, [ 0 ]);
    setResizeFalse(editor, 'td');
    // Set selection in first cell
    TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 0);
    await Waiter.pTryUntil(
      'wait for resize handles',
      () => UiFinder.exists(TinyDom.body(editor), '#mceResizeHandlese')
    );
    mouseover(TinyDom.body(editor), 'td');
    await Waiter.pTryUntil(
      'wait for bar to be removed',
      () => UiFinder.notExists(TinyDom.documentElement(editor), 'div[data-column="0"]')
    );
    // Verify resize handle can be used and the other column without data-mce-resize="false" can be resized
    dragDrop(TinyDom.body(editor), '#mceResizeHandlese', 50, 50);
    mouseover(TinyDom.body(editor), 'td');
    dragDropBlocker(TinyDom.documentElement(editor), 'div[data-column="1"]', 50, 0);
    assertSizeChange(editor, [ 0 ], { dh: 50, dw: 100 });
    assertNoDataStyle(editor, [ 0 ]);
  });

  it('TINY-6600: Resize colgroup table and column with resize prevented on col', async () => {
    const editor = hook.editor();
    editor.setContent(colGroupTableHtml);
    setStateFrom(editor, [ 0 ]);
    setResizeFalse(editor, 'col');
    // Set selection in first cell
    TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 0);
    await Waiter.pTryUntil(
      'wait for resize handles',
      () => UiFinder.exists(TinyDom.body(editor), '#mceResizeHandlese')
    );
    mouseover(TinyDom.body(editor), 'td');
    await Waiter.pTryUntil(
      'wait for bar to be removed',
      () => UiFinder.notExists(TinyDom.documentElement(editor), 'div[data-column="0"]')
    );
    // Verify resize handle can be used and the other column without data-mce-resize="false" can be resized
    dragDrop(TinyDom.body(editor), '#mceResizeHandlese', 50, 50);
    mouseover(TinyDom.body(editor), 'td');
    dragDropBlocker(TinyDom.documentElement(editor), 'div[data-column="1"]', 50, 0);
    assertSizeChange(editor, [ 0 ], { dh: 50, dw: 100 });
    assertNoDataStyle(editor, [ 0 ]);
  });

  it('TINY-6600: Resize normal table and row with resize prevented on tr', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    setStateFrom(editor, [ 0 ]);
    setResizeFalse(editor, 'tr');
    await pWaitForSelection(editor);
    mouseover(TinyDom.body(editor), 'td');
    await Waiter.pTryUntil(
      'wait for bar to be removed',
      () => UiFinder.notExists(TinyDom.documentElement(editor), 'div[data-row="0"]')
    );
    // Verify resize handle can be used and the other row without data-mce-resize="false" can be resized
    dragDrop(TinyDom.body(editor), '#mceResizeHandlese', 50, 50);
    mouseover(TinyDom.body(editor), 'td');
    dragDropBlocker(TinyDom.documentElement(editor), 'div[data-row="1"]', 0, 50);
    assertSizeChange(editor, [ 0 ], { dh: 100, dw: 50 });
    assertNoDataStyle(editor, [ 0 ]);
  });

  it('TINY-6600: Resize normal table with resize prevented on table', async () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    setStateFrom(editor, [ 0 ]);
    setResizeFalse(editor, 'table');
    // Set selection in first cell
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    mouseover(TinyDom.body(editor), 'td');
    await Waiter.pTryUntil(
      'resize handle should not exist',
      () => UiFinder.notExists(TinyDom.documentElement(editor), '#mceResizeHandlese')
    );
    await Waiter.pTryUntil(
      'resize bars should not exist',
      () => UiFinder.notExists(TinyDom.documentElement(editor), 'div[data-row],div[data-column]')
    );
  });
});
