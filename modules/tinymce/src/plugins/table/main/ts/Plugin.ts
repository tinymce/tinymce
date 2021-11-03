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
// import { getResizeHandler } from './actions/ResizeHandler';
import { TableActions } from './actions/TableActions';
// import { Api, getApi } from './api/Api';
import * as Commands from './api/Commands';
import * as Options from './api/Options';
// import * as QueryCommands from './api/QueryCommands';
import { Clipboard as FakeClipboard } from './core/Clipboard';
// import * as TableFormats from './core/TableFormats';
import * as Util from './core/Util';
// import * as TabContext from './queries/TabContext';
import CellSelection from './selection/CellSelection';
import { ephemera } from './selection/Ephemera';
import { getSelectionTargets } from './selection/SelectionTargets';
import { getSelectionCell } from './selection/TableSelection';
import * as Buttons from './ui/Buttons';
import * as MenuItems from './ui/MenuItems';

const Plugin = (editor: Editor): void => {
  Options.register(editor);

  const selections = Selections(() => Util.getBody(editor), () => getSelectionCell(Util.getSelectionStart(editor), Util.getIsRoot(editor)), ephemera.selectedSelector);
  const selectionTargets = getSelectionTargets(editor, selections);
  // const resizeHandler = getResizeHandler(editor);
  // const selectionTargets = editor.model.table.selectionTargets;
  const resizeHandler = editor.model.table.resizeHandler;
  const cellSelection = CellSelection(editor, resizeHandler.lazyResize, selectionTargets);
  const actions = TableActions(editor, cellSelection, resizeHandler.lazyWire);
  const clipboard = FakeClipboard();

  Commands.registerCommands(editor, selections);
  // Commands.registerCommands(editor, actions, cellSelection, selections, clipboard);
  // QueryCommands.registerQueryCommands(editor, actions, selections);
  Clipboard.registerEvents(editor, selections, actions);

  MenuItems.addMenuItems(editor, selections, selectionTargets, clipboard);
  Buttons.addButtons(editor, selections, selectionTargets, clipboard);
  Buttons.addToolbars(editor);

  // editor.on('PreInit', () => {
  //   editor.serializer.addTempAttr(ephemera.firstSelected);
  //   editor.serializer.addTempAttr(ephemera.lastSelected);
  //   TableFormats.registerFormats(editor);
  // });

  // if (Options.hasTabNavigation(editor)) {
  //   editor.on('keydown', (e: KeyboardEvent) => {
  //     TabContext.handle(e, editor, cellSelection);
  //   });
  // }

  // editor.on('remove', () => {
  //   resizeHandler.destroy();
  // });

  // return getApi(editor, clipboard, resizeHandler, selectionTargets);
};

export default (): void => {
  PluginManager.add('table', Plugin);
};
