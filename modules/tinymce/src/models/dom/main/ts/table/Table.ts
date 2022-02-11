/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import * as Clipboard from './actions/Clipboard';
import { TableActions } from './actions/TableActions';
import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as QueryCommands from './api/QueryCommands';
import { TableCellSelection } from './api/TableCellSelection';
import { TableResizeHandler } from './api/TableResizeHandler';

const setupTable = (editor: Editor): void => {
  Options.register(editor);
  const resizeHandler = TableResizeHandler(editor);
  TableCellSelection(editor, resizeHandler);

  const actions = TableActions(editor, resizeHandler);
  Commands.registerCommands(editor, actions);
  QueryCommands.registerQueryCommands(editor, actions);
  // TODO: TINY-8385 Maybe move to core. Although, will need RTC to have that working first
  Clipboard.registerEvents(editor, actions);
};

export {
  setupTable
};
