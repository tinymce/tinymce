/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Clipboard from './actions/Clipboard';
import { TableActions } from './actions/TableActions';
import Commands from './api/Commands';
import { ResizeHandler } from './actions/ResizeHandler';
import TabContext from './queries/TabContext';
import CellSelection from './selection/CellSelection';
import Ephemera from './selection/Ephemera';
import { Selections } from './selection/Selections';
import Buttons from './ui/Buttons';
import MenuItems from './ui/MenuItems';
import { hasTabNavigation } from './api/Settings';
import { getApi } from './api/Api';
import { Cell, Option } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';
import { KeyboardEvent } from '@ephox/dom-globals';

function Plugin(editor: Editor) {
  const resizeHandler = ResizeHandler(editor);
  const cellSelection = CellSelection(editor, resizeHandler.lazyResize);
  const actions = TableActions(editor, resizeHandler.lazyWire);
  const selections = Selections(editor);
  const clipboardRows = Cell(Option.none());

  Commands.registerCommands(editor, actions, cellSelection, selections, clipboardRows);
  Clipboard.registerEvents(editor, selections, actions, cellSelection);

  MenuItems.addMenuItems(editor, selections);
  Buttons.addButtons(editor);
  Buttons.addToolbars(editor);

  editor.on('PreInit', function () {
    editor.serializer.addTempAttr(Ephemera.firstSelected());
    editor.serializer.addTempAttr(Ephemera.lastSelected());
  });

  if (hasTabNavigation(editor)) {
    editor.on('keydown', function (e: KeyboardEvent) {
      TabContext.handle(e, editor, actions, resizeHandler.lazyWire);
    });
  }

  editor.on('remove', function () {
    resizeHandler.destroy();
    cellSelection.destroy();
  });

  return getApi(editor, clipboardRows);
}

PluginManager.add('table', Plugin);

export default function () { }