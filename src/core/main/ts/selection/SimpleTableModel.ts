/**
 * SimpleTableModel.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr, Option, Struct } from '@ephox/katamari';
import { Compare, Insert, InsertAll, Replication, Element, Attr, SelectorFilter } from '@ephox/sugar';

const tableModel = Struct.immutable('element', 'width', 'rows');
const tableRow = Struct.immutable('element', 'cells');
const cellPosition = Struct.immutable('x', 'y');

const getSpan = function (td, key) {
  const value = parseInt(Attr.get(td, key), 10);
  return isNaN(value) ? 1 : value;
};

const fillout = function (table, x, y, tr, td) {
  const rowspan = getSpan(td, 'rowspan');
  const colspan = getSpan(td, 'colspan');
  const rows = table.rows();

  for (let y2 = y; y2 < y + rowspan; y2++) {
    if (!rows[y2]) {
      rows[y2] = tableRow(Replication.deep(tr), []);
    }

    for (let x2 = x; x2 < x + colspan; x2++) {
      const cells = rows[y2].cells();

      // not filler td:s are purposely not cloned so that we can
      // find cells in the model by element object references
      cells[x2] = y2 === y && x2 === x ? td : Replication.shallow(td);
    }
  }
};

const cellExists = function (table, x, y) {
  const rows = table.rows();
  const cells = rows[y] ? rows[y].cells() : [];
  return !!cells[x];
};

const skipCellsX = function (table, x, y) {
  while (cellExists(table, x, y)) {
    x++;
  }

  return x;
};

const getWidth = function (rows) {
  return Arr.foldl(rows, function (acc, row) {
    return row.cells().length > acc ? row.cells().length : acc;
  }, 0);
};

const findElementPos = function (table, element) {
  const rows = table.rows();
  for (let y = 0; y < rows.length; y++) {
    const cells = rows[y].cells();
    for (let x = 0; x < cells.length; x++) {
      if (Compare.eq(cells[x], element)) {
        return Option.some(cellPosition(x, y));
      }
    }
  }

  return Option.none();
};

const extractRows = function (table, sx, sy, ex, ey) {
  const newRows = [];
  const rows = table.rows();

  for (let y = sy; y <= ey; y++) {
    const cells = rows[y].cells();
    const slice = sx < ex ? cells.slice(sx, ex + 1) : cells.slice(ex, sx + 1);
    newRows.push(tableRow(rows[y].element(), slice));
  }

  return newRows;
};

const subTable = function (table, startPos, endPos) {
  const sx = startPos.x(), sy = startPos.y();
  const ex = endPos.x(), ey = endPos.y();
  const newRows = sy < ey ? extractRows(table, sx, sy, ex, ey) : extractRows(table, sx, ey, ex, sy);

  return tableModel(table.element(), getWidth(newRows), newRows);
};

const createDomTable = function (table, rows) {
  const tableElement = Replication.shallow(table.element());
  const tableBody = Element.fromTag('tbody');

  InsertAll.append(tableBody, rows);
  Insert.append(tableElement, tableBody);

  return tableElement;
};

const modelRowsToDomRows = function (table) {
  return Arr.map(table.rows(), function (row) {
    const cells = Arr.map(row.cells(), function (cell) {
      const td = Replication.deep(cell);
      Attr.remove(td, 'colspan');
      Attr.remove(td, 'rowspan');
      return td;
    });

    const tr = Replication.shallow(row.element());
    InsertAll.append(tr, cells);
    return tr;
  });
};

const fromDom = function (tableElm) {
  const table = tableModel(Replication.shallow(tableElm), 0, []);

  Arr.each(SelectorFilter.descendants(tableElm, 'tr'), function (tr, y) {
    Arr.each(SelectorFilter.descendants(tr, 'td,th'), function (td, x) {
      fillout(table, skipCellsX(table, x, y), y, tr, td);
    });
  });

  return tableModel(table.element(), getWidth(table.rows()), table.rows());
};

const toDom = function (table) {
  return createDomTable(table, modelRowsToDomRows(table));
};

const subsection = function (table, startElement, endElement) {
  return findElementPos(table, startElement).bind(function (startPos) {
    return findElementPos(table, endElement).map(function (endPos) {
      return subTable(table, startPos, endPos);
    });
  });
};

export default {
  fromDom,
  toDom,
  subsection
};