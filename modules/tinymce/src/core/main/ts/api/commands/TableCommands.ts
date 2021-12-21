/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as InsertTable from '../../table/InsertTable';
import Editor from '../Editor';

export const registerCommands = (editor: Editor): void => {
  editor.editorCommands.addCommands({
    mceInsertTable: (_command, _ui, args) => {
      InsertTable.insertTable(editor, args.rows, args.columns, args.options);
    }
  });
};
