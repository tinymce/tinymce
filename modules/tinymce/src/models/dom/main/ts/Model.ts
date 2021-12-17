/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import ModelManager, { Model } from 'tinymce/core/api/ModelManager';

import * as Table from './table/Table';

// TODO: TINY-8353 Remove table API once fakeClipboard can be removed
const DomModel = (editor: Editor): Model => {
  const tableApi = Table.setupTable(editor);

  return {
    table: {
      ...tableApi
    }
  };
};

export default () => {
  ModelManager.add('dom', DomModel);
};
