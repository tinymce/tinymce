import { Arr, Fun, Optional } from '@ephox/katamari';
import { RunOperation, Structs } from '@ephox/snooker';
import { Attribute, SugarElement } from '@ephox/sugar';
import { Ephemera } from '../api/Ephemera';
import * as TableSelection from '../api/TableSelection';
import { Selections } from '../selection/Selections';
import * as SelectionTypes from '../selection/SelectionTypes';

// Return an array of the selected elements
const selection = (selections: Selections): SugarElement[] =>
  SelectionTypes.cata(selections.get(),
    Fun.constant([]),
    Fun.identity,
    Arr.pure
  );

const unmergable = (selections: Selections): Optional<SugarElement[]> => {
  const hasSpan = (elem: SugarElement<Element>, type: 'colspan' | 'rowspan') => Attribute.getOpt(elem, type).exists((span) => parseInt(span, 10) > 1);
  const hasRowOrColSpan = (elem: SugarElement<Element>) => hasSpan(elem, 'rowspan') || hasSpan(elem, 'colspan');

  const candidates = selection(selections);

  return candidates.length > 0 && Arr.forall(candidates, hasRowOrColSpan) ? Optional.some(candidates) : Optional.none();
};

const mergable = (table: SugarElement<HTMLTableElement>, selections: Selections, ephemera: Ephemera): Optional<RunOperation.ExtractMergable> =>
  SelectionTypes.cata<Optional<RunOperation.ExtractMergable>>(selections.get(),
    Optional.none,
    (cells: SugarElement<Element>[]) => {
      if (cells.length <= 1) {
        return Optional.none();
      } else {
        return TableSelection.retrieveBox(table, ephemera.firstSelectedSelector, ephemera.lastSelectedSelector)
          .map((bounds: Structs.Bounds) => ({ bounds, cells }));
      }
    },
    Optional.none
  );

export { mergable, unmergable, selection };

