import Editor from 'tinymce/core/api/Editor';
import { Model } from 'tinymce/core/api/ModelManager';

import * as Clipboard from './actions/Clipboard';
import { TableActions } from './actions/TableActions';
import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as QueryCommands from './api/QueryCommands';
import { TableCellSelectionHandler } from './api/TableCellSelectionHandler';
import { TableResizeHandler } from './api/TableResizeHandler';

export type Table = Model['table'];

const setupTable = (editor: Editor): Table => {
  Options.register(editor);
  const resizeHandler = TableResizeHandler(editor);
  const cellSelectionHandler = TableCellSelectionHandler(editor, resizeHandler);

  const actions = TableActions(editor, resizeHandler, cellSelectionHandler);
  Commands.registerCommands(editor, actions);
  QueryCommands.registerQueryCommands(editor, actions);
  // TODO: TINY-8385 Maybe move to core. Although, will need RTC to have that working first
  Clipboard.registerEvents(editor, actions);

  return {
    getSelectedCells: cellSelectionHandler.getSelectedCells,
    clearSelectedCells: cellSelectionHandler.clearSelectedCells
  };
};

export {
  setupTable
};
