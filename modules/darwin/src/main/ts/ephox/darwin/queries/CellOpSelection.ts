import { Arr, Fun, Optional } from '@ephox/katamari';
import { RunOperation } from '@ephox/snooker';
import { Attribute, SugarElement } from '@ephox/sugar';

import { Ephemera } from '../api/Ephemera';
import * as TableSelection from '../api/TableSelection';

const selection: (selectedCells: SugarElement<HTMLTableCellElement>[]) => SugarElement<HTMLTableCellElement>[] = Fun.identity;

const unmergable = (selectedCells: SugarElement<HTMLTableCellElement>[]): Optional<SugarElement<HTMLTableCellElement>[]> => {
  const hasSpan = (elem: SugarElement<Element>, type: 'colspan' | 'rowspan') => Attribute.getOpt(elem, type).exists((span) => parseInt(span, 10) > 1);
  const hasRowOrColSpan = (elem: SugarElement<Element>) => hasSpan(elem, 'rowspan') || hasSpan(elem, 'colspan');

  return selectedCells.length > 0 && Arr.forall(selectedCells, hasRowOrColSpan) ? Optional.some(selectedCells) : Optional.none();
};

const mergable = (table: SugarElement<HTMLTableElement>, selectedCells: SugarElement<HTMLTableCellElement>[], ephemera: Ephemera): Optional<RunOperation.ExtractMergable> => {
  if (selectedCells.length <= 1) {
    return Optional.none();
  } else {
    return TableSelection.retrieveBox(table, ephemera.firstSelectedSelector, ephemera.lastSelectedSelector)
      .map((bounds) => ({ bounds, cells: selectedCells }));
  }
};

export { mergable, unmergable, selection };

