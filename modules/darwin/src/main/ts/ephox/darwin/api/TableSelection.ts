import CellSelection from '../selection/CellSelection';
import { Option } from '@ephox/katamari';
import { TablePositions } from '@ephox/snooker';
import { Compare } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';

// Explictly calling CellSelection.retrieve so that we can see the API signature.
var retrieve = function (container, selector) {
  return CellSelection.retrieve(container, selector);
};

var retrieveBox = function (container, firstSelectedSelector, lastSelectedSelector) {
  return CellSelection.getEdges(container, firstSelectedSelector, lastSelectedSelector).bind(function (edges) {
    var isRoot = function (ancestor) {
      return Compare.eq(container, ancestor);
    };
    var firstAncestor = SelectorFind.ancestor(edges.first(), 'thead,tfoot,tbody,table', isRoot);
    var lastAncestor = SelectorFind.ancestor(edges.last(), 'thead,tfoot,tbody,table', isRoot);
    return firstAncestor.bind(function (fA) {
      return lastAncestor.bind(function (lA) {
        return Compare.eq(fA, lA) ? TablePositions.getBox(edges.table(), edges.first(), edges.last()) : Option.none();
      });
    });
  });
};

export default <any> {
  retrieve: retrieve,
  retrieveBox: retrieveBox
};