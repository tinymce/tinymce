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
  'tinymce.plugins.table.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.plugins.table.actions.Clipboard',
    'tinymce.plugins.table.actions.InsertTable',
    'tinymce.plugins.table.actions.TableActions',
    'tinymce.plugins.table.actions.TableCommands',
    'tinymce.plugins.table.actions.ResizeHandler',
    'tinymce.plugins.table.queries.TabContext',
    'tinymce.plugins.table.selection.CellSelection',
    'tinymce.plugins.table.selection.Ephemera',
    'tinymce.plugins.table.selection.Selections',
    'tinymce.plugins.table.ui.Buttons',
    'tinymce.plugins.table.ui.MenuItems'
  ],
  function (PluginManager, Clipboard, InsertTable, TableActions, TableCommands, ResizeHandler, TabContext, CellSelection, Ephemera, Selections, Buttons, MenuItems) {
    function Plugin(editor) {
      var self = this;

      var resizeHandler = ResizeHandler(editor);
      var cellSelection = CellSelection(editor, resizeHandler.lazyResize);
      var actions = TableActions(editor, resizeHandler.lazyWire);
      var selections = Selections(editor);

      TableCommands.registerCommands(editor, actions, cellSelection, selections);

      Clipboard.registerEvents(editor, selections, actions, cellSelection);

      MenuItems.addMenuItems(editor, selections);
      Buttons.addButtons(editor);
      Buttons.addToolbars(editor);


      editor.on('PreInit', function () {
        // Remove internal data attributes
        editor.serializer.addTempAttr(Ephemera.firstSelected());
        editor.serializer.addTempAttr(Ephemera.lastSelected());
      });

      // Enable tab key cell navigation
      if (editor.settings.table_tab_navigation !== false) {
        editor.on('keydown', function (e) {
          TabContext.handle(e, editor, actions, resizeHandler.lazyWire);
        });
      }

      editor.on('remove', function () {
        resizeHandler.destroy();
        cellSelection.destroy();
      });

      self.insertTable = function (columns, rows) {
        return InsertTable.insert(editor, columns, rows);
      };
      self.setClipboardRows = TableCommands.setClipboardRows;
      self.getClipboardRows = TableCommands.getClipboardRows;
    }

    PluginManager.add('table', Plugin);

    return function () { };
  }
);
