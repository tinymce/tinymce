import { Optional } from '@ephox/katamari';
import { Structs, TablePositions } from '@ephox/snooker';
import { Compare, SelectorFind, SugarElement } from '@ephox/sugar';
import * as CellSelection from '../selection/CellSelection';

// Explictly calling CellSelection.retrieve so that we can see the API signature.
const retrieve = function <T extends Element> (container: SugarElement, selector: string): Optional<SugarElement<T>[]> {
  return CellSelection.retrieve<T>(container, selector);
};

const retrieveBox = function (container: SugarElement, firstSelectedSelector: string, lastSelectedSelector: string) {
  return CellSelection.getEdges(container, firstSelectedSelector, lastSelectedSelector).bind(function (edges) {
    const isRoot = function (ancestor: SugarElement) {
      return Compare.eq(container, ancestor);
    };
    const sectionSelector = 'thead,tfoot,tbody,table';
    const firstAncestor = SelectorFind.ancestor(edges.first, sectionSelector, isRoot);
    const lastAncestor = SelectorFind.ancestor(edges.last, sectionSelector, isRoot);
    return firstAncestor.bind(function (fA) {
      return lastAncestor.bind(function (lA) {
        return Compare.eq(fA, lA) ? TablePositions.getBox(edges.table, edges.first, edges.last) : Optional.none<Structs.Bounds>();
      });
    });
  });
};

export { retrieve, retrieveBox };

