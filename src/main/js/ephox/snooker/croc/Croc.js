define(
  'ephox.snooker.croc.Croc',

  [
    'ephox.compass.Arr',
    'ephox.snooker.util.Util',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Util, Attr, Element, SelectorFilter, SelectorFind) {
    var countAcross = function (cells) { 
      return Arr.foldr(cells, function (b, a) {
        var span = Attr.has(a, 'colspan') ? parseInt(Attr.get(a, 'colspan'), 10) : 1;
        return span + b;
      }, 0);
    }
    var insertRowBefore = function (cell) {
      // How are row and column tags going to work for spanning cells?
      var row = parseInt(Attr.get(cell, 'data-row'), 10);
      var column = parseInt(Attr.get(cell, 'data-column'), 10);
      SelectorFind.ancestor(cell, 'tr').each(function (tr) {
        // INVESTIGATE : What about th?
        var cells = SelectorFilter.descendants(tr, 'td');
        var span = countAcross(cells);
        var newCells = Util.repeat(span, function () {
          // Missing the data attributes
          return Element.fromTag('td');
        });

        var row = 
      });
      SelectorFind.ancestor(cell, 'table').each(function (table) {

      });
    };

    var insertRowAfter = function (cell) {

    };

    var addRow = function (cell) {

    };

    return {
      insertRowBefore: insertRowBefore,
      insertRowAfter: insertRowAfter,
      addRow: addRow
    };
  }
);
