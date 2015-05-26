define(
  'ephox.snooker.model.Lead',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    var leadStruct = Struct.immutableBag([ 'element', 'colspan', 'rowspan' ], []);

    var generate = function (lead, range) {
      var startCol = range.startCol();
      var startRow = range.startRow();
      var endCol = range.endCol();
      var endRow = range.endRow();

      var colspan = endCol - startCol;
      var rowspan = endRow - startRow;

      return leadStruct({
        element: lead,
        colspan: colspan+1,
        rowspan: rowspan+1
      });

    };

    return {
      generate: generate
    };
  }
);