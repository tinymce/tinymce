import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Remove, SugarElement } from '@ephox/sugar';

import * as TableGridSize from 'ephox/snooker/api/TableGridSize';

UnitTest.test('Table grid size test', () => {
  const testGridSize = (html: string, expectedColumnCount: number, expectedRowCount: number) => {
    const tbl = SugarElement.fromHtml<HTMLTableElement>(html);
    const size = TableGridSize.getGridSize(tbl);

    Assert.eq('Should be expected column count', expectedColumnCount, size.columns);
    Assert.eq('Should be expected row count', expectedRowCount, size.rows);

    Remove.remove(tbl);
  };

  testGridSize('<table><tbody><tr><td></td></tr></tbody></table>', 1, 1);
  testGridSize('<table><tbody><tr><td></td><td></td></tr></tbody></table>', 2, 1);
  testGridSize('<table><tbody><tr><td></td></tr><tr><td></td></tr></tbody></table>', 1, 2);
  testGridSize('<table><tbody><tr><td></td><td></td></tr><tr><td></td><td></td></tr></tbody></table>', 2, 2);
});
