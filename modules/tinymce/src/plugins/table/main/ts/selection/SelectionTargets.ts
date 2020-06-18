import { HTMLTableCaptionElement, HTMLTableCellElement } from '@ephox/dom-globals';
import { Arr, Cell, Option, Thunk } from '@ephox/katamari';
import { RunOperation, TableLookup } from '@ephox/snooker';
import { Element, Node } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as TableTargets from '../queries/TableTargets';
import { Selections } from './Selections';
import * as TableSelection from './TableSelection';

export type SelectionTargets = ReturnType<typeof getSelectionTargets>;

export const getSelectionTargets = (editor: Editor, selections: Selections) => {
  const targets = Cell<Option<RunOperation.CombinedTargets>>(Option.none());
  const changeHandlers = Cell([]);

  const findTargets = (): Option<RunOperation.CombinedTargets> => TableSelection.getSelectionStartCellOrCaption(editor).bind((cellOrCaption) => {
    const table = TableLookup.table(cellOrCaption);
    const isCaption = (elem: Element<HTMLTableCaptionElement | HTMLTableCellElement>): elem is Element<HTMLTableCaptionElement> => Node.name(elem) === 'caption';
    return table.map((table) => {
      if (isCaption(cellOrCaption)) {
        return TableTargets.noMenu(cellOrCaption);
      } else {
        return TableTargets.forMenu(selections, table, cellOrCaption);
      }
    });
  });

  const resetTargets = () => {
    // Reset the targets
    targets.set(Thunk.cached(findTargets)());

    // Trigger change handlers
    Arr.each(changeHandlers.get(), (handler) => handler());
  };

  const onSetup = (api, isDisabled: (targets: RunOperation.CombinedTargets) => boolean) => {
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

  const onSetupTable = (api) => onSetup(api, (_) => false);
  const onSetupCellOrRow = (api) => onSetup(api, (targets) => Node.name(targets.element()) === 'caption');
  const onSetupPasteable = (getClipboardData: () => Option<Element[]>) => (api) => onSetup(api, (targets) =>
    Node.name(targets.element()) === 'caption' || getClipboardData().isNone()
  );
  const onSetupMergeable = (api) => onSetup(api, (targets) => targets.mergable().isNone());
  const onSetupUnmergeable = (api) => onSetup(api, (targets) => targets.unmergable().isNone());

  editor.on('NodeChange ExecCommand TableSelectorChange', resetTargets);

  return {
    onSetupTable,
    onSetupCellOrRow,
    onSetupPasteable,
    onSetupMergeable,
    onSetupUnmergeable,
    resetTargets,
    targets: () => targets.get()
  };
};
