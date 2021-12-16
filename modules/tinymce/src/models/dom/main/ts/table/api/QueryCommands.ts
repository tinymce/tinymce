/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Obj } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';

import Editor from 'tinymce/core/api/Editor';

import { LookupAction, TableActions } from '../actions/TableActions';
import * as Utils from '../core/TableUtils';
import * as TableTargets from '../queries/TableTargets';
import * as TableSelection from '../selection/TableSelection';

const registerQueryCommands = (editor: Editor, actions: TableActions): void => {
  const isRoot = Utils.getIsRoot(editor);

  const lookupOnSelection = (action: LookupAction): string =>
    TableSelection.getSelectionCell(Utils.getSelectionStart(editor)).bind((cell) =>
      TableLookup.table(cell, isRoot).map((table) => {
        const targets = TableTargets.forMenu(TableSelection.getCellsFromSelection(editor), table, cell);
        return action(table, targets);
      })
    ).getOr('');

  Obj.each({
    mceTableRowType: () => lookupOnSelection(actions.getTableRowType),
    mceTableCellType: () => lookupOnSelection(actions.getTableCellType),
    mceTableColType: () => lookupOnSelection(actions.getTableColType)
  }, (func, name) => editor.addQueryValueHandler(name, func));
};

export { registerQueryCommands };

