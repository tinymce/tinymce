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
    'ephox.katamari.api.Option',
    'ephox.snooker.api.TableDirection',
    'ephox.snooker.api.TableResize',
    'tinymce.core.PluginManager',
    'tinymce.plugins.tablenew.actions.TableCommands',
    'tinymce.plugins.tablenew.actions.TableWire',
    'tinymce.plugins.tablenew.queries.Direction',
    'tinymce.plugins.tablenew.selection.CellSelection',
    'tinymce.plugins.tablenew.ui.Buttons',
    'tinymce.plugins.tablenew.ui.MenuItems',
    'tinymce.plugins.tablenew.ui.Dialogs'
  ],
  function (Option, TableDirection, TableResize, PluginManager, TableCommands, TableWire, Direction, CellSelection, Buttons, MenuItems, Dialogs) {
    function Plugin(editor) {

      var lazyResize = function () {
        return resize;
      };

      var cellSelection = CellSelection(editor, lazyResize);

      var dialogs = new Dialogs(editor);

      TableCommands.registerCommands(editor, dialogs);

      MenuItems.addMenuItems(editor, dialogs);
      Buttons.addButtons(editor, dialogs);
      Buttons.addToolbars(editor);

      var resize = Option.none();
      var selectionRng = Option.none();

      editor.on('init', function () {
        var direction = TableDirection(Direction.directionAt);
        var rawWire = TableWire.get(editor);
        if (editor.settings.object_resizing && editor.settings.table_resize_bars !== false &&
          (editor.settings.object_resizing === true || editor.settings.object_resizing === 'table')) {
          var sz = TableResize(rawWire, direction);
          sz.on();
          sz.events.startDrag.bind(function () {
            selectionRng = Option.some(editor.selection.getRng());
          });
          sz.events.afterResize.bind(function () {
            editor.focus();
            selectionRng.each(function (rng) {
              editor.selection.setRng(rng);
            });
          });

          resize = Option.some(sz);
        }
      });

      editor.on('remove', function () {
        resize.each(function (sz) {
          sz.destroy();
        });
        cellSelection.destroy();
      });
    }

    PluginManager.add('table', Plugin);

    return function () { };
  }
);
