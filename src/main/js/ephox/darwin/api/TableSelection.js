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
        return TablePositions.getBox(edges.table(), edges.first(), edges.last());
      });
    };

    return {
      retrieve: retrieve,
      retrieveBox: retrieveBox
    };
  }
);