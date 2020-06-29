/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Obj, Option } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { TableActions } from '../actions/TableActions';
import * as Util from '../core/Util';
import * as TableTargets from '../queries/TableTargets';
import { Selections } from '../selection/Selections';
import * as TableSelection from '../selection/TableSelection';

const registerQueryCommands = (editor: Editor, actions: TableActions, selections: Selections) => {
  const isRoot = Util.getIsRoot(editor);
  const getTableFromCell = (cell: Element): Option<Element> => TableLookup.table(cell, isRoot);

  Obj.each({
    mceTableRowType: () => actions.getTableRowType(editor),
    mceTableCellType: () => actions.getTableCellType(editor),
    mceTableColType: () => TableSelection.getSelectionStartCell(editor).bind((cell) =>
      getTableFromCell(cell).map((table): string => {
        const targets = TableTargets.forMenu(selections, table, cell);
        return actions.getTableColType(table, targets);
      })
    ).getOr('')
  }, (func, name) => editor.addQueryValueHandler(name, func));

};

export { registerQueryCommands };

