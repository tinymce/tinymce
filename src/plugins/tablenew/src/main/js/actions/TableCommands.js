define(
  'tinymce.plugins.tablenew.actions.TableCommands',

  [
    'ephox.darwin.api.TableSelection',
    'ephox.snooker.api.CopyRows',
    'ephox.snooker.api.TableFill',
    'ephox.snooker.api.TableLookup',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'tinymce.core.util.Tools',
    'tinymce.plugins.tablenew.queries.TableTargets',
    'tinymce.plugins.tablenew.selection.Selections'
  ],

  function (TableSelection, CopyRows, TableFill, TableLookup, Insert, Remove, Element, Tools, TableTargets, Selections) {
    var each = Tools.each;

    var clipboardRows;

    var registerCommands = function (editor, dialogs, actions, cellSelection) {

      var selections = Selections(editor);

      var eraseTable = function () {
        var cell = Element.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
        var table = TableLookup.table(cell);
        table.bind(function (table) {
          var cursor = Element.fromText('');
          Insert.after(table, cursor);
          Remove.remove(table);
          var rng = editor.dom.createRng();
          rng.setStart(cursor.dom(), 0);
          rng.setEnd(cursor.dom(), 0);
          editor.selection.setRng(rng);
        });
      };

      var actOnSelection = function (execute) {
        var cell = Element.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
        var table = TableLookup.table(cell);
        table.bind(function (table) {
          var targets = TableTargets.forMenu(selections, table, cell);
          execute(table, targets).each(function (rng) {
            editor.selection.setRng(rng);
            editor.focus();
            cellSelection.clear(table);
          });
        });
      };

      var doOnSelection = function (execute) {
        var cell = Element.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
        var table = TableLookup.table(cell);
        return table.bind(function (table) {
          var targets = TableTargets.forMenu(selections, table, cell);
          return CopyRows.copyRows(table, targets);
        });
      };

      var pasteOnSelection = function (execute) {
        var cell = Element.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
        var table = TableLookup.table(cell);
        table.bind(function (table) {
          var doc = Element.fromDom(editor.getDoc());
          var generators = TableFill.paste(doc);
          var targets = TableTargets.pasteRows(selections, table, cell, clipboardRows, generators);
          execute(table, targets).each(function (rng) {
            editor.selection.setRng(rng);
            editor.focus();
            cellSelection.clear(table);
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

        // mceTableCutRow: function (grid) {
        //   clipboardRows = grid.cutRows();
        // },

        mceTableCopyRow: function (grid) {
          clipboardRows = doOnSelection();
          console.log(clipboardRows);
        },

        mceTablePasteRowBefore: function (grid) {
          pasteOnSelection(actions.pasteRowsBefore);
        },

        // mceTablePasteRowAfter: function (grid) {
        //   grid.pasteRows(clipboardRows);
        // },

        // mceSplitColsBefore: function (grid) {
        //   grid.splitCols(true);
        // },

        // mceSplitColsAfter: function (grid) {
        //   grid.splitCols(false);
        // },

        mceTableDelete: eraseTable
      }, function (func, name) {
        editor.addCommand(name, func);
      });

      // Register dialog commands
      each({
        mceInsertTable: dialogs.table,
        mceTableProps: function () {
          dialogs.table(true);
        },
        mceTableRowProps: dialogs.row,
        mceTableCellProps: dialogs.cell
      }, function (func, name) {
        editor.addCommand(name, function (ui, val) {
          func(val);
        });
      });
    };

    return {
      registerCommands: registerCommands
    };
  }
);
