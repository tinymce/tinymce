define(
  'tinymce.plugins.tablenew.ui.MenuItems',

  [
    'tinymce.plugins.tablenew.actions.TableActions'
  ],

  function (TableActions) {
    return function (editor) {
      var actions = TableActions(editor);

      var row = {
        text: 'Row',
        context: 'table',
        menu: [
          { text: 'Insert row before', onclick: actions.insertRowBefore/*, onPostRender: postRenderCell */ },
          { text: 'Insert row after', onclick: actions.insertRowAfter/*, onPostRender: postRenderCell */ }
        ]
      };

      var column = {
        text: 'Column',
        context: 'table',
        menu: [
          { text: 'Insert column before', onclick: actions.insertColumnBefore/*, onPostRender: postRenderCell*/ },
          { text: 'Insert column after', onclick: actions.insertColumnAfter/*, onPostRender: postRenderCell*/ }
        ]
      };

      var cell = {
        separator: 'before',
        text: 'Cell',
        context: 'table',
        menu: [
          { text: 'Merge cells', onclick: actions.mergeCells/*, onPostRender: postRenderMergeCell*/ }
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
