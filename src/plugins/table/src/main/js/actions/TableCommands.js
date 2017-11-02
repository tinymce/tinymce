/**
 * TableCommands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.table.actions.TableCommands',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.snooker.api.CopyRows',
    'ephox.snooker.api.TableFill',
    'ephox.snooker.api.TableLookup',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.dom.Replication',
    'ephox.sugar.api.node.Element',
    'tinymce.core.util.Tools',
    'tinymce.plugins.table.alien.Util',
    'tinymce.plugins.table.queries.TableTargets',
    'tinymce.plugins.table.ui.TableDialog',
    'tinymce.plugins.table.ui.RowDialog',
    'tinymce.plugins.table.ui.CellDialog'
  ],

  function (Arr, Fun, Option, CopyRows, TableFill, TableLookup, Insert, Remove, Replication, Element, Tools, Util, TableTargets, TableDialog, RowDialog, CellDialog) {
    var each = Tools.each;

    var clipboardRows = Option.none();

    var getClipboardRows = function () {
      return clipboardRows.fold(function () {
        return;
      }, function (rows) {
        return Arr.map(rows, function (row) {
          return row.dom();
        });
      });
    };

    var setClipboardRows = function (rows) {
      var sugarRows = Arr.map(rows, Element.fromDom);
      clipboardRows = Option.from(sugarRows);
    };

    var registerCommands = function (editor, actions, cellSelection, selections) {
      var isRoot = Util.getIsRoot(editor);
      var eraseTable = function () {
        var cell = Element.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
        var table = TableLookup.table(cell, isRoot);
        table.filter(Fun.not(isRoot)).each(function (table) {
          var cursor = Element.fromText('');
          Insert.after(table, cursor);
          Remove.remove(table);
          var rng = editor.dom.createRng();
          rng.setStart(cursor.dom(), 0);
          rng.setEnd(cursor.dom(), 0);
          editor.selection.setRng(rng);
        });
      };

      var getSelectionStartCell = function () {
        return Element.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
      };

      var getTableFromCell = function (cell) {
        return TableLookup.table(cell, isRoot);
      };

      var actOnSelection = function (execute) {
        var cell = getSelectionStartCell();
        var table = getTableFromCell(cell);
        table.each(function (table) {
          var targets = TableTargets.forMenu(selections, table, cell);
          execute(table, targets).each(function (rng) {
            editor.selection.setRng(rng);
            editor.focus();
            cellSelection.clear(table);
          });
        });
      };

      var copyRowSelection = function (execute) {
        var cell = getSelectionStartCell();
        var table = getTableFromCell(cell);
        return table.bind(function (table) {
          var doc = Element.fromDom(editor.getDoc());
          var targets = TableTargets.forMenu(selections, table, cell);
          var generators = TableFill.cellOperations(Fun.noop, doc, Option.none());
          return CopyRows.copyRows(table, targets, generators);
        });
      };

      var pasteOnSelection = function (execute) {
        // If we have clipboard rows to paste
        clipboardRows.each(function (rows) {
          var clonedRows = Arr.map(rows, function (row) {
            return Replication.deep(row);
          });
          var cell = getSelectionStartCell();
          var table = getTableFromCell(cell);
          table.bind(function (table) {
            var doc = Element.fromDom(editor.getDoc());
            var generators = TableFill.paste(doc);
            var targets = TableTargets.pasteRows(selections, table, cell, clonedRows, generators);
            execute(table, targets).each(function (rng) {
              editor.selection.setRng(rng);
              editor.focus();
              cellSelection.clear(table);
            });
          });
        });
      };

      // Register action commands
      each({
        mceTableSplitCells: function () {
          actOnSelection(actions.unmergeCells);
        },

        mceTableMergeCells: function () {
          actOnSelection(actions.mergeCells);
        },

        mceTableInsertRowBefore: function () {
          actOnSelection(actions.insertRowsBefore);
        },

        mceTableInsertRowAfter: function () {
          actOnSelection(actions.insertRowsAfter);
        },

        mceTableInsertColBefore: function () {
          actOnSelection(actions.insertColumnsBefore);
        },

        mceTableInsertColAfter: function () {
          actOnSelection(actions.insertColumnsAfter);
        },

        mceTableDeleteCol: function () {
          actOnSelection(actions.deleteColumn);
        },

        mceTableDeleteRow: function () {
          actOnSelection(actions.deleteRow);
        },

        mceTableCutRow: function (grid) {
          clipboardRows = copyRowSelection();
          actOnSelection(actions.deleteRow);
        },

        mceTableCopyRow: function (grid) {
          clipboardRows = copyRowSelection();
        },

        mceTablePasteRowBefore: function (grid) {
          pasteOnSelection(actions.pasteRowsBefore);
        },

        mceTablePasteRowAfter: function (grid) {
          pasteOnSelection(actions.pasteRowsAfter);
        },

        mceTableDelete: eraseTable
      }, function (func, name) {
        editor.addCommand(name, func);
      });

      // Register dialog commands
      each({
        mceInsertTable: Fun.curry(TableDialog.open, editor),
        mceTableProps: Fun.curry(TableDialog.open, editor, true),
        mceTableRowProps: Fun.curry(RowDialog.open, editor),
        mceTableCellProps: Fun.curry(CellDialog.open, editor)
      }, function (func, name) {
        editor.addCommand(name, function (ui, val) {
          func(val);
        });
      });
    };

    return {
      registerCommands: registerCommands,
      getClipboardRows: getClipboardRows,
      setClipboardRows: setClipboardRows
    };
  }
);
