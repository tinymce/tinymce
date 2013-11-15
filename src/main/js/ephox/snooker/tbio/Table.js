define(
  'ephox.snooker.tbio.Table',

  [
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll'
  ],

  function (Css, Element, Insert, InsertAll) {
    var render = function (rows, columns) {
      var table = Element.fromTag('table');
      Css.setAll(table, {
        border: '1px solid black',
        'border-collapse': 'collapse',
        width: '100%',
        height: 20 * rows
      });

      var tbody = Element.fromTag('tbody');
      Insert.append(table, tbody);

      var trs = [];
      for (var i = 0; i < rows; i++) {
        var tr = Element.fromTag('tr');
        for (var j = 0; j < columns; j++) {
          var td = Element.fromTag('td');
          Insert.append(td, Element.fromText(''));
          Css.set(td, 'border', '1px solid #444');
          Css.set(td, 'width', (100 / columns) + '%');
          Insert.append(tr, td);
        }
        trs.push(tr);
      }

      InsertAll.append(tbody, trs);
      return table;
    };

    return {
      render: render
    };
  }
);
