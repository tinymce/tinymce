test(
  'Table grid size test',

  [
    'ephox.snooker.api.TableGridSize',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element'
  ],

  function (TableGridSize, Remove, Element) {
    var testGridSize = function (html, expectedColumnCount, expecedRowCount) {
      var tbl = Element.fromHtml(html);
      var size = TableGridSize.getGridSize(tbl);

      assert.eq(expectedColumnCount, size.columns(), 'Should be expected column count');
      assert.eq(expecedRowCount, size.rows(), 'Should be expected row count');

      Remove.remove(tbl);
    };

    testGridSize('<table><tbody><tr><td></td></tr></tbody></table>', 1, 1);
    testGridSize('<table><tbody><tr><td></td><td></td></tr></tbody></table>', 2, 1);
    testGridSize('<table><tbody><tr><td></td></tr><tr><td></td></tr></tbody></table>', 1, 2);
    testGridSize('<table><tbody><tr><td></td><td></td></tr><tr><td></td><td></td></tr></tbody></table>', 2, 2);
  }
);