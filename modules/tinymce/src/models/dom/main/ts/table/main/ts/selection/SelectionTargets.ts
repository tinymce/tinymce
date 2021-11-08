/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

// import { Selections } from '@ephox/darwin';
import { Arr, Cell, Optional, Optionals, Thunk } from '@ephox/katamari';
import { RunOperation, Structs, TableLookup, Warehouse } from '@ephox/snooker';
import { Compare, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';

import * as Util from '../core/Util';
import * as TableTargets from '../queries/TableTargets';
import { PatchedSelections } from '../Table';
import * as TableSelection from './TableSelection';

type UiApi = Menu.MenuItemInstanceApi | Toolbar.ToolbarButtonInstanceApi;
type UiToggleApi = Menu.ToggleMenuItemInstanceApi | Toolbar.ToolbarToggleButtonInstanceApi;

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
  readonly onSetup: (api: UiApi, isDisabled: TargetSetupCallback) => () => void;
  readonly onSetupWithToggle: (api: UiToggleApi, isDisabled: TargetSetupCallback, isActive: TargetSetupCallback) => () => void;
  readonly resetTargets: () => void;
  readonly selectionDetails: () => Optional<ExtractedSelectionDetails>;
  readonly targets: () => Optional<RunOperation.CombinedTargets>;
}

interface ExtractedSelectionDetails {
  readonly mergeable: boolean;
  readonly unmergeable: boolean;
  readonly locked: Record<LockedDisableStrs, boolean>;
}

type TargetSetupCallback = (targets: RunOperation.CombinedTargets) => boolean;

export const getSelectionTargets = (editor: Editor, selections: PatchedSelections): SelectionTargets => {
  const targets = Cell<Optional<RunOperation.CombinedTargets>>(Optional.none());
  const changeHandlers = Cell([]);
  // let selectionDetails = Optional.none<ExtractedSelectionDetails>();
  const selectionDetails = Cell<Optional<ExtractedSelectionDetails>>(Optional.none());

  const isCaption = SugarNode.isTag('caption');
  // const isDisabledForSelection = (key: keyof ExtractedSelectionDetails) => selectionDetails.forall((details) => !details[key]);
  const getStart = () => TableSelection.getSelectionCellOrCaption(Util.getSelectionStart(editor), Util.getIsRoot(editor));
  const getEnd = () => TableSelection.getSelectionCellOrCaption(Util.getSelectionEnd(editor), Util.getIsRoot(editor));

  const findTargets = (): Optional<RunOperation.CombinedTargets> =>
    getStart().bind((startCellOrCaption) =>
      Optionals.flatten(
        Optionals.lift2(TableLookup.table(startCellOrCaption), getEnd().bind(TableLookup.table), (startTable, endTable) => {
          if (Compare.eq(startTable, endTable)) {
            if (isCaption(startCellOrCaption)) {
              return Optional.some(TableTargets.noMenu(startCellOrCaption));
            } else {
              return Optional.some(TableTargets.forMenu(selections, startTable, startCellOrCaption));
            }
          }

          return Optional.none();
        })
      )
    );

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
    // selectionDetails =  targets.get().bind(getExtractedDetails);
    selectionDetails.set(targets.get().bind(getExtractedDetails));

    // Trigger change handlers
    Arr.each(changeHandlers.get(), (handler) => handler());
  };

  const setupHandler = (handler: () => void) => {
    // Execute the handler to set the initial state
    handler();

    // Register the handler so we can update the state when resetting targets
    changeHandlers.set(changeHandlers.get().concat([ handler ]));

    return () => {
      changeHandlers.set(Arr.filter(changeHandlers.get(), (h) => h !== handler));
    };
  };

  const onSetup = (api: UiApi, isDisabled: TargetSetupCallback) =>
    setupHandler(() =>
      targets.get().fold(() => {
        api.setDisabled(true);
      }, (targets) => {
        api.setDisabled(isDisabled(targets));
      })
    );

  const onSetupWithToggle = (api: UiToggleApi, isDisabled: TargetSetupCallback, isActive: TargetSetupCallback) =>
    setupHandler(() =>
      targets.get().fold(() => {
        api.setDisabled(true);
        api.setActive(false);
      }, (targets) => {
        api.setDisabled(isDisabled(targets));
        api.setActive(isActive(targets));
      })
    );

  editor.on('NodeChange ExecCommand TableSelectorChange', resetTargets);

  return {
    onSetup,
    onSetupWithToggle,
    resetTargets,
    selectionDetails: selectionDetails.get,
    targets: targets.get
  };
};
