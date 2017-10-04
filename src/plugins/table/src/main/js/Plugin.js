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
    'ephox.snooker.api.ResizeWire',
    'ephox.snooker.api.TableDirection',
    'ephox.snooker.api.TableResize',
    'ephox.sugar.api.node.Element',
    'tinymce.core.PluginManager',
    'tinymce.plugins.tablenew.actions.Clipboard',
    'tinymce.plugins.tablenew.actions.TableActions',
    'tinymce.plugins.tablenew.actions.TableCommands',
    'tinymce.plugins.tablenew.actions.TableWire',
    'tinymce.plugins.tablenew.queries.Direction',
    'tinymce.plugins.tablenew.queries.TabContext',
    'tinymce.plugins.tablenew.selection.CellSelection',
    'tinymce.plugins.tablenew.selection.Ephemera',
    'tinymce.plugins.tablenew.selection.Selections',
    'tinymce.plugins.tablenew.ui.Buttons',
    'tinymce.plugins.tablenew.ui.Dialogs',
    'tinymce.plugins.tablenew.ui.MenuItems'
  ],
  function (Option, ResizeWire, TableDirection, TableResize, Element, PluginManager, Clipboard, TableActions, TableCommands, TableWire, Direction, TabContext, CellSelection, Ephemera, Selections, Buttons, Dialogs, MenuItems) {
    function Plugin(editor) {

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
          sz.events.startDrag.bind(function () {
            selectionRng = Option.some(editor.selection.getRng());
          });
          sz.events.afterResize.bind(function () {
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
        var attributes = Ephemera.firstSelected() + ',' + Ephemera.lastSelected();
        editor.serializer.addAttributeFilter(attributes,
          function (nodes, name) {

            var i = nodes.length;

            while (i--) {
              nodes[i].attr(name, null);
            }
          });
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
    }

    PluginManager.add('table', Plugin);

    return function () { };
  }
);
