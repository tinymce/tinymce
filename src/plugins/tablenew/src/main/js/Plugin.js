/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains all core logic for the table plugin.
 *
 * @class tinymce.table.Plugin
 * @private
 */
define(
  'tinymce.plugins.tablenew.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.plugins.tablenew.selection.CellSelection',
    'tinymce.plugins.tablenew.ui.InsertTable',
    'tinymce.plugins.tablenew.ui.MenuItems'
  ],
  function (PluginManager, CellSelection, InsertTable, MenuItems) {
    function Plugin(editor) {

      var cellSelection = CellSelection(editor);

      var menuItems = MenuItems(editor);

      editor.addMenuItem('inserttable', InsertTable.insertTableMenuItem(editor));

      editor.addMenuItem('row', menuItems.row);

      editor.addMenuItem('column', menuItems.column);

      editor.addMenuItem('cell', menuItems.cell);
    }

    PluginManager.add('tablenew', Plugin);

    return function () { };
  }
);
