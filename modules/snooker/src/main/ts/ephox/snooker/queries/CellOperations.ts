import { TableSelection } from '@ephox/darwin';
import { Element as DomElement, HTMLTableElement } from '@ephox/dom-globals';
import { Arr, Fun, Option } from '@ephox/katamari';
import { Attr, Element } from '@ephox/sugar';
import * as Structs from '../api/Structs';
import { Selections } from '../selection/Selections';
import { SelectionTypes } from '../selection/SelectionTypes';

export interface Mergable {
  bounds: () => Structs.Bounds;
  cells: () => Element<DomElement>[];
}

// Return an array of the selected elements
const selection = (selections: Selections): Element[] =>
  SelectionTypes.cata(selections.get(),
    Fun.constant([]),
    Fun.identity,
    Fun.identity
  );

const unmergable = (selections: Selections): Option<Element[]> => {
  const hasSpan = (elem: Element<DomElement>) => (Attr.has(elem, 'rowspan') && parseInt(Attr.get(elem, 'rowspan') as string, 10) > 1) ||
    (Attr.has(elem, 'colspan') && parseInt(Attr.get(elem, 'colspan') as string, 10) > 1);

  const candidates = selection(selections);

  return candidates.length > 0 && Arr.forall(candidates, hasSpan) ? Option.some(candidates) : Option.none();
};

const mergable = (table: Element<HTMLTableElement>, selections: Selections, firstSelectedSelector: string, lastSelectedSelector: string): Option<Mergable> =>
  SelectionTypes.cata<Option<Mergable>>(selections.get(),
    Option.none,
    (cells) => {
      if (cells.length === 0) {
        return Option.none();
      }
      return TableSelection.retrieveBox(table, firstSelectedSelector, lastSelectedSelector).bind((bounds: Structs.Bounds) =>
        cells.length > 1 ? Option.some({
          bounds: Fun.constant(bounds),
          cells: Fun.constant(cells)
        }) : Option.none<Mergable>());
    },
    Option.none
  );

export { mergable, unmergable, selection };
