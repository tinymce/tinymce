define(
  'ephox.snooker.build.Table',

  [
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert'
  ],

  function (Element, Insert) {
    return function (rows, columns) {
      var table = Element.fromTag('table');

      for (var i = 0; i < rows; i++) {
        var row = Element.fromTag('tr');
        for (var j = 0; j < columns; j++) {
          var cell = Element.fromTag('td');
          Insert.append(cell, Element.fromText('(' + i + ', ' + j + ')'));
          Insert.append(row, cell);
        }
        Insert.append(table, row);
      }

      var element = function () {
        return table;
      };

      return {
        element: element
      };
    };
  }
);
