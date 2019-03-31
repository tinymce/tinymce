/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Arr, Type } from '@ephox/katamari';
import { TableRender } from '@ephox/snooker';
import { Attr, Html, SelectorFind, SelectorFilter, Css } from '@ephox/sugar';
import { getDefaultAttributes, getDefaultStyles, isPixelsForced } from '../api/Settings';
import { fireNewRow, fireNewCell } from '../api/Events';
import * as Util from '../alien/Util';
import Editor from 'tinymce/core/api/Editor';
import { HTMLElement } from '@ephox/dom-globals';

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

const isPercentage = (width: string) => Type.isString(width) && width.indexOf('%') !== -1;

const insert = (editor: Editor, columns: number, rows: number): HTMLElement => {
  const defaultStyles = getDefaultStyles(editor);
  const options: TableRender.RenderOptions = {
    styles: defaultStyles,
    attributes: getDefaultAttributes(editor),
    percentages: isPercentage(defaultStyles.width) && !isPixelsForced(editor)
  };

  const table = TableRender.render(rows, columns, 0, 0, options);
  Attr.set(table, 'data-mce-id', '__mce');

  const html = Html.getOuter(table);
  editor.insertContent(html);

  return SelectorFind.descendant(Util.getBody(editor), 'table[data-mce-id="__mce"]').map((table) => {
    if (isPixelsForced(editor)) {
      Css.set(table, 'width', Css.get(table, 'width'));
    }
    Attr.remove(table, 'data-mce-id');
    fireEvents(editor, table);
    selectFirstCellInTable(editor, table);
    return table.dom();
  }).getOr(null);
};

export default {
  insert
};