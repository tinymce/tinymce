/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Clipboard from './actions/Clipboard';
import { TableActions } from './actions/TableActions';
import { Api, getApi } from './api/Api';
import * as Commands from './api/Commands';
import * as QueryCommands from './api/QueryCommands';
import { Clipboard as FakeClipboard } from './core/Clipboard';
import * as TableFormats from './core/TableFormats';
import { ephemera } from './selection/Ephemera';

export interface PatchedSelections {
  readonly get: () => SugarElement<HTMLTableCellElement>[];
}

const setupTable = (editor: Editor): Api => {
  const actions = TableActions(editor);
  const clipboard = FakeClipboard();

  Commands.registerCommands(editor, actions, clipboard);
  QueryCommands.registerQueryCommands(editor, actions);
  // TODO: Maybe move to core. Although, will need RTC to have that working first
  Clipboard.registerEvents(editor, actions);

  // TODO: Maybe expose ephemera as an API of the table model
  editor.on('PreInit', () => {
    editor.serializer.addTempAttr(ephemera.firstSelected);
    editor.serializer.addTempAttr(ephemera.lastSelected);
    TableFormats.registerFormats(editor);
  });

  return getApi(clipboard);
};

export {
  setupTable
};
