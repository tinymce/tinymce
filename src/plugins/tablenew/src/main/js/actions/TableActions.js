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
    'ephox.katamari.api.Option',
    'ephox.snooker.api.ResizeWire',
    'ephox.snooker.api.TableDirection',
    'ephox.snooker.api.TableFill',
    'ephox.snooker.api.TableOperations',
    'ephox.sugar.api.node.Element',
    'tinymce.plugins.tablenew.actions.TableWire',
    'tinymce.plugins.tablenew.queries.Direction'
  ],
  function (Fun, Option, ResizeWire, TableDirection, TableFill, TableOperations, Element, TableWire, Direction) {
    return function (editor) {

      var wire = Option.none();

      editor.on('init', function (e) {
        var rawWire = TableWire.get(editor);
        wire = Option.some(rawWire);
      });

      var lazyWire = function () {
        return wire.getOr(ResizeWire.only(Element.fromDom(editor.getBody())));
      };

      var execute = function (operation, mutate, lazyWire) {
        return function (table, target) {
          var wire = lazyWire();
          var doc = Element.fromDom(editor.getDoc());
          var direction = TableDirection(Direction.directionAt);
          var generators = TableFill.cellOperations(mutate, doc);
          return operation(wire, table, target, generators, direction).map(function (cell) {
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

      return {
        deleteRow: deleteRow,
        deleteColumn: deleteColumn,
        insertRowsBefore: insertRowsBefore,
        insertRowsAfter: insertRowsAfter,
        insertColumnsBefore: insertColumnsBefore,
        insertColumnsAfter: insertColumnsAfter,
        mergeCells: mergeCells,
        unmergeCells: unmergeCells
      };
    };
  }
);
