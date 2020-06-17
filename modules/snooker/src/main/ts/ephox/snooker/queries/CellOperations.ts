import { TableSelection } from '@ephox/darwin';
import { Element as DomElement, HTMLTableCellElement, HTMLTableElement } from '@ephox/dom-globals';
import { Arr, Fun, Option } from '@ephox/katamari';
import { Structs } from '@ephox/snooker';
import { Attr, Element } from '@ephox/sugar';
import { Selections } from '../selection/Selections';
import { SelectionTypes } from '../selection/SelectionTypes';

export interface Mergable {
  bounds: () => Structs.Bounds;
  cells: () => Element<DomElement>[];
}

// Return an array of the selected elements
const selection = function (cell: Element<HTMLTableCellElement>, selections: Selections): Element[] {
  return SelectionTypes.cata(selections.get(),
    Fun.constant([]),
    Fun.identity,
    Fun.constant([ cell ])
  );
};

const unmergable = function (cell: Element<HTMLTableCellElement>, selections: Selections): Option<Element[]> {
  const hasSpan = function (elem: Element<DomElement>) {
    return (Attr.has(elem, 'rowspan') && parseInt(Attr.get(elem, 'rowspan') as string, 10) > 1) ||
           (Attr.has(elem, 'colspan') && parseInt(Attr.get(elem, 'colspan') as string, 10) > 1);
  };

  const candidates = selection(cell, selections);

  return candidates.length > 0 && Arr.forall(candidates, hasSpan) ? Option.some(candidates) : Option.none();
};

const mergable = function (table: Element<HTMLTableElement>, selections: Selections, firstSelectedSelector: string, lastSelectedSelector: string): Option<Mergable> {
  return SelectionTypes.cata<Option<Mergable>>(selections.get(),
    Option.none,
    (cells) => {
      if (cells.length === 0) {
        return Option.none();
      }
      return TableSelection.retrieveBox(table, firstSelectedSelector, lastSelectedSelector).bind(function (bounds) {
        return cells.length > 1 ? Option.some({
          bounds: Fun.constant(bounds),
          cells: Fun.constant(cells)
        }) : Option.none<Mergable>();
      });
    },
    Option.none
  );
};

export default {
  mergable,
  unmergable,
  selection
};