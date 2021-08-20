/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Selections } from '@ephox/darwin';
import { Obj } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';

import Editor from 'tinymce/core/api/Editor';

import { LookupAction, TableActions } from '../actions/TableActions';
import * as Util from '../core/Util';
import * as TableTargets from '../queries/TableTargets';
import * as TableSelection from '../selection/TableSelection';

const registerQueryCommands = (editor: Editor, actions: TableActions, selections: Selections): void => {
  const isRoot = Util.getIsRoot(editor);

  const lookupOnSelection = (action: LookupAction): string =>
    TableSelection.getSelectionCell(Util.getSelectionStart(editor)).bind((cell) =>
      TableLookup.table(cell, isRoot).map((table) => {
        const targets = TableTargets.forMenu(selections, table, cell);
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

