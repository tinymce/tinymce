import TableGridSize from 'ephox/snooker/api/TableGridSize';
import { Remove } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('Table grid size test', function() {
  var testGridSize = function (html, expectedColumnCount, expectedRowCount) {
    var tbl = Element.fromHtml(html);
    var size = TableGridSize.getGridSize(tbl);

    assert.eq(expectedColumnCount, size.columns(), 'Should be expected column count');
    assert.eq(expectedRowCount, size.rows(), 'Should be expected row count');

    Remove.remove(tbl);
  };

  testGridSize('<table><tbody><tr><td></td></tr></tbody></table>', 1, 1);
  testGridSize('<table><tbody><tr><td></td><td></td></tr></tbody></table>', 2, 1);
  testGridSize('<table><tbody><tr><td></td></tr><tr><td></td></tr></tbody></table>', 1, 2);
  testGridSize('<table><tbody><tr><td></td><td></td></tr><tr><td></td><td></td></tr></tbody></table>', 2, 2);
});

