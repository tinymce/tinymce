import { Arr, Cell, Option, Thunk } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { Element, Node } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import TableTargets from '../queries/TableTargets';
import { Selections } from './Selections';
import * as TableSelection from './TableSelection';

export interface Targets {
  element: () => Element;
  mergable: () => Option<any>;
  unmergable: () => Option<any>;
  selection: () => Element[];
}

export type SelectionTargets = ReturnType<typeof getSelectionTargets>;

export const getSelectionTargets = (editor: Editor, selections: Selections) => {
  const targets = Cell<Option<Targets>>(Option.none());
  const changeHandlers = Cell([]);

  const findTargets = (): Option<Targets> => {
    return TableSelection.getSelectionStartCellOrCaption(editor).bind((cellOrCaption) => {
      const table = TableLookup.table(cellOrCaption);
      return table.map((table) => {
        if (Node.name(cellOrCaption) === 'caption') {
          return TableTargets.notCell(cellOrCaption);
        } else {
          return TableTargets.forMenu(selections, table, cellOrCaption);
        }
      });
    });
  };

  const resetTargets = () => {
    // Reset the targets
    targets.set(Thunk.cached(findTargets)());

    // Trigger change handlers
    Arr.each(changeHandlers.get(), (handler) => handler());
  };

  const onSetup = (api, isDisabled: (targets: Targets) => boolean) => {
    const handler = () => targets.get().fold(() => {
      api.setDisabled(true);
    }, (targets) => {
      api.setDisabled(isDisabled(targets));
    });

    // Execute the handler to set the initial state
    handler();

    // Register the handler so we can update the state when resetting targets
    changeHandlers.set(changeHandlers.get().concat([handler]));

    return () => {
      changeHandlers.set(Arr.filter(changeHandlers.get(), (h) => h !== handler));
    };
  };

  const onSetupTable = (api) => onSetup(api, (_) => false);
  const onSetupCellOrRow = (api) => onSetup(api, (targets) => Node.name(targets.element()) === 'caption');
  const onSetupMergeable = (api) => onSetup(api, (targets) => targets.mergable().isNone());
  const onSetupUnmergeable = (api) => onSetup(api, (targets) => targets.unmergable().isNone());

  editor.on('NodeChange', resetTargets);

  return {
    onSetupTable,
    onSetupCellOrRow,
    onSetupMergeable,
    onSetupUnmergeable,
    resetTargets,
    targets: () => targets.get()
  };
};