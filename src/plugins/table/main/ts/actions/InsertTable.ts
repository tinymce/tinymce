/**
 * InsertTable.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { Fun } from '@ephox/katamari';
import { TableRender } from '@ephox/snooker';
import { Attr, Element, Html, SelectorFind } from '@ephox/sugar';
import { getDefaultAttributes, getDefaultStyles } from 'tinymce/plugins/table/api/Settings';

const placeCaretInCell = function (editor, cell) {
  editor.selection.select(cell.dom(), true);
  editor.selection.collapse(true);
};

const selectFirstCellInTable = function (editor, tableElm) {
  SelectorFind.descendant(tableElm, 'td,th').each(Fun.curry(placeCaretInCell, editor));
};

const insert = function (editor, columns, rows) {
  let tableElm;

  const renderedHtml = TableRender.render(rows, columns, 0, 0);

  Attr.set(renderedHtml, 'id', '__mce');

  const html = Html.getOuter(renderedHtml);

  editor.insertContent(html);

  tableElm = editor.dom.get('__mce');
  editor.dom.setAttrib(tableElm, 'id', null);

  editor.$('tr', tableElm).each(function (index, row) {
    editor.fire('newrow', {
      node: row
    });

    editor.$('th,td', row).each(function (index, cell) {
      editor.fire('newcell', {
        node: cell
      });
    });
  });

  editor.dom.setAttribs(tableElm, getDefaultAttributes(editor));
  editor.dom.setStyles(tableElm, getDefaultStyles(editor));

  selectFirstCellInTable(editor, Element.fromDom(tableElm));

  return tableElm;
};

export default {
  insert
};