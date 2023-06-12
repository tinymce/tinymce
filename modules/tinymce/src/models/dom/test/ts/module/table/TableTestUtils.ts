/*
 NOTE: This file is partially duplicated in the following locations:
  - models/dom/test/module/table/TableTestUtils.ts
  - plugins/table/test/module/TableTestUtils.ts
 Make sure that if making changes to this file, the other files are updated as well
 */

import { ApproxStructure, Assertions, Cursors, Mouse, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { Attribute, Html, SelectorFilter, SelectorFind, SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyDom, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

interface Options {
  readonly headerRows: number;
  readonly headerCols: number;
}

export interface WidthData {
  readonly raw: number | null;
  readonly px: number;
  readonly unit: string | null;
  readonly isPercent: boolean;
}

const getRawWidth = (editor: Editor, elm: HTMLElement): string => {
  const style = editor.dom.getStyle(elm, 'width');
  if (style) {
    return style;
  } else {
    const attr = editor.dom.getAttrib(elm, 'width');
    return attr ? attr + 'px' : attr;
  }
};

const getWidths = (editor: Editor, elm: HTMLElement): WidthData => {
  const rawWidth = getRawWidth(editor, elm);
  const pxWidth = editor.dom.getStyle(elm, 'width', true);
  const unit = /\d+(\.\d+)?(%|px)/.exec(rawWidth)?.[2] ?? null;
  return {
    raw: rawWidth === '' ? null : parseFloat(rawWidth),
    px: parseInt(pxWidth, 10),
    unit,
    isPercent: unit === '%'
  };
};

const assertWidth = (editor: Editor, elm: HTMLElement, expectedWidth: number | null, expectedUnit: string | null): void => {
  const widthData = getWidths(editor, elm);
  const nodeName = elm.nodeName.toLowerCase();
  if (expectedWidth === null) {
    assert.isNull(widthData.raw, `${nodeName} width should not be set`);
  } else {
    // This does a approximately check with a delta of 4 to compensate for Firefox sometimes being off by 4 pixels depending on version and platform see TINY-9200 for details
    assert.approximately(widthData.raw ?? -1, expectedWidth, 4, `${nodeName} width is ${expectedWidth} ~= ${widthData.raw}`);
  }
  assert.equal(widthData.unit, expectedUnit, `${nodeName} unit is ${expectedUnit}`);
};

const assertTableStructure = (editor: Editor, structure: StructAssert): void => {
  const table = SelectorFind.descendant(TinyDom.body(editor), 'table').getOrDie('A table should exist');
  Assertions.assertStructure('Should be a table the expected structure', structure, table);
};

const insertRaw = (editor: Editor, html: string): SugarElement<HTMLTableElement> => {
  const element = SugarElement.fromHtml<HTMLTableElement>(html);
  Attribute.set(element, 'data-mce-id', '__mce');
  editor.insertContent(Html.getOuter(element));

  return SelectorFind.descendant<HTMLTableElement>(TinyDom.body(editor), '[data-mce-id="__mce"]').map((el) => {
    Attribute.remove(el, 'data-mce-id');
    return el;
  }).getOrDie();
};

const mergeCells = (editor: Editor, keys: (editor: Editor) => void): boolean => {
  keys(editor);
  return editor.execCommand('mceTableMergeCells');
};

const splitCells = (editor: Editor): boolean =>
  editor.execCommand('mceTableSplitCells');

const insertColumnBefore = (editor: Editor): boolean =>
  editor.execCommand('mceTableInsertColBefore');

const insertColumnAfter = (editor: Editor): boolean =>
  editor.execCommand('mceTableInsertColAfter');

const deleteColumn = (editor: Editor): boolean =>
  editor.execCommand('mceTableDeleteCol');

const insertRowBefore = (editor: Editor): boolean =>
  editor.execCommand('mceTableInsertRowBefore');

const insertRowAfter = (editor: Editor): boolean =>
  editor.execCommand('mceTableInsertRowAfter');

const deleteRow = (editor: Editor): boolean =>
  editor.execCommand('mceTableDeleteRow');

const pDragHandle = async (editor: Editor, id: string, dx: number, dy: number): Promise<void> => {
  const body = TinyDom.body(editor);
  const resizeHandle = await Waiter.pTryUntil('wait for resize handlers',
    () => UiFinder.findIn(body, '#mceResizeHandle' + id).getOrDie()
  );
  Mouse.mouseDown(resizeHandle);
  Mouse.mouseMoveTo(resizeHandle, dx, dy);
  Mouse.mouseUp(resizeHandle);
};

const pDragResizeBar = async (editor: Editor, rowOrCol: 'row' | 'column', index: number, dx: number, dy: number): Promise<void> => {
  const body = TinyDom.body(editor);
  const docElem = TinyDom.documentElement(editor);
  // Need to mouse over the table to trigger the 'resizebar' divs to appear in the dom
  const td = UiFinder.findIn(body, 'td').getOrDie();
  Mouse.mouseOver(td);

  // Wait for the resize bar to show
  const resizeBar = await Waiter.pTryUntil('wait for resize bars',
    () => UiFinder.findIn(docElem, `div[data-${rowOrCol}='${index}']`).getOrDie()
  );
  Mouse.mouseDown(resizeBar);

  const blocker = UiFinder.findIn(docElem, 'div.ephox-dragster-blocker').getOrDie();
  Mouse.mouseMove(blocker);
  Mouse.mouseMoveTo(blocker, dx, dy);
  Mouse.mouseUp(blocker);
};

// The critical part is the target element as this is what Darwin (MouseSelection.ts) uses to determine the fake selection
const selectWithMouse = (start: SugarElement<Node>, end: SugarElement<Node>): void => {
  Mouse.mouseDown(start, { button: 0 });
  Mouse.mouseOver(end, { button: 0 });
  Mouse.mouseUp(end, { button: 0 });
};

// Set up to mock what the listeners are looking for in InputHandlers.ts - keyup()
const selectWithKeyboard = (editor: Editor, cursorRange: Cursors.CursorPath, keyDirection: number): void => {
  const { startPath, soffset, finishPath, foffset } = cursorRange;
  TinySelections.setSelection(editor, startPath, soffset, finishPath, foffset);
  TinyContentActions.keystroke(editor, keyDirection, { shiftKey: true });
};

const getSelectedCells = (editor: Editor): SugarElement<HTMLTableCellElement>[] =>
  SelectorFilter.descendants(TinyDom.body(editor), 'td[data-mce-selected],th[data-mce-selected]');

const assertSelectedCells = (editor: Editor, expectedSelectedCells: string[], mapper: (cell: SugarElement<HTMLTableCellElement>) => string | undefined): void => {
  const selectedCells = Arr.map(getSelectedCells(editor), mapper);
  assert.deepEqual(selectedCells, expectedSelectedCells);
};

const getCellWidth = (editor: Editor, table: SugarElement<HTMLTableElement>, rowNumber: number, columnNumber: number): WidthData => {
  const row = SelectorFilter.descendants<HTMLTableRowElement>(table, 'tr')[rowNumber];
  const cell = SelectorFilter.descendants<HTMLTableCellElement>(row, 'th,td')[columnNumber];
  return getWidths(editor, cell.dom);
};

const assertTableStructureWithSizes = (
  editor: Editor,
  cols: number,
  rows: number,
  unit: string | null,
  tableWidth: number | null,
  widths: Array<number | null>[],
  useColGroups: boolean,
  options: Options = { headerRows: 0, headerCols: 0 }
): void => {
  const tableWithColGroup = () => {
    const table = editor.dom.select('table')[0];
    assertWidth(editor, table, tableWidth, unit);
    const row = editor.dom.select('colgroup', table)[0];
    Arr.each(widths[0], (columnWidth, columnIndex) => {
      const column = editor.dom.select('col', row)[columnIndex];
      assertWidth(editor, column, columnWidth, unit);
    });
  };

  const tableWithoutColGroup = () => {
    const table = editor.dom.select('table')[0];
    assertWidth(editor, table, tableWidth, unit);
    Arr.each(widths, (rowWidths, rowIndex) => {
      const row = editor.dom.select('tr', table)[rowIndex];
      Arr.each(rowWidths, (cellWidth, cellIndex) => {
        const cell = editor.dom.select('td,th', row)[cellIndex];
        assertWidth(editor, cell, cellWidth, unit);
      });
    });
  };

  const structure = () => assertTableStructure(editor, ApproxStructure.build((s, str) => {
    const tbody = s.element('tbody', {
      children: Arr.range(rows, (rowIndex) =>
        s.element('tr', {
          children: Arr.range(cols, (colIndex) =>
            s.element(colIndex < options.headerCols || rowIndex < options.headerRows ? 'th' : 'td', {
              children: [
                s.either([
                  s.element('br', { }),
                  s.text(str.contains('Cell'))
                ])
              ]
            })
          )
        })
      )
    });

    const colGroup = s.element('colgroup', {
      children: Arr.range(cols, () =>
        s.element('col', {})
      )
    });

    return s.element('table', {
      attrs: { border: str.is('1') },
      styles: { 'border-collapse': str.is('collapse') },
      children: useColGroups ? [ colGroup, tbody ] : [ tbody ]
    });
  }));

  if (useColGroups) {
    structure();
    tableWithColGroup();
  } else {
    structure();
    tableWithoutColGroup();
  }
};

const insertTable = (editor: Editor, args: Record<string, any>): boolean =>
  editor.execCommand('mceInsertTable', false, args);

const makeInsertTable = (editor: Editor, columns: number, rows: number, args: Record<string, any> = {}): SugarElement<HTMLTableElement> => {
  insertTable(editor, { rows, columns, ...args });
  return SugarElement.fromDom(editor.dom.getParent(editor.selection.getStart(), 'table') as HTMLTableElement);
};

const insertTableTest = (editor: Editor, tableColumns: number, tableRows: number, widths: number[][], withColGroups: boolean): void => {
  editor.setContent('');
  insertTable(editor, { rows: tableRows, columns: tableColumns });
  assertTableStructureWithSizes(editor, tableColumns, tableRows, '%', 100, widths, withColGroups);
  TinyAssertions.assertCursor(editor, [ 0, withColGroups ? 1 : 0, 0, 0 ], 0);
};

const assertWidths = (widths: { widthBefore: WidthData; widthAfter: WidthData }): void => {
  if (widths.widthBefore.isPercent) {
    // due to rounding errors we can be off by one pixel for percentage tables
    assert.approximately(
      widths.widthAfter.px,
      widths.widthBefore.px,
      1,
      `table width should be approx (within 1px): ${widths.widthBefore.raw}% (${widths.widthBefore.px}px) ~= ${widths.widthAfter.raw}% (${widths.widthAfter.px}px)`
    );
  } else {
    assert.equal(widths.widthAfter, widths.widthBefore, 'table width should not change');
  }
};

export {
  getCellWidth,
  assertTableStructure,
  assertTableStructureWithSizes,
  insertTableTest,
  insertRaw,
  mergeCells,
  splitCells,
  pDragHandle,
  pDragResizeBar,
  selectWithKeyboard,
  selectWithMouse,
  assertSelectedCells,
  getWidths,
  insertColumnBefore,
  insertColumnAfter,
  deleteColumn,
  insertRowBefore,
  insertRowAfter,
  deleteRow,
  insertTable,
  makeInsertTable,
  assertWidths
};
