/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Selections } from '@ephox/darwin';
import { Arr, Cell, Fun, Optional, Thunk, Type } from '@ephox/katamari';
import { RunOperation, Structs, TableLookup, Warehouse } from '@ephox/snooker';
import { SelectorFind, SugarElement, SugarNode } from '@ephox/sugar';
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
  readonly onSetupTableWithCaption: (api: Toolbar.ToolbarToggleButtonInstanceApi) => () => void;
  readonly onSetupTableHeaders: (rows: boolean) => (api: Toolbar.ToolbarToggleButtonInstanceApi) => () => void;
}

interface ExtractedSelectionDetails {
  readonly mergeable: boolean;
  readonly unmergeable: boolean;
  readonly locked: Record<LockedDisableStrs, boolean>;
}

const isElementHeader = (cell: SugarElement<HTMLTableCellElement>) => {
  if (cell.dom.nodeName.toLowerCase() === 'th') {
    return true;
  } else {
    const theadOpt = SelectorFind.ancestor(cell, 'thead');

    return theadOpt.isSome();
  }
};

export const isEntireColumnsHeaders = (editor: Editor, selections: Selections) => {
  const startCellOpt = TableSelection.getSelectionStartCell(Util.getSelectionStart(editor));

  const allHeadersOpt = startCellOpt.map((startCell) => {
    const potentialTable = TableLookup.table(startCell, Util.getIsRoot(editor));

    const tableOpt = potentialTable.filter(Fun.not(Util.getIsRoot(editor)));

    const allAreHeadersOpt = tableOpt.map((table) => {
      const warehouse = Warehouse.fromTable(table);
      const targets = TableTargets.forMenu(selections, table, startCell);

      const usedColumns: number[] = [];
      Arr.each(warehouse.all, (row) => {
        Arr.each(row.cells, (cell) => {
          const existsInSelection = Arr.exists(targets.selection, (element) => {
            return element.dom === cell.element.dom;
          });

          if (existsInSelection && !Arr.contains(usedColumns, cell.column)) {
            usedColumns.push(cell.column);
          }
        });
      });

      return Arr.forall(usedColumns, (value) => {
        return Arr.forall(warehouse.all, (row) => {
          const columnCell = Arr.find(row.cells, (cell) => {
            return cell.column === value;
          });

          return columnCell.map((cell) => {
            return isElementHeader(cell.element);
          }).getOr(true);
        });
      });
    });

    return allAreHeadersOpt.getOr(false);
  });

  return allHeadersOpt.getOr(false);
};

export const isEntireRowsHeaders = (editor: Editor, selections: Selections) => {
  const startCellOpt = TableSelection.getSelectionStartCell(Util.getSelectionStart(editor));

  const allHeadersOpt = startCellOpt.map((startCell) => {
    const potentialTable = TableLookup.table(startCell, Util.getIsRoot(editor));

    const tableOpt = potentialTable.filter(Fun.not(Util.getIsRoot(editor)));

    const allAreHeadersOpt = tableOpt.map((table) => {
      const warehouse = Warehouse.fromTable(table);
      const targets = TableTargets.forMenu(selections, table, startCell);

      const usedRows: number[] = [];
      Arr.each(warehouse.all, (row) => {
        Arr.each(row.cells, (cell) => {
          const existsInSelection = Arr.exists(targets.selection, (element) => {
            return element.dom === cell.element.dom;
          });

          if (existsInSelection && !Arr.contains(usedRows, cell.column)) {
            usedRows.push(cell.row);
          }
        });
      });

      return Arr.forall(usedRows, (rowIndex) => {
        return Arr.forall(warehouse.all[rowIndex].cells, (cell) => {
          return isElementHeader(cell.element);
        });
      });
    });

    return allAreHeadersOpt.getOr(false);
  });

  return allHeadersOpt.getOr(false);
};

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

  const onSetupWithToggle = (api: Toolbar.ToolbarToggleButtonInstanceApi, isDisabled: (targets: RunOperation.CombinedTargets) => boolean, isActive: (targets: RunOperation.CombinedTargets) => boolean) => {
    const handler = () => targets.get().fold(() => {
      api.setDisabled(true);
      api.setActive(false);
    }, (targets) => {
      api.setDisabled(isDisabled(targets));
      api.setActive(isActive(targets));
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

  const onSetupTable = (api: UiApi) => onSetup(api, Fun.never);
  const onSetupCellOrRow = (api: UiApi) => onSetup(api, (targets) => isCaption(targets.element));
  const onSetupColumn = (lockedDisable: LockedDisable) => (api: UiApi) => onSetup(api, (targets) => isCaption(targets.element) || isDisabledFromLocked(lockedDisable));

  const onSetupTableHeaders = (rows: boolean) => {
    return (api: Toolbar.ToolbarToggleButtonInstanceApi): () => void => {
      return onSetupWithToggle(
        api,
        (targets) => {
          return isCaption(targets.element);
        },
        () => {
          if (rows) {
            return isEntireRowsHeaders(editor, selections);
          } else {
            return isEntireColumnsHeaders(editor, selections);
          }
        }
      );
    };
  };

  const onSetupPasteable = (getClipboardData: () => Optional<SugarElement[]>) => (api: UiApi) =>
    onSetup(api, (targets) => isCaption(targets.element) || getClipboardData().isNone());
  const onSetupPasteableColumn = (getClipboardData: () => Optional<SugarElement[]>, lockedDisable: LockedDisable) => (api: UiApi) =>
    onSetup(api, (targets) => isCaption(targets.element) || getClipboardData().isNone() || isDisabledFromLocked(lockedDisable));
  const onSetupMergeable = (api: UiApi) => onSetup(api, (_targets) => isDisabledForSelection('mergeable'));
  const onSetupUnmergeable = (api: UiApi) => onSetup(api, (_targets) => isDisabledForSelection('unmergeable'));
  const onSetupTableWithCaption = (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
    return onSetupWithToggle(api, Fun.never, (targets) => {
      const potentialTables = TableLookup.table(targets.element, Util.getIsRoot(editor));
      const tableOpt = potentialTables.filter(Fun.not(Util.getIsRoot(editor)));

      return tableOpt.map((table) => {
        const captionElm = editor.dom.select('caption', table.dom)[0];
        return Type.isNonNullable(captionElm);
      }).getOr(false);
    });
  };

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
    targets: () => targets.get(),
    onSetupTableHeaders,
    onSetupTableWithCaption
  };
};
