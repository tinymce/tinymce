/**
 * SplitCols.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Contains logic for handling splitting of merged rows.
 *
 * @class tinymce.table.model.SplitCols
 * @private
 */
define(
  'tinymce.plugins.tablenew.actions.TableActions',
  [
    'ephox.katamari.api.Fun',
    'ephox.snooker.api.TableDirection',
    'ephox.snooker.api.TableFill',
    'ephox.snooker.api.TableOperations',
    'ephox.sugar.api.node.Element',
    'tinymce.plugins.tablenew.queries.Direction'
  ],
  function (Fun, TableDirection, TableFill, TableOperations, Element, Direction) {
    return function (editor, lazyWire) {
      var fireNewRow = function (node) {
        editor.fire('newrow', {
          node: node.dom()
        });
        console.log('newrow', node.dom());
        return node.dom();
      };

      var fireNewCell = function (node) {
        editor.fire('newcell', {
          node: node.dom()
        });
        console.log('new cell', node.dom());
        return node.dom();
      };

      var execute = function (operation, mutate, lazyWire) {
        return function (table, target) {
          var wire = lazyWire();
          var doc = Element.fromDom(editor.getDoc());
          var direction = TableDirection(Direction.directionAt);
          var generators = TableFill.cellOperations(mutate, doc);
          return operation(wire, table, target, generators, direction, fireNewRow, fireNewCell).map(function (cell) {
            var rng = editor.dom.createRng();
            rng.setStart(cell.dom(), 0);
            rng.setEnd(cell.dom(), 0);
            return rng;
          });
        };
      };

      var deleteRow = execute(TableOperations.eraseRows, Fun.noop, lazyWire);

      var deleteColumn = execute(TableOperations.eraseColumns, Fun.noop, lazyWire);

      var insertRowsBefore = execute(TableOperations.insertRowsBefore, Fun.noop, lazyWire);

      var insertRowsAfter = execute(TableOperations.insertRowsAfter, Fun.noop, lazyWire);

      var insertColumnsBefore = execute(TableOperations.insertColumnsBefore, Fun.noop, lazyWire);

      var insertColumnsAfter = execute(TableOperations.insertColumnsAfter, Fun.noop, lazyWire);

      var mergeCells = execute(TableOperations.mergeCells, Fun.noop, lazyWire);

      var unmergeCells = execute(TableOperations.unmergeCells, Fun.noop, lazyWire);

      var pasteRowsBefore = execute(TableOperations.pasteRowsBefore, Fun.noop, lazyWire);

      var pasteRowsAfter = execute(TableOperations.pasteRowsAfter, Fun.noop, lazyWire);

      return {
        deleteRow: deleteRow,
        deleteColumn: deleteColumn,
        insertRowsBefore: insertRowsBefore,
        insertRowsAfter: insertRowsAfter,
        insertColumnsBefore: insertColumnsBefore,
        insertColumnsAfter: insertColumnsAfter,
        mergeCells: mergeCells,
        unmergeCells: unmergeCells,
        pasteRowsBefore: pasteRowsBefore,
        pasteRowsAfter: pasteRowsAfter
      };
    };
  }
);
