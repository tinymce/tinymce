import { Assert } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';

import { SimpleGenerators } from 'ephox/snooker/api/Generators';
import * as Structs from 'ephox/snooker/api/Structs';
import * as Fitment from 'ephox/snooker/model/Fitment';

const mapToStructGrid = (grid: Structs.ElementNew[][]): Structs.RowCells[] => {
  return Arr.map(grid, (row) => {
    return Structs.rowcells('tr' as any, row, 'tbody', false);
  });
};

const assertGrids = (expected: Structs.RowCells[], actual: Structs.RowCells[]): void => {
  Assert.eq('', expected.length, actual.length);
  Arr.each(expected, (row, i) => {
    Arr.each(row.cells, (cell, j) => {
      Assert.eq('', cell.element, actual[i].cells[j].element);
      Assert.eq('', cell.isNew, actual[i].cells[j].isNew);
    });
    Assert.eq('', row.section, actual[i].section);
  });
};

const measureTest = (expected: { error: string } | { rowDelta: number; colDelta: number }, startAddress: Structs.Address,
                     gridA: Structs.ElementNew[][], gridB: Structs.ElementNew[][]): void => {
  // Try put gridB into gridA at the startAddress
  // returns a delta,
  // colDelta = -3 means gridA is 3 columns too short
  // rowDelta = 3 means gridA can fit gridB with 3 rows to spare

  Fitment.measure(startAddress, mapToStructGrid(gridA), mapToStructGrid(gridB)).fold((err) => {
    if ('error' in expected) {
      Assert.eq('', expected.error, err);
    } else {
      Assert.fail('An error was not expected. Message was "' + err + '"');
    }
  }, (delta) => {
    if ('rowDelta' in expected) {
      Assert.eq('rowDelta expected: ' + expected.rowDelta + ' actual: ' + delta.rowDelta, expected.rowDelta, delta.rowDelta);
      Assert.eq('colDelta expected: ' + expected.colDelta + ' actual: ' + delta.colDelta, expected.colDelta, delta.colDelta);
    } else {
      Assert.fail('Expected error "' + expected.error + '" but instead got rowDelta=' + delta.rowDelta + ' colDelta=' + delta.colDelta);
    }
  });
};

const tailorTest = (expected: Structs.ElementNew[][], startAddress: Structs.Address, gridA: Structs.ElementNew[][],
                    delta: Fitment.Delta, generator: () => SimpleGenerators): void => {
  // Based on the Fitment.measure
  // Increase gridA by the row/col delta values
  // The result is a new grid that will perfectly fit gridB into gridA
  const tailoredGrid = Fitment.tailor(mapToStructGrid(gridA), delta, generator());
  assertGrids(mapToStructGrid(expected), tailoredGrid);
};

const tailorIVTest = (expected: { rows: number; cols: number }, startAddress: Structs.Address, gridA: Structs.ElementNew[][],
                      delta: Fitment.Delta, generator: () => SimpleGenerators): void => {
  const tailoredGrid = Fitment.tailor(mapToStructGrid(gridA), delta, generator());
  const rows = tailoredGrid.length;
  const cols = tailoredGrid[0].cells.length;
  Assert.eq('', expected.rows, rows);
  Assert.eq('', expected.cols, cols);
};

export {
  measureTest,
  tailorTest,
  tailorIVTest
};
