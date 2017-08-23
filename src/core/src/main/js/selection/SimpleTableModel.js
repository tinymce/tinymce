/**
 * SimpleTableModel.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.selection.SimpleTableModel',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Struct',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.dom.Replication',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.SelectorFilter'
  ],
  function (Arr, Option, Struct, Compare, Insert, InsertAll, Replication, Element, Attr, SelectorFilter) {
    var tableModel = Struct.immutable('element', 'width', 'rows');
    var tableRow = Struct.immutable('element', 'cells');
    var cellPosition = Struct.immutable('x', 'y');

    var getSpan = function (td, key) {
      var value = parseInt(Attr.get(td, key), 10);
      return isNaN(value) ? 1 : value;
    };

    var fillout = function (table, x, y, tr, td) {
      var rowspan = getSpan(td, 'rowspan');
      var colspan = getSpan(td, 'colspan');
      var rows = table.rows();

      for (var y2 = y; y2 < y + rowspan; y2++) {
        if (!rows[y2]) {
          rows[y2] = tableRow(Replication.deep(tr), []);
        }

        for (var x2 = x; x2 < x + colspan; x2++) {
          var cells = rows[y2].cells();

          // not filler td:s are purposely not cloned so that we can
          // find cells in the model by element object references
          cells[x2] = y2 == y && x2 == x ? td : Replication.shallow(td);
        }
      }
    };

    var cellExists = function (table, x, y) {
      var rows = table.rows();
      var cells = rows[y] ? rows[y].cells() : [];
      return !!cells[x];
    };

    var skipCellsX = function (table, x, y) {
      while (cellExists(table, x, y)) {
        x++;
      }

      return x;
    };

    var getWidth = function (rows) {
      return Arr.foldl(rows, function (acc, row) {
        return row.cells().length > acc ? row.cells().length : acc;
      }, 0);
    };

    var findElementPos = function (table, element) {
      var rows = table.rows();
      for (var y = 0; y < rows.length; y++) {
        var cells = rows[y].cells();
        for (var x = 0; x < cells.length; x++) {
          if (Compare.eq(cells[x], element)) {
            return Option.some(cellPosition(x, y));
          }
        }
      }

      return Option.none();
    };

    var extractRows = function (table, sx, sy, ex, ey) {
      var newRows = [];
      var rows = table.rows();

      for (var y = sy; y <= ey; y++) {
        var cells = rows[y].cells();
        var slice = sx < ex ? cells.slice(sx, ex + 1) : cells.slice(ex, sx + 1);
        newRows.push(tableRow(rows[y].element(), slice));
      }

      return newRows;
    };

    var subTable = function (table, startPos, endPos) {
      var sx = startPos.x(), sy = startPos.y();
      var ex = endPos.x(), ey = endPos.y();
      var newRows = sy < ey ? extractRows(table, sx, sy, ex, ey) : extractRows(table, sx, ey, ex, sy);

      return tableModel(table.element(), getWidth(newRows), newRows);
    };

    var createDomTable = function (table, rows) {
      var tableElement = Replication.shallow(table.element());
      var tableBody = Element.fromTag('tbody');

      InsertAll.append(tableBody, rows);
      Insert.append(tableElement, tableBody);

      return tableElement;
    };

    var modelRowsToDomRows = function (table) {
      return Arr.map(table.rows(), function (row) {
        var cells = Arr.map(row.cells(), function (cell) {
          var td = Replication.deep(cell);
          Attr.remove(td, 'colspan');
          Attr.remove(td, 'rowspan');
          return td;
        });

        var tr = Replication.shallow(row.element());
        InsertAll.append(tr, cells);
        return tr;
      });
    };

    var fromDom = function (tableElm) {
      var table = tableModel(Replication.shallow(tableElm), 0, []);

      Arr.each(SelectorFilter.descendants(tableElm, 'tr'), function (tr, y) {
        Arr.each(SelectorFilter.descendants(tr, 'td,th'), function (td, x) {
          fillout(table, skipCellsX(table, x, y), y, tr, td);
        });
      });

      return tableModel(table.element(), getWidth(table.rows()), table.rows());
    };

    var toDom = function (table) {
      return createDomTable(table, modelRowsToDomRows(table));
    };

    var subsection = function (table, startElement, endElement) {
      return findElementPos(table, startElement).bind(function (startPos) {
        return findElementPos(table, endElement).map(function (endPos) {
          return subTable(table, startPos, endPos);
        });
      });
    };

    return {
      fromDom: fromDom,
      toDom: toDom,
      subsection: subsection
    };
  }
);
