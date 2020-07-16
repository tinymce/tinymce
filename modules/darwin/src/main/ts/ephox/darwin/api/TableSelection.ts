import { Option } from '@ephox/katamari';
import { Structs, TablePositions } from '@ephox/snooker';
import { Compare, SelectorFind, SugarElement } from '@ephox/sugar';
import * as CellSelection from '../selection/CellSelection';

// Explictly calling CellSelection.retrieve so that we can see the API signature.
const retrieve = function (container: SugarElement, selector: string) {
  return CellSelection.retrieve(container, selector);
};

const retrieveBox = function (container: SugarElement, firstSelectedSelector: string, lastSelectedSelector: string) {
  return CellSelection.getEdges(container, firstSelectedSelector, lastSelectedSelector).bind(function (edges) {
    const isRoot = function (ancestor: SugarElement) {
      return Compare.eq(container, ancestor);
    };
    const firstAncestor = SelectorFind.ancestor(edges.first(), 'thead,tfoot,tbody,table', isRoot);
    const lastAncestor = SelectorFind.ancestor(edges.last(), 'thead,tfoot,tbody,table', isRoot);
    return firstAncestor.bind(function (fA) {
      return lastAncestor.bind(function (lA) {
        return Compare.eq(fA, lA) ? TablePositions.getBox(edges.table(), edges.first(), edges.last()) : Option.none<Structs.Bounds>();
      });
    });
  });
};

export {
  retrieve,
  retrieveBox
};
