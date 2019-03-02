import { Arr, Cell, Fun, Option, Thunk } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { Element, Node } from '@ephox/sugar';
import { Editor } from 'tinymce/core/api/Editor';
import TableTargets from '../queries/TableTargets';
import { Selections } from './Selections';
import * as TableSelection from './TableSelection';

interface Targets {
  element: () => Element;
  mergable: () => Option<any>;
  unmergable: () => Option<any>;
  selection: () => Element[];
}

export interface SelectionTargets {
  onSetupTable: (api) => () => void;
  onSetupCellOrRow: (api) => () => void;
  onSetupMergeable: (api) => () => void;
  onSetupUnmergeable: (api) => () => void;
  resetTargets: () => void;
  targets: () => Option<Targets>;
}

export const SelectionTargets = (editor: Editor, selections: Selections): SelectionTargets => {
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

  const onSetup = (activeCallback: (api, targets: Targets) => void, api) => {
    const handler = () => targets.get().fold(() => {
      api.setDisabled(true);
    }, (targets) => {
      activeCallback(api, targets);
    });

    // Execute the handler to set the initial state
    handler();

    // Register the handler so we can update the state when resetting targets
    changeHandlers.set(changeHandlers.get().concat([handler]));

    return () => {
      changeHandlers.set(Arr.filter(changeHandlers.get(), (h) => h !== handler));
    };
  };

  const onSetupTable = Fun.curry(onSetup, (api) => api.setDisabled(false));
  const onSetupCellOrRow = Fun.curry(onSetup, (api, targets) => api.setDisabled(Node.name(targets.element()) === 'caption'));
  const onSetupMergeable = Fun.curry(onSetup, (api, targets) => api.setDisabled(targets.mergable().isNone()));
  const onSetupUnmergeable = Fun.curry(onSetup, (api, targets) => api.setDisabled(targets.unmergable().isNone()));

  editor.on('nodechange', resetTargets);

  return {
    onSetupTable,
    onSetupCellOrRow,
    onSetupMergeable,
    onSetupUnmergeable,
    resetTargets,
    targets: () => targets.get()
  };
};