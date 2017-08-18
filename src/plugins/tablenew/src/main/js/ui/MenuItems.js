define(
  'tinymce.plugins.tablenew.ui.MenuItems',

  [
    'tinymce.plugins.tablenew.actions.TableActions'
  ],

  function (TableActions) {
    return function (editor) {
      var actions = TableActions(editor);

      var handleDisabledState = function (ctrl, selector, sameParts) {
        function bindStateListener() {
          console.log('state listener fired');
          var selectedElm, selectedCells, parts = {}, sum = 0, state;

          selectedCells = editor.dom.select('td[data-mce-selected],th[data-mce-selected]');
          selectedElm = selectedCells[0];
          if (!selectedElm) {
            selectedElm = editor.selection.getStart();
          }

          // Make sure that we don't have a selection inside thead and tbody at the same time
          if (sameParts && selectedCells.length > 0) {
            each(selectedCells, function (cell) {
              return parts[cell.parentNode.parentNode.nodeName] = 1;
            });

            each(parts, function (value) {
              sum += value;
            });

            state = sum !== 1;
          } else {
            state = !editor.dom.getParent(selectedElm, selector);
          }

          ctrl.disabled(state);

          editor.selection.selectorChanged(selector, function (state) {
            ctrl.disabled(!state);
          });
        }

        if (editor.initialized) {
          bindStateListener();
        } else {
          editor.on('init', bindStateListener);
        }
      };

      var postRender = function () {
        /*jshint validthis:true*/
        handleDisabledState(this, 'table');
      };

      var postRenderCell = function () {
        /*jshint validthis:true*/
        handleDisabledState(this, 'td,th');
      };

      var postRenderMergeCell = function () {
        /*jshint validthis:true*/
        handleDisabledState(this, 'td,th', true);
      };

      var row = {
        text: 'Row',
        context: 'table',
        menu: [
          { text: 'Insert row before', onclick: actions.insertRowBefore, onPostRender: postRenderCell },
          { text: 'Insert row after', onclick: actions.insertRowAfter, onPostRender: postRenderCell },
          { text: 'Delete row', onclick: actions.deleteRow, onPostRender: postRenderCell }
        ]
      };

      var column = {
        text: 'Column',
        context: 'table',
        menu: [
          { text: 'Insert column before', onclick: actions.insertColumnBefore, onPostRender: postRenderCell },
          { text: 'Insert column after', onclick: actions.insertColumnAfter, onPostRender: postRenderCell },
          { text: 'Delete column', onclick: actions.deleteColumn, onPostRender: postRenderCell }
        ]
      };

      var cell = {
        separator: 'before',
        text: 'Cell',
        context: 'table',
        menu: [
          { text: 'Merge cells', onclick: actions.mergeCells/*, onPostRender: postRenderMergeCell*/ },
          { text: 'Split cell', onclick: actions.unmergeCells/*, onPostRender: postRenderCell*/ }
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
