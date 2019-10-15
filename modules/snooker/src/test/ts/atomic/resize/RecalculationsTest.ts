import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Struct } from '@ephox/katamari';
import * as Structs from 'ephox/snooker/api/Structs';
import { Warehouse } from 'ephox/snooker/model/Warehouse';
import Recalculations from 'ephox/snooker/resize/Recalculations';
import { Element } from '@ephox/sugar';

UnitTest.test('RecalculationsTest', function () {
  const dimensions = Structs.dimensions; // Struct.immutable('width', 'height');

  interface Parts {
    widths: () => Array<{
      element: string;
      width: number;
    }>;
    heights: () => Array<{
      element: string;
      height: number;
    }>;
  }

  const expectedParts: (widths: {element: string, width: number}[], heights: {element: string, height: number}[]) => Parts = Struct.immutable('widths', 'heights');

  const check = function (expected: Parts[], input: Structs.RowData<Structs.Detail>[], sizes: Structs.Dimensions) {
    const warehouse = Warehouse.generate(input);
    const actualW = Recalculations.recalculateWidth(warehouse, sizes.width());
    const actualH = Recalculations.recalculateHeight(warehouse, sizes.height());

    Arr.each(expected, function (expt) {
      assert.eq(expt.widths(), Arr.map(actualW, function (cell) {
        return {
          element: cell.element(),
          width: cell.width()
        };
      }));

      assert.eq(expt.heights(), Arr.map(actualH, function (cell) {
        return {
          element: cell.element(),
          height: cell.height()
        };
      }));

    });

  };

  const d = (fakeEle: any, rowspan: number, colspan: number) => Structs.detail(fakeEle as any as Element, rowspan, colspan);
  const r = (fakeEle: any, cells: Structs.Detail[], section: 'tbody') => Structs.rowdata(fakeEle as any as Element, cells, section);

  check([expectedParts([{ element: 'a', width: 10 }], [{ element: 'a', height: 10 }])], [
    r('r0', [d('a', 1, 1)], 'tbody')
  ], dimensions([10], [10]));

  // 2x2 grid
  check([expectedParts(
    [{ element: 'a00', width: 20 }, { element: 'a01', width: 20 },
    { element: 'a10', width: 20 }, { element: 'a11', width: 20 }],
    [{ element: 'a00', height: 15 }, { element: 'a01', height: 15 },
    { element: 'a10', height: 9 }, { element: 'a11', height: 9 }])], [
      r('r0', [d('a00', 1, 1), d('a01', 1, 1)], 'tbody'),
      r('r1', [d('a10', 1, 1), d('a11', 1, 1)], 'tbody')
    ], dimensions([20, 20], [15, 9]));

  // 2x2 grid merged into a single cell with total dimensions double the width and height
  check([expectedParts(
    [{ element: 'a', width: 40 }],
    [{ element: 'a', height: 60 }])], [
      r('r0', [d('a', 2, 2)], 'tbody'),
      r('r1', [], 'tbody') // optional
    ], dimensions([20, 20, 99999], [30, 30, 999999]));

  // 2x3 grid merged into a single cell with total dimensions double the width and height
  check([expectedParts(
    [{ element: 'a', width: 40 }, { element: 'b', width: 15 }, { element: 'c', width: 15 }],
    [{ element: 'a', height: 60 }, { element: 'b', height: 30 }, { element: 'c', height: 30 }])],
    [
      r('r0', [d('a', 2, 2), d('b', 1, 1)], 'tbody'),
      r('r1', [d('c', 1, 1)], 'tbody')
    ], dimensions([20, 20, 15, 99999], [30, 30, 999999]));

  check([expectedParts(
    [{ element: 'a', width: 30 }, { element: 'b', width: 11 }, { element: 'c', width: 11 }],
    [{ element: 'a', height: 28 }, { element: 'b', height: 15 }, { element: 'c', height: 13 }])],
    [
      r('r0', [d('a', 2, 2), d('b', 1, 1)], 'tbody'),
      r('r1', [d('c', 1, 1)], 'tbody')
    ], dimensions([20, 10, 11], [15, 13]));

  check([
    expectedParts([
      { element: 'g', width: 10 }, { element: 'h', width: 10 }, { element: 'i', width: 10 }, { element: 'j', width: 10 }, { element: 'k', width: 30 },
      { element: 'l', width: 10 }, { element: 'm', width: 20 }, { element: 'n', width: 10 }, { element: 'o', width: 10 }, { element: 'p', width: 10 },
      { element: 'q', width: 10 }, { element: 'r', width: 10 }, { element: 's', width: 10 }, { element: 't', width: 10 }, { element: 'u', width: 10 },
      { element: 'v', width: 10 }],
      [
        { element: 'g', height: 20 }, { element: 'h', height: 20 }, { element: 'i', height: 20 }, { element: 'j', height: 20 }, { element: 'k', height: 20 },
        { element: 'l', height: 15 }, { element: 'm', height: 25 }, { element: 'n', height: 15 }, { element: 'o', height: 15 }, { element: 'p', height: 15 }, { element: 'q', height: 15 },
        { element: 'r', height: 10 }, { element: 's', height: 10 }, { element: 't', height: 10 }, { element: 'u', height: 10 }, { element: 'v', height: 10 }])
  ], [
      r('r0', [d('g', 1, 1), d('h', 1, 1), d('i', 1, 1), d('j', 1, 1), d('k', 1, 3)], 'tbody'),
      r('r1', [d('l', 1, 1), d('m', 3, 2), d('n', 1, 1), d('o', 1, 1), d('p', 1, 1), d('q', 1, 1)], 'tbody'),
      r('r2', [d('r', 2, 1), d('s', 1, 1), d('t', 2, 1), d('u', 1, 1), d('v', 1, 1)], 'tbody')
    ], dimensions([10, 10, 10, 10, 10, 10, 10], [20, 15, 10]));
});
