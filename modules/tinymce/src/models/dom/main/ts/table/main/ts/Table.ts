/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Selections } from '@ephox/darwin';
// import { Cell, Optional } from '@ephox/katamari';
// import { RunOperation } from '@ephox/snooker';

import Editor from 'tinymce/core/api/Editor';

import * as Clipboard from './actions/Clipboard';
import { getResizeHandler } from './actions/ResizeHandler';
import { TableActions } from './actions/TableActions';
import { Api, getApi } from './api/Api';
import * as Commands from './api/Commands';
import * as QueryCommands from './api/QueryCommands';
import { hasTabNavigation } from './api/Settings';
// import { Clipboard as FakeClipboard } from './core/Clipboard';
import * as TableFormats from './core/TableFormats';
import * as Util from './core/Util';
import * as TabContext from './queries/TabContext';
import CellSelection from './selection/CellSelection';
import { ephemera } from './selection/Ephemera';
import { getSelectionTargets } from './selection/SelectionTargets';
import { getSelectionCell } from './selection/TableSelection';

const setupTable = (editor: Editor): Api => {
  const selections = Selections(() => Util.getBody(editor), () => getSelectionCell(Util.getSelectionStart(editor), Util.getIsRoot(editor)), ephemera.selectedSelector);
  // TODO: Need to figure out how to properly share selectionTargets - maybe just expose the targets cell and work off that - might need a register API of some sort?
  const selectionTargets = getSelectionTargets(editor, selections);
  const resizeHandler = getResizeHandler(editor);
  // TODO: I don't think we want CellSelection here as the selection should be in core but leave here for now
  const cellSelection = CellSelection(editor, resizeHandler.lazyResize, selectionTargets);
  const actions = TableActions(editor, cellSelection, resizeHandler.lazyWire);
  // const clipboard = FakeClipboard();

  Commands.registerCommands(editor, actions, selections);
  QueryCommands.registerQueryCommands(editor, actions, selections);
  Clipboard.registerEvents(editor, selections, actions);

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

  // TODO: Attempt making the API just in the internal APIs
  // Maybe add ephemera to the API as well
  return getApi(resizeHandler, selectionTargets, selections, cellSelection);
};

export {
  setupTable
};
