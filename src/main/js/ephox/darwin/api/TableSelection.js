define(
  'ephox.darwin.api.TableSelection',

  [
    'ephox.darwin.selection.CellSelection',
    'ephox.katamari.api.Option',
    'ephox.snooker.api.TablePositions',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (CellSelection, Option, TablePositions, Compare, SelectorFind) {
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

    return {
      retrieve: retrieve,
      retrieveBox: retrieveBox
    };
  }
);