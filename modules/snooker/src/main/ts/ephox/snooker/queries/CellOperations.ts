import { TableSelection } from '@ephox/darwin';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { Attribute, SugarElement } from '@ephox/sugar';
import * as Structs from '../api/Structs';
import { Selections } from '../selection/Selections';
import SelectionTypes from '../selection/SelectionTypes';

export interface Mergable {
  bounds: () => Structs.Bounds;
  cells: () => SugarElement<Element>[];
}

// Return an array of the selected elements
const selection = (selections: Selections): SugarElement[] =>
  SelectionTypes.cata(selections.get(),
    Fun.constant([]),
    Fun.identity,
    Fun.identity
  );

const unmergable = (selections: Selections): Optional<SugarElement[]> => {
  const hasSpan = (elem: SugarElement<Element>) => (Attribute.has(elem, 'rowspan') && parseInt(Attribute.get(elem, 'rowspan') as string, 10) > 1) ||
    (Attribute.has(elem, 'colspan') && parseInt(Attribute.get(elem, 'colspan') as string, 10) > 1);

  const candidates = selection(selections);

  return candidates.length > 0 && Arr.forall(candidates, hasSpan) ? Optional.some(candidates) : Optional.none();
};

const mergable = (table: SugarElement<HTMLTableElement>, selections: Selections, firstSelectedSelector: string, lastSelectedSelector: string): Optional<Mergable> =>
  SelectionTypes.cata<Optional<Mergable>>(selections.get(),
    Optional.none,
    (cells) => {
      if (cells.length === 0) {
        return Optional.none();
      }
      return TableSelection.retrieveBox(table, firstSelectedSelector, lastSelectedSelector).bind((bounds: Structs.Bounds) =>
        cells.length > 1 ? Optional.some({
          bounds: Fun.constant(bounds),
          cells: Fun.constant(cells)
        }) : Optional.none<Mergable>());
    },
    Optional.none
  );

export { mergable, unmergable, selection };