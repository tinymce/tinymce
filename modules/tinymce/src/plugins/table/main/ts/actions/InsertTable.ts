/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement, HTMLTableDataCellElement, HTMLTableElement, HTMLTableHeaderCellElement, HTMLTableRowElement } from '@ephox/dom-globals';
import { Arr, Fun, Type } from '@ephox/katamari';
import { TableRender } from '@ephox/snooker';
import { Attr, Html, SelectorFilter, SelectorFind } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { fireNewCell, fireNewRow } from '../api/Events';
import { getDefaultAttributes, getDefaultStyles, isPercentagesForced, isPixelsForced, isResponsiveForced, getTableHeaderType } from '../api/Settings';
import * as Util from '../core/Util';
import { enforceNone, enforcePercentage, enforcePixels } from './EnforceUnit';

const placeCaretInCell = (editor: Editor, cell) => {
  editor.selection.select(cell.dom(), true);
  editor.selection.collapse(true);
};

const selectFirstCellInTable = (editor: Editor, tableElm) => {
  SelectorFind.descendant<HTMLTableDataCellElement | HTMLTableHeaderCellElement>(tableElm, 'td,th').each(Fun.curry(placeCaretInCell, editor));
};

const fireEvents = (editor: Editor, table) => {
  Arr.each(SelectorFilter.descendants<HTMLTableRowElement>(table, 'tr'), (row) => {
    fireNewRow(editor, row.dom());

    Arr.each(SelectorFilter.descendants<HTMLTableDataCellElement | HTMLTableHeaderCellElement>(row, 'th,td'), (cell) => {
      fireNewCell(editor, cell.dom());
    });
  });
};

const isPercentage = (width: string) => Type.isString(width) && width.indexOf('%') !== -1;

const insert = (editor: Editor, columns: number, rows: number, colHeaders: number, rowHeaders: number): HTMLElement => {
  const defaultStyles = getDefaultStyles(editor);
  const options: TableRender.RenderOptions = {
    styles: defaultStyles,
    attributes: getDefaultAttributes(editor)
  };

  const table = TableRender.render(rows, columns, rowHeaders, colHeaders, getTableHeaderType(editor), options);
  Attr.set(table, 'data-mce-id', '__mce');

  const html = Html.getOuter(table);
  editor.insertContent(html);

  return SelectorFind.descendant<HTMLTableElement>(Util.getBody(editor), 'table[data-mce-id="__mce"]').map((table) => {
    if (isPixelsForced(editor)) {
      enforcePixels(editor, table);
    } else if (isResponsiveForced(editor)) {
      enforceNone(table);
    } else if (isPercentagesForced(editor) || isPercentage(defaultStyles.width)) {
      enforcePercentage(editor, table);
    }
    Util.removeDataStyle(table);
    Attr.remove(table, 'data-mce-id');
    fireEvents(editor, table);
    selectFirstCellInTable(editor, table);
    return table.dom();
  }).getOr(null);
};

const insertTableWithDataValidation = (editor: Editor, rows: number, columns: number, options: Record<string, number> = {}, errorMsg: string) => {
  const checkInput = (val: any) => Type.isNumber(val) && val > 0;

  if (checkInput(rows) && checkInput(columns)) {
    const headerRows = options.headerRows || 0;
    const headerColumns = options.headerColumns || 0;
    return insert(editor, columns, rows, headerColumns, headerRows);
  } else {
    // eslint-disable-next-line no-console
    console.error(errorMsg);
    return null;
  }
};

export {
  insert,
  insertTableWithDataValidation
};
