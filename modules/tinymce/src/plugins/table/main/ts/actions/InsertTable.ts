/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Type } from '@ephox/katamari';
import { TableRender } from '@ephox/snooker';
import { Attribute, Html, SelectorFilter, SelectorFind, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import { fireNewCell, fireNewRow } from '../api/Events';
import { getDefaultAttributes, getDefaultStyles, getTableHeaderType, isPercentagesForced, isPixelsForced, isResponsiveForced, useColumnGroup } from '../api/Settings';
import * as Util from '../core/Util';
import { enforceNone, enforcePercentage, enforcePixels } from './EnforceUnit';

const placeCaretInCell = (editor: Editor, cell: SugarElement<HTMLTableCellElement>): void => {
  editor.selection.select(cell.dom, true);
  editor.selection.collapse(true);
};

const selectFirstCellInTable = (editor: Editor, tableElm: SugarElement<HTMLTableElement>): void => {
  SelectorFind.descendant<HTMLTableCellElement>(tableElm, 'td,th').each(Fun.curry(placeCaretInCell, editor));
};

const fireEvents = (editor: Editor, table: SugarElement<HTMLTableElement>): void => {
  Arr.each(SelectorFilter.descendants<HTMLTableRowElement>(table, 'tr'), (row) => {
    fireNewRow(editor, row.dom);

    Arr.each(SelectorFilter.descendants<HTMLTableCellElement>(row, 'th,td'), (cell) => {
      fireNewCell(editor, cell.dom);
    });
  });
};

const isPercentage = (width: string): boolean =>
  Type.isString(width) && width.indexOf('%') !== -1;

const insert = (editor: Editor, columns: number, rows: number, colHeaders: number, rowHeaders: number): HTMLTableElement => {
  const defaultStyles = getDefaultStyles(editor);
  const options: TableRender.RenderOptions = {
    styles: defaultStyles,
    attributes: getDefaultAttributes(editor),
    colGroups: useColumnGroup(editor)
  };

  // Don't create an undo level when inserting the base table HTML otherwise we can end up with 2 undo levels
  editor.undoManager.ignore(() => {
    const table = TableRender.render(rows, columns, rowHeaders, colHeaders, getTableHeaderType(editor), options);
    Attribute.set(table, 'data-mce-id', '__mce');

    const html = Html.getOuter(table);
    editor.insertContent(html);
    editor.addVisual();
  });

  // Enforce the sizing mode of the table
  return SelectorFind.descendant<HTMLTableElement>(Util.getBody(editor), 'table[data-mce-id="__mce"]').map((table) => {
    if (isPixelsForced(editor)) {
      enforcePixels(table);
    } else if (isResponsiveForced(editor)) {
      enforceNone(table);
    } else if (isPercentagesForced(editor) || isPercentage(defaultStyles.width)) {
      enforcePercentage(table);
    }
    Util.removeDataStyle(table);
    Attribute.remove(table, 'data-mce-id');
    fireEvents(editor, table);
    selectFirstCellInTable(editor, table);
    return table.dom;
  }).getOr(null);
};

const insertTableWithDataValidation = (editor: Editor, rows: number, columns: number, options: Record<string, number> = {}, errorMsg: string): HTMLTableElement | null => {
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
