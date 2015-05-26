define(
  'ephox.snooker.model.Impera',

  [

  ],

  function () {
    var render = function (structure, range, lead, comparator) {
      for (var i=range.startRow(); i<=range.endRow(); i++) {
        for (var j = range.startCol(); j<=range.endCol(); j++) {
          structure[i][j] = lead;
        }
      }
      return structure;
    };

    return {
      render: render
    };
  }
);