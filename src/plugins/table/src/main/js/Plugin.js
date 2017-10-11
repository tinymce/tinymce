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
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'ephox.snooker.api.ResizeWire',
    'ephox.snooker.api.TableDirection',
    'ephox.snooker.api.TableResize',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.SelectorFilter',
    'tinymce.core.PluginManager',
    'tinymce.plugins.table.actions.Clipboard',
    'tinymce.plugins.table.actions.InsertTable',
    'tinymce.plugins.table.actions.TableActions',
    'tinymce.plugins.table.actions.TableCommands',
    'tinymce.plugins.table.actions.TableWire',
    'tinymce.plugins.table.queries.Direction',
    'tinymce.plugins.table.queries.TabContext',
    'tinymce.plugins.table.selection.CellSelection',
    'tinymce.plugins.table.selection.Ephemera',
    'tinymce.plugins.table.selection.Selections',
    'tinymce.plugins.table.ui.Buttons',
    'tinymce.plugins.table.ui.Dialogs',
    'tinymce.plugins.table.ui.MenuItems'
  ],
  function (Arr, Option, ResizeWire, TableDirection, TableResize, Element, Attr, SelectorFilter, PluginManager, Clipboard, InsertTable, TableActions, TableCommands, TableWire, Direction, TabContext, CellSelection, Ephemera, Selections, Buttons, Dialogs, MenuItems) {
    function Plugin(editor) {
      var self = this;

      var lazyResize = function () {
        return resize;
      };

      var lazyWire = function () {
        return wire.getOr(ResizeWire.only(Element.fromDom(editor.getBody())));
      };

      var cellSelection = CellSelection(editor, lazyResize);

      var dialogs = new Dialogs(editor);

      var actions = TableActions(editor, lazyWire);

      var selections = Selections(editor);

      TableCommands.registerCommands(editor, dialogs, actions, cellSelection, selections);

      Clipboard.registerEvents(editor, selections, actions, cellSelection);

      MenuItems.addMenuItems(editor, dialogs, selections);
      Buttons.addButtons(editor, dialogs);
      Buttons.addToolbars(editor);

      var resize = Option.none();
      var wire = Option.none();
      var selectionRng = Option.none();


      editor.on('init', function () {
        var direction = TableDirection(Direction.directionAt);
        var rawWire = TableWire.get(editor);
        wire = Option.some(rawWire);
        if (editor.settings.object_resizing && editor.settings.table_resize_bars !== false &&
          (editor.settings.object_resizing === true || editor.settings.object_resizing === 'table')) {
          var sz = TableResize(rawWire, direction);
          sz.on();
          sz.events.startDrag.bind(function (event) {
            selectionRng = Option.some(editor.selection.getRng());
          });
          sz.events.afterResize.bind(function (event) {
            var table = event.table();
            var dataStyleCells = SelectorFilter.descendants(table, 'td[data-mce-style],th[data-mce-style]');
            Arr.each(dataStyleCells, function (cell) {
              Attr.remove(cell, 'data-mce-style');
            });
            editor.focus();
            selectionRng.each(function (rng) {
              editor.selection.setRng(rng);
            });
            editor.undoManager.add();
          });

          resize = Option.some(sz);
        }
      });

      editor.on('PreInit', function () {
        // Remove internal data attributes
        editor.serializer.addTempAttr(Ephemera.firstSelected());
        editor.serializer.addTempAttr(Ephemera.lastSelected());
      });

      // Enable tab key cell navigation
      if (editor.settings.table_tab_navigation !== false) {
        editor.on('keydown', function (e) {
          TabContext.handle(e, editor, actions, lazyWire);
        });
      }

      editor.on('remove', function () {
        resize.each(function (sz) {
          sz.destroy();
        });
        cellSelection.destroy();
      });

      self.insertTable = function (columns, rows) {
        InsertTable.insert(editor, columns, rows);
      };
      self.setClipboardRows = TableCommands.setClipboardRows;
      self.getClipboardRows = TableCommands.getClipboardRows;
    }

    PluginManager.add('table', Plugin);

    return function () { };
  }
);
