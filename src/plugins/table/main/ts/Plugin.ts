/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import PluginManager from 'tinymce/core/PluginManager';
import Clipboard from './actions/Clipboard';
import InsertTable from './actions/InsertTable';
import TableActions from './actions/TableActions';
import TableCommands from './actions/TableCommands';
import ResizeHandler from './actions/ResizeHandler';
import TabContext from './queries/TabContext';
import CellSelection from './selection/CellSelection';
import Ephemera from './selection/Ephemera';
import Selections from './selection/Selections';
import Buttons from './ui/Buttons';
import MenuItems from './ui/MenuItems';

/**
 * This class contains all core logic for the table plugin.
 *
 * @class tinymce.table.Plugin
 * @private
 */

function Plugin(editor) {
  const self = this;

  const resizeHandler = ResizeHandler(editor);
  const cellSelection = CellSelection(editor, resizeHandler.lazyResize);
  const actions = TableActions(editor, resizeHandler.lazyWire);
  const selections = Selections(editor);

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

export default function () { }