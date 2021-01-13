import { Menu, Toolbar } from '@ephox/bridge';
import { Selections } from '@ephox/darwin';
import { Arr, Cell, Optional, Thunk } from '@ephox/katamari';
import { RunOperation, TableLookup, Warehouse } from '@ephox/snooker';
import { SugarElement, SugarNode } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as Util from '../core/Util';
import * as TableTargets from '../queries/TableTargets';
import * as TableSelection from './TableSelection';

export interface SelectionTargets {
  readonly onSetupTable: (api: UiApi) => () => void;
  readonly onSetupCellOrRow: (api: UiApi) => () => void;
  readonly onSetupColumn: (api: UiApi) => () => void;
  readonly onSetupPasteable: (getClipboardData: () => Optional<SugarElement[]>, rowOrCol: 'row' | 'column') => (api: UiApi) => () => void;
  readonly onSetupMergeable: (api: UiApi) => () => void;
  readonly onSetupUnmergeable: (api: UiApi) => () => void;
  readonly resetTargets: () => void;
  readonly targets: () => Optional<RunOperation.CombinedTargets>;
}

interface ExtractedSelectionDetatils {
  readonly mergeable: boolean;
  readonly unmergeable: boolean;
  readonly unlockedSelection: boolean;
}

type UiApi = Menu.MenuItemInstanceApi | Toolbar.ToolbarButtonInstanceApi;

export const getSelectionTargets = (editor: Editor, selections: Selections): SelectionTargets => {
  const targets = Cell<Optional<RunOperation.CombinedTargets>>(Optional.none());
  const changeHandlers = Cell([]);
  let selectionDetails = Optional.none<ExtractedSelectionDetatils>();

  const isCaption = (elem: SugarElement<HTMLTableCaptionElement | HTMLTableCellElement>): elem is SugarElement<HTMLTableCaptionElement> => SugarNode.name(elem) === 'caption';
  const isDisabledForSelection = (key: keyof ExtractedSelectionDetatils) => selectionDetails.forall((details) => !details[key]);

  const findTargets = (): Optional<RunOperation.CombinedTargets> => TableSelection.getSelectionStartCellOrCaption(Util.getSelectionStart(editor))
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

  const getExtractedDetails = (targets: RunOperation.CombinedTargets): Optional<ExtractedSelectionDetatils> => {
    const tableOpt = TableLookup.table(targets.element);
    return tableOpt.map((table) => {
      const warehouse = Warehouse.fromTable(table);
      const selectedCells = RunOperation.onCells(warehouse, targets).getOr([]);
      return {
        mergeable: RunOperation.onUnlockedMergable(warehouse, targets).isSome(),
        unmergeable: RunOperation.onUnlockedUnmergable(warehouse, targets).isSome(),
        // Can't use onUnlockedCells as it will be Optional.some if both unlocked and locked columns are selected
        unlockedSelection: Arr.forall(selectedCells, (cell) => !cell.isLocked)
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

  const onSetupTable = (api: UiApi) => onSetup(api, (_) => false);
  const onSetupCellOrRow = (api: UiApi) => onSetup(api, (targets) => isCaption(targets.element));
  const onSetupColumn = (api: UiApi) => onSetup(api, (targets) => isCaption(targets.element) || isDisabledForSelection('unlockedSelection'));
  const onSetupPasteable = (getClipboardData: () => Optional<SugarElement[]>, rowOrCol: 'row' | 'column') => (api: UiApi) => onSetup(api, (targets) =>
    isCaption(targets.element) || getClipboardData().isNone() || (rowOrCol === 'column' && isDisabledForSelection('unlockedSelection'))
  );
  // TODO: Ideally mergeable and unmergable would be Optional.none if selection is in locked columns
  const onSetupMergeable = (api: UiApi) => onSetup(api, (_targets) => isDisabledForSelection('mergeable'));
  const onSetupUnmergeable = (api: UiApi) => onSetup(api, (_targets) => isDisabledForSelection('unmergeable'));

  editor.on('NodeChange ExecCommand TableSelectorChange', resetTargets);

  return {
    onSetupTable,
    onSetupCellOrRow,
    onSetupColumn,
    onSetupPasteable,
    onSetupMergeable,
    onSetupUnmergeable,
    resetTargets,
    targets: () => targets.get()
  };
};
