define(
  'ephox.snooker.picker.Picker',

  [
    'ephox.compass.Arr',
    'ephox.snooker.style.Styles',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFilter'
  ],

  function(Arr, Styles, Class, Element, Insert, InsertAll, Remove, SelectorFilter) {
    return function() {
      var table = Element.fromTag('table');
      Class.add(table, Styles.resolve('table-picker'));
      var tbody = Element.fromTag('tbody');
      Insert.append(table, tbody);

      var repeat = function(repititions, f) {
        var r = [];
        for (var i = 0; i < repititions; i++) {
          r.push(f());
        }
        return r;
      }

      var element = function() {
        return table;
      };

      var destroy = function() {

      };

      var setSize = function (numRows, numCols) {
        //repeat()
        Remove.empty(tbody);
        //create a set of trs, then for each tr, insert numCols tds
        var rows = repeat(numRows, function() {
          return Element.fromTag('tr');
        });

        Arr.each(rows, function(row) {
          var cells = repeat(numCols, function() {
            return Element.fromTag('td');
          });

          InsertAll.append(row, cells);
          Insert.append(tbody, row);
        });
      };

      var setSelection = function(numRows, numCols) {

        //clear any previoius selection
        var allCells = SelectorFilter.descendants(tbody, 'td');
        Arr.each(allCells, function(cell) {
          Class.remove(cell, Styles.resolve('picker-selected'));
        });


        var rows = SelectorFilter.descendants(tbody, 'tr').slice(0,numRows);
        Arr.each(rows, function(row) {
          var cells = SelectorFilter.descendants(row, 'td').slice(0,numCols);
          Arr.each(cells, function(cell) {
            Class.add(cell, Styles.resolve('picker-selected'));
          });
        });
      }


      return {
        element: element,
        destroy: destroy,
        setSize: setSize,
        setSelection: setSelection
      };
    }
  }
);