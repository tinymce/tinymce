/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import ModelManager, { Model } from 'tinymce/core/api/ModelManager';

// import * as TableCommands from './table/Commands';

import * as Table from './table/main/ts/Table';

const DomModel = (editor: Editor): Model => {
  // TableCommands.register(editor);
  const tableApi = Table.setupTable(editor);

  // TODO: Add table commands
  return {
    table: {
      ...tableApi
    }
  };
};

export default () => {
  ModelManager.add('dom', DomModel);
};
