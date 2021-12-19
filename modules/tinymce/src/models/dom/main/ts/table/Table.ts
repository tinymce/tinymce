/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import * as Clipboard from './actions/Clipboard';
import { TableActions } from './actions/TableActions';
import { Api, getApi } from './api/Api';
import { Clipboard as FakeClipboard } from './api/Clipboard';
import * as Commands from './api/Commands';
import * as QueryCommands from './api/QueryCommands';

const setupTable = (editor: Editor): Api => {
  const actions = TableActions(editor);
  const clipboard = FakeClipboard();

  Commands.registerCommands(editor, actions, clipboard);
  QueryCommands.registerQueryCommands(editor, actions);
  // TODO: Maybe move to core. Although, will need RTC to have that working first
  Clipboard.registerEvents(editor, actions);

  return getApi(clipboard);
};

export {
  setupTable
};
