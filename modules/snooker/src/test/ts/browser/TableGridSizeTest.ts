import { assert, UnitTest } from '@ephox/bedrock-client';
import { Element, Remove } from '@ephox/sugar';
import TableGridSize from 'ephox/snooker/api/TableGridSize';

UnitTest.test('Table grid size test', function () {
  const testGridSize = function (html: string, expectedColumnCount: number, expectedRowCount: number) {
    const tbl = Element.fromHtml(html);
    const size = TableGridSize.getGridSize(tbl);

    assert.eq(expectedColumnCount, size.columns(), 'Should be expected column count');
    assert.eq(expectedRowCount, size.rows(), 'Should be expected row count');

    Remove.remove(tbl);
  };

  testGridSize('<table><tbody><tr><td></td></tr></tbody></table>', 1, 1);
  testGridSize('<table><tbody><tr><td></td><td></td></tr></tbody></table>', 2, 1);
  testGridSize('<table><tbody><tr><td></td></tr><tr><td></td></tr></tbody></table>', 1, 2);
  testGridSize('<table><tbody><tr><td></td><td></td></tr><tr><td></td><td></td></tr></tbody></table>', 2, 2);
});
