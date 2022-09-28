import { Assert, context, describe, it } from '@ephox/bedrock-client';
import { Optional, OptionalInstances } from '@ephox/katamari';
import { Css, Insert, InsertAll, Remove, SelectorFind, SugarBody, SugarElement, Width } from '@ephox/sugar';
import { assert } from 'chai';
import * as fc from 'fast-check';

import { TableSize } from 'ephox/snooker/api/TableSize';
import { Warehouse } from 'ephox/snooker/api/Warehouse';

const tOptional = OptionalInstances.tOptional;

describe('TableSizeTest', () => {
  const pixelTableHtml = '<table style="width: 400px; border-collapse: collapse;"><tbody><tr><td style="width: 200px"></td><td style="width: 200px"></td></tr></tbody></table>';
  const overflowingPixelTableHtml = '<table style="width: 400px; border-collapse: collapse;"><tbody><tr><td style="width: 200px"><span style="display: inline-block; width: 483px"></span></td><td style="width: 200px"></td></tr></tbody></table>';
  const percentTableHtml = '<table style="width: 80%; border-collapse: collapse;"><tbody><tr><td style="width: 50%"></td><td style="width: 50%"></td></tr></tbody></table>';
  const overflowingPercentTableHtml = '<table style="width: 80%; border-collapse: collapse;"><tbody><tr><td style="width: 50%"><span style="display: inline-block; width: 483px"></span></td><td style="width: 50%"></td></tr></tbody></table>';
  const noneTableHtml = '<table><tbody><tr><td></td><td></td></tr></tbody></table>';

  context('getTableSize', () => {
    it('table with no widths should be detected as none', () => {
      const noneTable = SugarElement.fromHtml<HTMLTableElement>(noneTableHtml);
      const noneSizing = TableSize.getTableSize(noneTable);
      assert.equal(noneSizing.label, 'none', 'None sizing detected');
    });

    it('tables with widths should be detected as percent or pixel', () => {
      fc.assert(fc.property(fc.integer(100, 1000), fc.float(1, 100), (pixel, percent) => {
        const pixelTable = SugarElement.fromHtml<HTMLTableElement>(pixelTableHtml.replace('400px', pixel + 'px'));
        const percentageTable = SugarElement.fromHtml<HTMLTableElement>(percentTableHtml.replace('80%', percent + '%'));

        const pixelSizing = TableSize.getTableSize(pixelTable);
        const percentageSizing = TableSize.getTableSize(percentageTable);

        assert.equal(pixelSizing.label, 'pixel', 'Pixel sizing detected');
        assert.equal(percentageSizing.label, 'percent', 'Percentage sizing detected');
      }));
    });
  });

  context('pixelSize', () => {
    it('content box sizing should return pixel based widths that exclude borders in table sizes', () => {
      const style = SugarElement.fromHtml<HTMLStyleElement>('<style>table, tr, td { box-sizing: content-box; }</style>');
      const table = SugarElement.fromHtml<HTMLTableElement>(pixelTableHtml);
      InsertAll.append(SugarBody.body(), [ style, table ]);

      const sizing = TableSize.getTableSize(table);
      const warehouse = Warehouse.fromTable(table);

      assert.equal(sizing.width(), 400, 'Width should be 400px');
      assert.equal(sizing.pixelWidth(), 400, 'Pixel width should be 400px');
      assert.deepEqual(sizing.getWidths(warehouse, sizing), [ 198, 198 ], 'Cell widths should be 198px each');
      assert.isAtLeast(sizing.minCellWidth(), 10, 'Cell min width should be at least 10px');

      fc.assert(fc.property(fc.integer(-390, 390), fc.integer(400, 1000), (delta, colWidth) => {
        assert.equal(sizing.getCellDelta(delta), delta, 'Cell delta should be identity');
        assert.deepEqual(sizing.singleColumnWidth(colWidth, delta), [ delta ], 'Single column delta width should be the delta');
      }));

      sizing.adjustTableWidth(-200);
      Assert.eq('Table raw width after resizing is 200px', Optional.some('200px'), Css.getRaw(table, 'width'), tOptional());
      assert.equal(sizing.width(), 200, 'Table width after resizing is 200px');
      assert.equal(sizing.pixelWidth(), 200, 'Table pixel width after resizing is 200px');

      const cell = SelectorFind.descendant<HTMLTableCellElement>(table, 'td').getOrDie();
      sizing.setElementWidth(cell, 50);
      Assert.eq('Cell width after resizing is 50px', Optional.some('50px'), Css.getRaw(cell, 'width'), tOptional());

      Remove.remove(table);
      Remove.remove(style);
    });

    it('border box should return pixel based widths that include borders in table sizes', () => {
      const style = SugarElement.fromHtml<HTMLStyleElement>('<style>table, tr, td { box-sizing: border-box; }</style>');
      const table = SugarElement.fromHtml<HTMLTableElement>(pixelTableHtml);
      InsertAll.append(SugarBody.body(), [ style, table ]);

      const sizing = TableSize.getTableSize(table);
      const warehouse = Warehouse.fromTable(table);

      assert.equal(sizing.width(), 400, 'Width should be 400px');
      assert.equal(sizing.pixelWidth(), 400, 'Pixel width should be 400px');
      assert.deepEqual(sizing.getWidths(warehouse, sizing), [ 200, 200 ], 'Cell widths should be 200px each');
      assert.isAtLeast(sizing.minCellWidth(), 10, 'Cell min width should be at least 10px');

      fc.assert(fc.property(fc.integer(-390, 390), fc.integer(400, 1000), (delta, colWidth) => {
        assert.equal(sizing.getCellDelta(delta), delta, 'Cell delta should be identity');
        assert.deepEqual(sizing.singleColumnWidth(colWidth, delta), [ delta ], 'Single column delta width should be the delta');
      }));

      sizing.adjustTableWidth(-200);
      Assert.eq('Table raw width after resizing is 200px', Optional.some('200px'), Css.getRaw(table, 'width'), tOptional());
      assert.equal(sizing.width(), 200, 'Table width after resizing is 200px');
      assert.equal(sizing.pixelWidth(), 200, 'Table pixel width after resizing is 200px');

      const cell = SelectorFind.descendant<HTMLTableCellElement>(table, 'td').getOrDie();
      sizing.setElementWidth(cell, 50);
      Assert.eq('Cell width after resizing is 50px', Optional.some('50px'), Css.getRaw(cell, 'width'), tOptional());

      Remove.remove(table);
      Remove.remove(style);
    });

    it('TINY-7731: returned widths should use the actual width, not the specified widths', () => {
      const table = SugarElement.fromHtml<HTMLTableElement>(overflowingPixelTableHtml);
      Insert.append(SugarBody.body(), table);

      const sizing = TableSize.getTableSize(table);
      const warehouse = Warehouse.fromTable(table);

      assert.approximately(sizing.width(), 487, 1, 'Width should be ~487px');
      assert.approximately(sizing.pixelWidth(), 487, 1, 'Pixel width should be ~487px');

      const columnSizes = sizing.getWidths(warehouse, sizing);
      assert.approximately(columnSizes[0], 483, 1, 'First column should be the entire size of the table, minus borders');
      assert.approximately(columnSizes[1], 0, 1, 'Second column should be 0 as there is no room for it to render');

      Remove.remove(table);
    });
  });

  context('percentageSize', () => {
    it('should return percentage based widths in table sizes', () => {
      const container = SugarElement.fromHtml('<div style="position: absolute; left: 0; top: 0; width: 500px"></div>');
      const table = SugarElement.fromHtml<HTMLTableElement>(percentTableHtml);
      Insert.append(container, table);
      Insert.append(SugarBody.body(), container);

      const sizing = TableSize.getTableSize(table);
      const warehouse = Warehouse.fromTable(table);

      assert.equal(sizing.width(), 80, 'Width should be 80');
      assert.equal(sizing.pixelWidth(), 400, 'Pixel width should be 400px');
      assert.deepEqual(sizing.getWidths(warehouse, sizing), [ 50, 50 ], 'Cell widths should be 50% each');
      assert.equal(sizing.minCellWidth() >= 2.5, true, 'Cell min width should be at least 10px in percentage (2.5%)');

      fc.assert(fc.property(fc.integer(-390, 390), fc.nat(100), (delta, colWidth) => {
        const deltaPercent = delta / 400 * 100;
        assert.equal(sizing.getCellDelta(delta), deltaPercent, 'Cell delta should be the same, but in percentage');
        assert.deepEqual(sizing.singleColumnWidth(colWidth, delta), [ 100 - colWidth ], 'Single column delta width should be 100% - percentage width');
      }));

      sizing.adjustTableWidth(-25);
      Assert.eq('Table raw width after resizing is 25% less of the original 80%', Optional.some('60%'), Css.getRaw(table, 'width'), tOptional());
      assert.equal(sizing.width(), 60, 'Table width after resizing is 60%');
      assert.equal(sizing.pixelWidth(), 300, 'Table pixel width after resizing is 300px');

      const cell = SelectorFind.descendant<HTMLTableCellElement>(table, 'td').getOrDie();
      sizing.setElementWidth(cell, 25);
      Assert.eq('Cell width after resizing is 25%', Optional.some('25%'), Css.getRaw(cell, 'width'), tOptional());

      Remove.remove(container);
    });

    it('TINY-7731: returned widths should use the actual width, not the specified widths', () => {
      const container = SugarElement.fromHtml('<div style="position: absolute; left: 0; top: 0; width: 500px"></div>');
      const table = SugarElement.fromHtml<HTMLTableElement>(overflowingPercentTableHtml);
      Insert.append(container, table);
      Insert.append(SugarBody.body(), container);

      const sizing = TableSize.getTableSize(table);
      const warehouse = Warehouse.fromTable(table);

      assert.approximately(sizing.width(), 97.4, 0.5, 'Width should be ~97.4%');
      assert.approximately(sizing.pixelWidth(), 487, 1, 'Pixel width should be ~487px');

      const columnSizes = sizing.getWidths(warehouse, sizing);
      assert.approximately(columnSizes[0], 99.5, 0.5, 'First column should be the entire size of the table, minus borders');
      assert.approximately(columnSizes[1], 0, 0.5, 'Second column should be 0 as there is no room for it to render');

      Remove.remove(container);
    });
  });

  context('noneSize', () => {
    it('should return 0 or the actual widths for table sizes', () => {
      const table = SugarElement.fromHtml<HTMLTableElement>(noneTableHtml);
      Insert.append(SugarBody.body(), table);

      const sizing = TableSize.getTableSize(table);
      const warehouse = Warehouse.fromTable(table);
      const width = Width.get(table);
      const cellWidth = SelectorFind.descendant<HTMLTableCellElement>(table, 'td')
        .map((cell) => parseInt(Css.get(cell, 'width'), 10))
        .getOrDie();

      assert.equal(sizing.width(), width, 'Width should be the computed size of the table');
      assert.equal(sizing.pixelWidth(), width, 'Pixel width should be the computed size of the table');
      assert.deepEqual(sizing.getWidths(warehouse, sizing), [ cellWidth, cellWidth ], 'Cell widths should be the computed size of the cell');
      assert.equal(sizing.minCellWidth(), 0, 'Cell min width should be 0px');

      fc.assert(fc.property(fc.integer(-390, 390), fc.integer(400, 1000), (delta, colWidth) => {
        assert.equal(sizing.getCellDelta(delta), 0, 'Cell delta should be 0');
        assert.deepEqual(sizing.singleColumnWidth(colWidth, delta), [ 0 ], 'Single column delta width should be 0');
      }));

      sizing.adjustTableWidth(-20);
      Assert.eq('Table raw width after resizing is unchanged', Optional.none<string>(), Css.getRaw(table, 'width'), tOptional());
      assert.equal(sizing.width(), width, 'Table width after resizing is unchanged');
      assert.equal(sizing.pixelWidth(), width, 'Table pixel width after resizing is unchanged');

      const cell = SelectorFind.descendant<HTMLTableCellElement>(table, 'td').getOrDie();
      sizing.setElementWidth(cell, 20);
      Assert.eq('Cell width after resizing is unchanged', Optional.none<string>(), Css.getRaw(cell, 'width'), tOptional());

      Remove.remove(table);
    });
  });
});
