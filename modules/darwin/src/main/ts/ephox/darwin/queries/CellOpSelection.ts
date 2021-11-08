import { Arr, Optional } from '@ephox/katamari';
import { RunOperation } from '@ephox/snooker';
import { Attribute, SugarElement } from '@ephox/sugar';

import { Ephemera } from '../api/Ephemera';
import * as TableSelection from '../api/TableSelection';
// import { Selections } from '../selection/Selections';
// import * as SelectionTypes from '../selection/SelectionTypes';

interface PatchedSelections {
  readonly get: () => SugarElement<HTMLTableCellElement>[];
}

// Return an array of the selected elements
// TODO: Could probably remove this if new selection just rerturns an array
// const selection = (selections: PatchedSelections): SugarElement<HTMLTableCellElement>[] =>
//   SelectionTypes.cata(selections.get(),
//     Fun.constant([]),
//     Fun.identity,
//     Arr.pure
//   );

const selection = (selections: PatchedSelections): SugarElement<HTMLTableCellElement>[] =>
  selections.get();

const unmergable = (selections: PatchedSelections): Optional<SugarElement<HTMLTableCellElement>[]> => {
  const hasSpan = (elem: SugarElement<Element>, type: 'colspan' | 'rowspan') => Attribute.getOpt(elem, type).exists((span) => parseInt(span, 10) > 1);
  const hasRowOrColSpan = (elem: SugarElement<Element>) => hasSpan(elem, 'rowspan') || hasSpan(elem, 'colspan');

  const candidates = selection(selections);

  return candidates.length > 0 && Arr.forall(candidates, hasRowOrColSpan) ? Optional.some(candidates) : Optional.none();
};

// const mergable = (table: SugarElement<HTMLTableElement>, selections: PatchedSelections, ephemera: Ephemera): Optional<RunOperation.ExtractMergable> =>
//   SelectionTypes.cata<Optional<RunOperation.ExtractMergable>>(selections.get(),
//     Optional.none,
//     (cells) => {
//       if (cells.length <= 1) {
//         return Optional.none();
//       } else {
//         return TableSelection.retrieveBox(table, ephemera.firstSelectedSelector, ephemera.lastSelectedSelector)
//           .map((bounds) => ({ bounds, cells }));
//       }
//     },
//     Optional.none
//   );

const mergable = (table: SugarElement<HTMLTableElement>, selections: PatchedSelections, ephemera: Ephemera): Optional<RunOperation.ExtractMergable> => {
  const cells = selections.get();

  if (cells.length <= 1) {
    return Optional.none();
  } else {
    return TableSelection.retrieveBox(table, ephemera.firstSelectedSelector, ephemera.lastSelectedSelector)
      .map((bounds) => ({ bounds, cells }));
  }
};

export { mergable, unmergable, selection };

