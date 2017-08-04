define(
  'ephox.darwin.api.TableSelection',

  [
    'ephox.darwin.selection.CellSelection',
    'ephox.snooker.api.TablePositions'
  ],

  function (CellSelection, TablePositions) {
    // Explictly calling CellSelection.retrieve so that we can see the API signature.
    var retrieve = function (container) {
      return CellSelection.retrieve(container);
    };

    var retrieveBox = function (container) {
      return CellSelection.getEdges(container).bind(function (edges) {
        var firstAncestor = SelectorFind.ancestor(edges.first(), 'thead,tfoot,tbody,table');
        var lastAncestor = SelectorFind.ancestor(edges.last(), 'thead,tfoot,tbody,table');
        return firstAncestor.bind(function (fA) {
          return lastAncestor.bind(function (lA) {
            return Compare.eq(fA, lA) ? TablePositions.getBox(edges.table(), edges.first(), edges.last()) : Option.none();
          });
        });
      });
    };

    var clear = function (container) {
      CellSelection.clear(container);
    };

    return {
      retrieve: retrieve,
      retrieveBox: retrieveBox,
      clear: clear
    };
  }
);