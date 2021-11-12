/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Obj, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { insertTableWithDataValidation } from '../actions/InsertTable';
import * as CellDialog from '../ui/CellDialog';
import * as RowDialog from '../ui/RowDialog';
import * as TableDialog from '../ui/TableDialog';

const registerCommands = (editor: Editor): void => {
  // Register dialog commands
  Obj.each({
    // AP-101 TableDialog.open renders a slightly different dialog if isNew is true
    mceTableProps: Fun.curry(TableDialog.open, editor, false),
    mceTableRowProps: Fun.curry(RowDialog.open, editor),
    mceTableCellProps: Fun.curry(CellDialog.open, editor)
  }, (func, name) => editor.addCommand(name, () => func()));

  editor.addCommand('mceInsertTable', (_ui, args) => {
    if (Type.isObject(args) && Obj.keys(args).length > 0) {
      insertTableWithDataValidation(editor, args.rows, args.columns, args.options, 'Invalid values for mceInsertTable - rows and columns values are required to insert a table.');
    } else {
      TableDialog.open(editor, true);
    }
  });
};

export { registerCommands };
