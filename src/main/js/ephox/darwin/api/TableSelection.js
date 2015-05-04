define(
  'ephox.darwin.api.TableSelection',

  [
    'ephox.darwin.selection.CellSelection'
  ],

  function (CellSelection) {
    // Explictly calling CellSelection.retrieve so that we can see the API signature.
    var retrieve = function (container) {
      return CellSelection.retrieve(container);
    };

    return {
      retrieve: retrieve
    };
  }
);