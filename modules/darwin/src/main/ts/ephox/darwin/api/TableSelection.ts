import { Optional } from '@ephox/katamari';
import { Structs, TablePositions } from '@ephox/snooker';
import { Compare, SelectorFind, SugarElement } from '@ephox/sugar';

import * as CellSelection from '../selection/CellSelection';

// Explicitly calling CellSelection.retrieve so that we can see the API signature.
const retrieve = <T extends Element> (container: SugarElement<Node>, selector: string): Optional<SugarElement<T>[]> => {
  return CellSelection.retrieve<T>(container, selector);
};

const retrieveBox = (container: SugarElement<Node>, firstSelectedSelector: string, lastSelectedSelector: string): Optional<Structs.Bounds> => {
  return CellSelection.getEdges(container, firstSelectedSelector, lastSelectedSelector).bind((edges) => {
    const isRoot = (ancestor: SugarElement<Node>) => {
      return Compare.eq(container, ancestor);
    };
    const sectionSelector = 'thead,tfoot,tbody,table';
    const firstAncestor = SelectorFind.ancestor(edges.first, sectionSelector, isRoot);
    const lastAncestor = SelectorFind.ancestor(edges.last, sectionSelector, isRoot);
    return firstAncestor.bind((fA) => {
      return lastAncestor.bind((lA) => {
        return Compare.eq(fA, lA) ? TablePositions.getBox(edges.table, edges.first, edges.last) : Optional.none<Structs.Bounds>();
      });
    });
  });
};

export { retrieve, retrieveBox };

