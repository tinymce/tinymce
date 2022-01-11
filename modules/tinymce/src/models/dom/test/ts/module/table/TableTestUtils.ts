/*
 NOTE: This file is partially duplicated in the following locations:
  - core/test/module/TableUtils.ts
  - plugins/table/test/module/TableTestUtils.ts
 Make sure that if making changes to this file, the other files are updated as well
 */

import { ApproxStructure, Assertions, StructAssert } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';
import { TinyDom } from '@ephox/wrap-mcagar';
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
  const unit = rawWidth === '' ? null : /\d+(\.\d+)?(%|px)/.exec(rawWidth)[2];
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
    assert.approximately(widthData.raw, expectedWidth, 2, `${nodeName} width is ${expectedWidth} ~= ${widthData.raw}`);
  }
  assert.equal(widthData.unit, expectedUnit, `${nodeName} unit is ${expectedUnit}`);
};

const assertTableStructure = (editor: Editor, structure: StructAssert): void => {
  const table = SelectorFind.descendant(TinyDom.body(editor), 'table').getOrDie('A table should exist');
  Assertions.assertStructure('Should be a table the expected structure', structure, table);
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

export {
  assertTableStructure,
  assertTableStructureWithSizes,
  insertTable
};
