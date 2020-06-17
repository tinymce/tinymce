import { Assert, UnitTest } from '@ephox/bedrock-client';
import { HTMLTableCellElement, HTMLTableElement } from '@ephox/dom-globals';
import { Body, Css, Element, Insert, Remove, SelectorFind, Width } from '@ephox/sugar';
import { ResizeDirection } from 'ephox/snooker/api/ResizeDirection';
import { TableSize } from 'ephox/snooker/api/TableSize';
import { Warehouse } from 'ephox/snooker/model/Warehouse';
import * as fc from 'fast-check';

const pixelTableHtml = '<table style="width: 400px"><tbody><tr><td style="width: 200px"></td><td style="width: 200px"></td></tr></tbody></table>';
const percentTableHtml = '<table style="width: 80%"><tbody><tr><td style="width: 50%"></td><td style="width: 50%"></td></tr></tbody></table>';
const noneTableHtml = '<table><tbody><tr><td></td><td></td></tr></tbody></table>';

UnitTest.test('TableSize.getTableSize', () => {
  const pixelTable = Element.fromHtml<HTMLTableElement>(pixelTableHtml);
  const percentageTable = Element.fromHtml<HTMLTableElement>(percentTableHtml);
  const noneTable = Element.fromHtml<HTMLTableElement>(noneTableHtml);

  const pixelSizing = TableSize.getTableSize(pixelTable);
  const percentageSizing = TableSize.getTableSize(percentageTable);
  const noneSizing = TableSize.getTableSize(noneTable);

  Assert.eq('Pixel sizing detected', 'pixel', pixelSizing.label);
  Assert.eq('Percentage sizing detected', 'percent', percentageSizing.label);
  Assert.eq('None sizing detected', 'none', noneSizing.label);
});

UnitTest.test('TableSize.pixelSizing', () => {
  const table = Element.fromHtml<HTMLTableElement>(pixelTableHtml);
  Insert.append(Body.body(), table);

  const sizing = TableSize.getTableSize(table);
  const warehouse = Warehouse.fromTable(table);

  Assert.eq('Width should be 400px', 400, sizing.width());
  Assert.eq('Pixel width should be 400px', 400, sizing.pixelWidth());
  Assert.eq('Cell widths should be 200px each', [ 200, 200 ], sizing.getWidths(warehouse, ResizeDirection.ltr, sizing));
  Assert.eq('Cell min width should be at least 10px', true, sizing.minCellWidth() >= 10);

  fc.assert(fc.property(fc.integer(-390, 390), fc.integer(400, 1000), (delta, colWidth) => {
    Assert.eq('Cell delta should be identity', delta, sizing.getCellDelta(delta));
    Assert.eq('Single column delta width should be the delta', [ delta ], sizing.singleColumnWidth(colWidth, delta));
  }));

  sizing.setTableWidth(table, [ 100, 100 ], -200);
  Assert.eq('Table width after resizing is 200px', '200px', Css.getRaw(table, 'width').getOr(''));

  const cell = SelectorFind.descendant<HTMLTableCellElement>(table, 'td').getOrDie();
  sizing.setElementWidth(cell, 50);
  Assert.eq('Cell width after resizing is 50px', '50px', Css.getRaw(cell, 'width').getOr(''));

  Remove.remove(table);
});

UnitTest.test('TableSize.percentageSizing', () => {
  const container = Element.fromHtml('<div style="position: absolute; left: 0; top: 0; width: 500px"></div>');
  const table = Element.fromHtml<HTMLTableElement>(percentTableHtml);
  Insert.append(container, table);
  Insert.append(Body.body(), container);

  const sizing = TableSize.getTableSize(table);
  const warehouse = Warehouse.fromTable(table);

  Assert.eq('Width should be 75', 80, sizing.width());
  Assert.eq('Pixel width should be 600px', 400, sizing.pixelWidth());
  Assert.eq('Cell widths should be 50% each', [ 50, 50 ], sizing.getWidths(warehouse, ResizeDirection.ltr, sizing));
  Assert.eq('Cell min width should be at least 10px in percentage (2.5%)', true, sizing.minCellWidth() >= 2.5);

  fc.assert(fc.property(fc.integer(-390, 390), fc.nat(100), (delta, colWidth) => {
    const deltaPercent = delta / 400 * 100;
    Assert.eq('Cell delta should be the same, but in percentage', deltaPercent, sizing.getCellDelta(delta));
    Assert.eq('Single column delta width should be 100% - percentage width', [ 100 - colWidth ], sizing.singleColumnWidth(colWidth, delta));
  }));

  sizing.setTableWidth(table, [ 50, 50 ], -25);
  Assert.eq('Table width after resizing is 25% less of the original 80%', '60%', Css.getRaw(table, 'width').getOr(''));

  const cell = SelectorFind.descendant<HTMLTableCellElement>(table, 'td').getOrDie();
  sizing.setElementWidth(cell, 25);
  Assert.eq('Cell width after resizing is 25%', '25%', Css.getRaw(cell, 'width').getOr(''));

  Remove.remove(container);
});

UnitTest.test('TableSize.noneSizing', () => {
  const table = Element.fromHtml<HTMLTableElement>(noneTableHtml);
  Insert.append(Body.body(), table);

  const sizing = TableSize.getTableSize(table);
  const warehouse = Warehouse.fromTable(table);
  const width = Width.get(table);
  const cellWidth = SelectorFind.descendant<HTMLTableCellElement>(table, 'td').map(Width.get).getOrDie();

  Assert.eq('Width should be the computed size of the table', width, sizing.width());
  Assert.eq('Pixel width should be the computed size of the table', width, sizing.pixelWidth());
  Assert.eq('Cell widths should be the computed size of the cell', [ cellWidth, cellWidth ], sizing.getWidths(warehouse, ResizeDirection.ltr, sizing));
  Assert.eq('Cell min width should be at least 10px', true, sizing.minCellWidth() >= 10);

  fc.assert(fc.property(fc.integer(-390, 390), fc.integer(400, 1000), (delta, colWidth) => {
    Assert.eq('Cell delta should be identity', delta, sizing.getCellDelta(delta));
    Assert.eq('Single column delta width should be the delta', [ delta ], sizing.singleColumnWidth(colWidth, delta));
  }));

  sizing.setTableWidth(table, [ cellWidth - 10, cellWidth - 10 ], -20);
  Assert.eq('Table width after resizing is unchanged', '', Css.getRaw(table, 'width').getOr(''));

  const cell = SelectorFind.descendant<HTMLTableCellElement>(table, 'td').getOrDie();
  sizing.setElementWidth(cell, 20);
  Assert.eq('Cell width after resizing is unchanged', '', Css.getRaw(cell, 'width').getOr(''));

  Remove.remove(table);
});
