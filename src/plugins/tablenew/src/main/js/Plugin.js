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
    'ephox.snooker.api.TableDirection',
    'ephox.snooker.api.TableResize',
    'tinymce.core.PluginManager',
    'tinymce.plugins.tablenew.actions.TableWire',
    'tinymce.plugins.tablenew.selection.CellSelection',
    'tinymce.plugins.tablenew.ui.InsertTable',
    'tinymce.plugins.tablenew.ui.MenuItems',
    'tinymce.plugins.tablenew.queries.Direction'
  ],
  function (TableDirection, TableResize, PluginManager, TableWire, CellSelection, InsertTable, MenuItems, Direction) {
    function Plugin(editor) {
      var cellSelection = CellSelection(editor);

      var menuItems = MenuItems(editor);

      editor.addMenuItem('inserttable', InsertTable.insertTableMenuItem(editor));

      editor.addMenuItem('row', menuItems.row);

      editor.addMenuItem('column', menuItems.column);

      editor.addMenuItem('cell', menuItems.cell);

      editor.on('init', function () {
        var direction = TableDirection(Direction.directionAt);
        var rawWire = TableWire.get(editor);
        var sz = TableResize(rawWire, direction);
        sz.on();
      });

    }

    PluginManager.add('tablenew', Plugin);

    return function () { };
  }
);
