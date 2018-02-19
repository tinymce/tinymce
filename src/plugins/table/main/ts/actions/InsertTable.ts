/**
 * InsertTable.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun, Arr, Type } from '@ephox/katamari';
import { TableRender } from '@ephox/snooker';
import { Attr, Html, SelectorFind, SelectorFilter } from '@ephox/sugar';
import { getDefaultAttributes, getDefaultStyles } from 'tinymce/plugins/table/api/Settings';
import { fireNewRow, fireNewCell } from 'tinymce/plugins/table/api/Events';
import Util from 'tinymce/plugins/table/alien/Util';
import { Editor } from 'tinymce/core/api/Editor';

const placeCaretInCell = (editor: Editor, cell) => {
  editor.selection.select(cell.dom(), true);
  editor.selection.collapse(true);
};

const selectFirstCellInTable = (editor: Editor, tableElm) => {
  SelectorFind.descendant(tableElm, 'td,th').each(Fun.curry(placeCaretInCell, editor));
};

const fireEvents = (editor: Editor, table) => {
  Arr.each(SelectorFilter.descendants(table, 'tr'), (row) => {
    fireNewRow(editor, row.dom());

    Arr.each(SelectorFilter.descendants(row, 'th,td'), (cell) => {
      fireNewCell(editor, cell.dom());
    });
  });
};

const isPercentage = (width) => Type.isString(width) && width.indexOf('%') !== -1;

const insert = (editor: Editor, columns: number, rows: number): HTMLElement => {
  const defaultStyles = getDefaultStyles(editor);
  const options: TableRender.RenderOptions = {
    styles: defaultStyles,
    attributes: getDefaultAttributes(editor),
    percentages: isPercentage(defaultStyles.width)
  };

  const table = TableRender.render(rows, columns, 0, 0, options);
  Attr.set(table, 'data-mce-id', '__mce');

  const html = Html.getOuter(table);
  editor.insertContent(html);

  return SelectorFind.descendant(Util.getBody(editor), 'table[data-mce-id="__mce"]').map((table) => {
    Attr.remove(table, 'data-mce-id');
    fireEvents(editor, table);
    selectFirstCellInTable(editor, table);
    return table.dom();
  }).getOr(null);
};

export default {
  insert
};