/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { KeyboardEvent } from '@ephox/dom-globals';
import Editor from 'tinymce/core/api/Editor';
import PluginManager from 'tinymce/core/api/PluginManager';
import * as Clipboard from './actions/Clipboard';
import { getResizeHandler } from './actions/ResizeHandler';
import { TableActions } from './actions/TableActions';
import { getApi } from './api/Api';
import * as Commands from './api/Commands';
import * as QueryCommands from './api/QueryCommands';
import { hasTabNavigation } from './api/Settings';
import { Clipboard as FakeClipboard } from './core/Clipboard';
import * as TabContext from './queries/TabContext';
import CellSelection from './selection/CellSelection';
import * as Ephemera from './selection/Ephemera';
import { Selections } from './selection/Selections';
import { getSelectionTargets } from './selection/SelectionTargets';
import * as Buttons from './ui/Buttons';
import * as MenuItems from './ui/MenuItems';
import * as TableFormats from './core/TableFormats';

function Plugin(editor: Editor) {
  const selections = Selections(editor);
  const selectionTargets = getSelectionTargets(editor, selections);
  const resizeHandler = getResizeHandler(editor);
  const cellSelection = CellSelection(editor, resizeHandler.lazyResize, selectionTargets);
  const actions = TableActions(editor, resizeHandler.lazyWire);
  const clipboard = FakeClipboard();

  Commands.registerCommands(editor, actions, cellSelection, selections, clipboard);
  QueryCommands.registerQueryCommands(editor, actions, selections);
  Clipboard.registerEvents(editor, selections, actions, cellSelection);

  MenuItems.addMenuItems(editor, selectionTargets, clipboard);
  Buttons.addButtons(editor, selectionTargets, clipboard);
  Buttons.addToolbars(editor);

  editor.on('PreInit', function () {
    editor.serializer.addTempAttr(Ephemera.firstSelected);
    editor.serializer.addTempAttr(Ephemera.lastSelected);
    TableFormats.registerFormats(editor);
  });

  if (hasTabNavigation(editor)) {
    editor.on('keydown', function (e: KeyboardEvent) {
      TabContext.handle(e, editor, actions, resizeHandler.lazyWire);
    });
  }

  editor.on('remove', function () {
    resizeHandler.destroy();
  });

  return getApi(editor, clipboard, resizeHandler, selectionTargets);
}

export default function () {
  PluginManager.add('table', Plugin);
}
