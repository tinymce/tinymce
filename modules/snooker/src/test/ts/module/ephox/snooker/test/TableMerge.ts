import { Assert } from '@ephox/bedrock-client';
import { Arr, Result } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { SimpleGenerators } from 'ephox/snooker/api/Generators';
import * as Structs from 'ephox/snooker/api/Structs';
import * as TableMerge from 'ephox/snooker/model/TableMerge';
import * as Fitment from 'ephox/snooker/test/Fitment';

interface Spec {
  readonly rows: number;
  readonly cols: number;
  readonly grid: Structs.ElementNew[][];
}

type Asserter = (result: Result<Structs.RowCells[], string>, s: Structs.Address, specA: Spec, specB: Spec) => void;

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

const mergeTest = (
  expected: Structs.ElementNew[][] | { error: string },
  startAddress: Structs.Address,
  gridA: Structs.ElementNew[][],
  gridB: Structs.ElementNew[][],
  generator: () => SimpleGenerators,
  comparator: (a: SugarElement<HTMLElement>, b: SugarElement<HTMLElement>) => boolean
): void => {
  // The last step, merge cells from gridB into gridA
  const nuGrid = TableMerge.merge(
    startAddress,
    mapToStructGrid(gridA),
    mapToStructGrid(gridB),
    generator(),
    comparator
  );
  nuGrid.fold((err) => {
    if ('error' in expected) {
      Assert.eq('', expected.error, err);
    } else {
      Assert.fail('Failure was unexpected, got error "' + err + '"');
    }
  }, (grid) => {
    if (!('error' in expected)) {
      assertGrids(mapToStructGrid(expected), grid);
    } else {
      Assert.fail('Expected failure "' + expected.error + '" but instead got grid');
    }
  });
};

const mergeIVTest = (
  asserter: Asserter,
  startAddress: Structs.Address,
  gridSpecA: Spec,
  gridSpecB: Spec,
  generator: () => SimpleGenerators,
  comparator: (a: SugarElement<HTMLElement>, b: SugarElement<HTMLElement>) => boolean
): void => {
  // The last step, merge cells from gridB into gridA
  const nuGrid = TableMerge.merge(
    startAddress,
    mapToStructGrid(gridSpecA.grid),
    mapToStructGrid(gridSpecB.grid),
    generator(),
    comparator
  );
  asserter(nuGrid, startAddress, gridSpecA, gridSpecB);
};

const suite = (
  label: string,
  startAddress: Structs.Address,
  gridA: Structs.ElementNew[][],
  gridB: Structs.ElementNew[][],
  generator: () => SimpleGenerators,
  comparator: (a: SugarElement<HTMLElement>, b: SugarElement<HTMLElement>) => boolean,
  expectedMeasure: { rowDelta: number; colDelta: number },
  expectedTailor: Structs.ElementNew[][],
  expectedMergeGrids: Structs.ElementNew[][]
): void => {
  Fitment.measureTest(expectedMeasure, startAddress, gridA, gridB);
  Fitment.tailorTest(expectedTailor, startAddress, gridA, expectedMeasure, generator);
  mergeTest(expectedMergeGrids, startAddress, gridA, gridB, generator, comparator);
};

export {
  mergeTest,
  mergeIVTest,
  suite
};
