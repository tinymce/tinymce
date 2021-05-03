/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Selections } from '@ephox/darwin';
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
import * as TableFormats from './core/TableFormats';
import * as Util from './core/Util';
import * as TabContext from './queries/TabContext';
import CellSelection from './selection/CellSelection';
import { ephemera } from './selection/Ephemera';
import { getSelectionTargets } from './selection/SelectionTargets';
import { getSelectionStartCellOrCaption } from './selection/TableSelection';
import * as Buttons from './ui/Buttons';
import * as MenuItems from './ui/MenuItems';

const Plugin = (editor: Editor) => {
  const selections = Selections(() => Util.getBody(editor), () => getSelectionStartCellOrCaption(Util.getSelectionStart(editor)), ephemera.selectedSelector);
  const selectionTargets = getSelectionTargets(editor, selections);
  const resizeHandler = getResizeHandler(editor);
  const cellSelection = CellSelection(editor, resizeHandler.lazyResize, selectionTargets);
  const actions = TableActions(editor, resizeHandler.lazyWire, selections);
  const clipboard = FakeClipboard();

  Commands.registerCommands(editor, actions, cellSelection, selections, clipboard);
  QueryCommands.registerQueryCommands(editor, actions, selections);
  Clipboard.registerEvents(editor, selections, actions, cellSelection);

  MenuItems.addMenuItems(editor, selectionTargets, clipboard);
  Buttons.addButtons(editor, selectionTargets, clipboard);
  Buttons.addToolbars(editor);

  editor.on('PreInit', () => {
    editor.serializer.addTempAttr(ephemera.firstSelected);
    editor.serializer.addTempAttr(ephemera.lastSelected);
    TableFormats.registerFormats(editor);
  });

  if (hasTabNavigation(editor)) {
    editor.on('keydown', (e: KeyboardEvent) => {
      TabContext.handle(e, editor, cellSelection);
    });
  }

  editor.on('remove', () => {
    resizeHandler.destroy();
  });

  return getApi(editor, clipboard, resizeHandler, selectionTargets);
};

export default () => {
  PluginManager.add('table', Plugin);
};
