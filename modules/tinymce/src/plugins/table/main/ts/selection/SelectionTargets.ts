/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Selections } from '@ephox/darwin';
import { Arr, Cell, Optional, Thunk } from '@ephox/katamari';
import { RunOperation, Structs, TableLookup, Warehouse } from '@ephox/snooker';
import { SugarElement, SugarNode } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';
import * as Util from '../core/Util';
import * as TableTargets from '../queries/TableTargets';
import * as TableSelection from './TableSelection';

type UiApi = Menu.MenuItemInstanceApi | Toolbar.ToolbarButtonInstanceApi;

/*
onAny - disable if any column in the selection is locked
onFirst - disable if the first column in the table is selected and is locked
onLast - disable if the the last column in the table is selected and is locked
*/
export const enum LockedDisable {
  onAny = 'onAny',
  onFirst = 'onFirst',
  onLast = 'onLast'
}
type LockedDisableStrs = keyof typeof LockedDisable;

export interface SelectionTargets {
  readonly onSetupTable: (api: UiApi) => () => void;
  readonly onSetupCellOrRow: (api: UiApi) => () => void;
  readonly onSetupColumn: (lockedDisable: LockedDisable) => (api: UiApi) => () => void;
  readonly onSetupPasteable: (getClipboardData: () => Optional<SugarElement[]>) => (api: UiApi) => () => void;
  readonly onSetupPasteableColumn: (getClipboardData: () => Optional<SugarElement[]>, lockedDisable: LockedDisable) => (api: UiApi) => () => void;
  readonly onSetupMergeable: (api: UiApi) => () => void;
  readonly onSetupUnmergeable: (api: UiApi) => () => void;
  readonly resetTargets: () => void;
  readonly targets: () => Optional<RunOperation.CombinedTargets>;
}

interface ExtractedSelectionDetails {
  readonly mergeable: boolean;
  readonly unmergeable: boolean;
  readonly locked: Record<LockedDisableStrs, boolean>;
}

export const getSelectionTargets = (editor: Editor, selections: Selections): SelectionTargets => {
  const targets = Cell<Optional<RunOperation.CombinedTargets>>(Optional.none());
  const changeHandlers = Cell([]);
  let selectionDetails = Optional.none<ExtractedSelectionDetails>();

  const isCaption = SugarNode.isTag('caption');
  const isDisabledForSelection = (key: keyof ExtractedSelectionDetails) => selectionDetails.forall((details) => !details[key]);

  const findTargets = (): Optional<RunOperation.CombinedTargets> => TableSelection.getSelectionStartCellOrCaption(Util.getSelectionStart(editor), Util.getIsRoot(editor))
    .bind((cellOrCaption) => {
      const table = TableLookup.table(cellOrCaption);
      return table.map((table) => {
        if (isCaption(cellOrCaption)) {
          return TableTargets.noMenu(cellOrCaption);
        } else {
          return TableTargets.forMenu(selections, table, cellOrCaption);
        }
      });
    });

  const getExtractedDetails = (targets: RunOperation.CombinedTargets): Optional<ExtractedSelectionDetails> => {
    const tableOpt = TableLookup.table(targets.element);
    return tableOpt.map((table) => {
      const warehouse = Warehouse.fromTable(table);
      const selectedCells = RunOperation.onCells(warehouse, targets).getOr([] as Structs.DetailExt[]);

      const locked = Arr.foldl(selectedCells, (acc, cell) => {
        if (cell.isLocked) {
          acc.onAny = true;
          if (cell.column === 0) {
            acc.onFirst = true;
          } else if (cell.column + cell.colspan >= warehouse.grid.columns) {
            acc.onLast = true;
          }
        }
        return acc;
      }, { onAny: false, onFirst: false, onLast: false });

      return {
        mergeable: RunOperation.onUnlockedMergable(warehouse, targets).isSome(),
        unmergeable: RunOperation.onUnlockedUnmergable(warehouse, targets).isSome(),
        locked
      };
    });
  };

  const resetTargets = () => {
    // Reset the targets
    targets.set(Thunk.cached(findTargets)());

    // Reset the selection details
    selectionDetails = targets.get().bind(getExtractedDetails);

    // Trigger change handlers
    Arr.each(changeHandlers.get(), (handler) => handler());
  };

  const onSetup = (api: UiApi, isDisabled: (targets: RunOperation.CombinedTargets) => boolean) => {
    const handler = () => targets.get().fold(() => {
      api.setDisabled(true);
    }, (targets) => {
      api.setDisabled(isDisabled(targets));
    });

    // Execute the handler to set the initial state
    handler();

    // Register the handler so we can update the state when resetting targets
    changeHandlers.set(changeHandlers.get().concat([ handler ]));

    return () => {
      changeHandlers.set(Arr.filter(changeHandlers.get(), (h) => h !== handler));
    };
  };

  const isDisabledFromLocked = (lockedDisable: LockedDisable) =>
    selectionDetails.exists((details) => details.locked[lockedDisable]);

  const onSetupTable = (api: UiApi) => onSetup(api, (_) => false);
  const onSetupCellOrRow = (api: UiApi) => onSetup(api, (targets) => isCaption(targets.element));
  const onSetupColumn = (lockedDisable: LockedDisable) => (api: UiApi) => onSetup(api, (targets) => isCaption(targets.element) || isDisabledFromLocked(lockedDisable));
  const onSetupPasteable = (getClipboardData: () => Optional<SugarElement[]>) => (api: UiApi) =>
    onSetup(api, (targets) => isCaption(targets.element) || getClipboardData().isNone());
  const onSetupPasteableColumn = (getClipboardData: () => Optional<SugarElement[]>, lockedDisable: LockedDisable) => (api: UiApi) =>
    onSetup(api, (targets) => isCaption(targets.element) || getClipboardData().isNone() || isDisabledFromLocked(lockedDisable));
  const onSetupMergeable = (api: UiApi) => onSetup(api, (_targets) => isDisabledForSelection('mergeable'));
  const onSetupUnmergeable = (api: UiApi) => onSetup(api, (_targets) => isDisabledForSelection('unmergeable'));

  editor.on('NodeChange ExecCommand TableSelectorChange', resetTargets);

  return {
    onSetupTable,
    onSetupCellOrRow,
    onSetupColumn,
    onSetupPasteable,
    onSetupPasteableColumn,
    onSetupMergeable,
    onSetupUnmergeable,
    resetTargets,
    targets: () => targets.get()
  };
};
