define(
  'ephox.snooker.model.Lead',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    var leadStruct = Struct.immutableBag([ 'element', 'colspan', 'rowspan' ], []);
    // lead is the element which is going to replace
    // the main cell.
    // Even if that element has a colspan/rowspan we can ignore it because
    // it can be extracted from the range itself.
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