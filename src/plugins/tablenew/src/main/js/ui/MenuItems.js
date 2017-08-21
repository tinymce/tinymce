define(
  'tinymce.plugins.tablenew.ui.MenuItems',

  [
    'ephox.darwin.api.TableSelection',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'ephox.snooker.api.TableLookup',
    'ephox.sugar.api.node.Element',
    'tinymce.plugins.tablenew.actions.TableActions',
    'tinymce.plugins.tablenew.queries.TableTargets',
    'tinymce.plugins.tablenew.selection.Selections'
  ],

  function (TableSelection, Arr, Option, TableLookup, Element, TableActions, TableTargets, Selections) {
    return function (editor) {
      var actions = TableActions(editor);
      var selections = Selections(editor);

      var targets = Option.none();

      var actOnSelection = function (execute) {
        return function () {
          var cell = Element.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
          var table = TableLookup.table(cell);
          table.bind(function (table) {
            var targets = TableTargets.forMenu(selections, table, cell);
            execute(table, targets).each(function (rng) {
              editor.selection.setRng(rng);
              editor.focus();
              TableSelection.clear(table);
            });
          });
        };
      };

      var cellCtrls = [];
      var mergeCtrls = [];
      var unmergeCtrls = [];

      var pushCell = function () {
        cellCtrls.push(this);
      };

      var pushMerge = function () {
        mergeCtrls.push(this);
      };

      var pushUnmerge = function () {
        unmergeCtrls.push(this);
      };

      editor.on('init', function () {
        editor.on('nodechange', function (e) {
          var cellOpt = Option.from(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
          targets = cellOpt.bind(function (cellDom) {
            var cell = Element.fromDom(cellDom);
            var table = TableLookup.table(cell);
            return table.map(function (table) {
              return TableTargets.forMenu(selections, table, cell);
            });
          });

          targets.fold(function () {
            Arr.each(cellCtrls, function (cellCtrl) {
              cellCtrl.disabled(true);
            });
            Arr.each(mergeCtrls, function (mergeCtrl) {
              mergeCtrl.disabled(true);
            });
            Arr.each(unmergeCtrls, function (unmergeCtrl) {
              unmergeCtrl.disabled(true);
            });
          }, function (targets) {
            Arr.each(cellCtrls, function (cellCtrl) {
              cellCtrl.disabled(false);
            });
            Arr.each(mergeCtrls, function (mergeCtrl) {
              mergeCtrl.disabled(targets.mergable().isNone());
            });
            Arr.each(unmergeCtrls, function (unmergeCtrl) {
              unmergeCtrl.disabled(targets.unmergable().isNone());
            });
          });
        });
      });

      var row = {
        text: 'Row',
        context: 'table',
        menu: [
          { text: 'Insert row before', onclick: actOnSelection(actions.insertRowBefore), onPostRender: pushCell },
          { text: 'Insert row after', onclick: actOnSelection(actions.insertRowAfter), onPostRender: pushCell },
          { text: 'Delete row', onclick: actOnSelection(actions.deleteRow), onPostRender: pushCell }
        ]
      };

      var column = {
        text: 'Column',
        context: 'table',
        menu: [
          { text: 'Insert column before', onclick: actOnSelection(actions.insertColumnBefore), onPostRender: pushCell },
          { text: 'Insert column after', onclick: actOnSelection(actions.insertColumnAfter), onPostRender: pushCell },
          { text: 'Delete column', onclick: actOnSelection(actions.deleteColumn), onPostRender: pushCell }
        ]
      };

      var cell = {
        separator: 'before',
        text: 'Cell',
        context: 'table',
        menu: [
          { text: 'Merge cells', onclick: actOnSelection(actions.mergeCells), onPostRender: pushMerge },
          { text: 'Split cell', onclick: actOnSelection(actions.unmergeCells), onPostRender: pushUnmerge }
        ]
      };

      return {
        row: row,
        column: column,
        cell: cell
      };
    };
  }
);
