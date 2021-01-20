import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarElement, TextContent } from '@ephox/sugar';
import * as Structs from 'ephox/snooker/api/Structs';
import { Warehouse } from 'ephox/snooker/api/Warehouse';
import * as Recalculations from 'ephox/snooker/resize/Recalculations';

UnitTest.test('RecalculationsTest', () => {
  const dimensions = Structs.dimensions;

  interface Parts {
    columns: Array<{
      element: string;
      width: number;
    }>;
    widths: Array<{
      element: string;
      width: number;
    }>;
    heights: Array<{
      element: string;
      height: number;
    }>;
  }

  const expectedParts = (columns: {element: string; width: number}[], widths: {element: string; width: number}[], heights: {element: string; height: number}[]): Parts => ({
    columns,
    widths,
    heights
  });

  const check = (expected: Parts[], input: Structs.RowData<Structs.Detail>[], sizes: Structs.Dimensions) => {
    const warehouse = Warehouse.generate(input);
    const actualCellWidth = Recalculations.recalculateWidthForCells(warehouse, sizes.width);
    const actualColumnWidth = Recalculations.recalculateWidthForColumns(warehouse, sizes.width);
    const actualCellHeight = Recalculations.recalculateHeightForCells(warehouse, sizes.height);

    Arr.each(expected, (expt) => {
      assert.eq(expt.columns, Arr.map(actualColumnWidth, (cell) => ({
        element: TextContent.get(cell.element),
        width: cell.width
      })));

      assert.eq(expt.widths, Arr.map(actualCellWidth, (cell) => ({
        element: TextContent.get(cell.element),
        width: cell.width
      })));

      assert.eq(expt.heights, Arr.map(actualCellHeight, (cell) => ({
        element: TextContent.get(cell.element),
        height: cell.height
      })));
    });
  };

  const createCell = (text: string): SugarElement => {
    const elm = SugarElement.fromTag('td');
    TextContent.set(elm, text);
    return elm;
  };

  const makeDetail = (elemText: string, rowspan: number, colspan: number) => Structs.detail(createCell(elemText), rowspan, colspan);
  const makeRow = (cells: Structs.Detail[]) => Structs.rowdata(SugarElement.fromTag('tr'), cells, 'tbody');
  const makeColumnGroup = (cols: Structs.Detail[]) => Structs.rowdata(SugarElement.fromTag('col'), cols, 'colgroup');

  check(
    [
      expectedParts(
        [],
        [
          { element: 'a', width: 10 }
        ],
        [
          { element: 'a', height: 10 }
        ]
      )
    ],
    [
      makeRow([
        makeDetail('a', 1, 1)
      ])
    ],
    dimensions([ 10 ], [ 10 ])
  );

  check(
    [
      expectedParts(
        [
          { element: 'c', width: 10 }
        ],
        [
          { element: 'a', width: 10 }
        ],
        [
          { element: 'a', height: 10 }
        ]
      )
    ],
    [
      makeColumnGroup([
        makeDetail('c', 1, 1)
      ]),
      makeRow([
        makeDetail('a', 1, 1)
      ])
    ],
    dimensions([ 10 ], [ 10 ])
  );

  // 2x2 grid
  check(
    [
      expectedParts(
        [],
        [{ element: 'a00', width: 20 }, { element: 'a01', width: 20 }, { element: 'a10', width: 20 }, { element: 'a11', width: 20 }],
        [{ element: 'a00', height: 15 }, { element: 'a01', height: 15 }, { element: 'a10', height: 9 }, { element: 'a11', height: 9 }]
      )
    ],
    [
      makeRow([ makeDetail('a00', 1, 1), makeDetail('a01', 1, 1) ]),
      makeRow([ makeDetail('a10', 1, 1), makeDetail('a11', 1, 1) ])
    ],
    dimensions([ 20, 20 ], [ 15, 9 ])
  );

  // 2x2 grid
  check(
    [
      expectedParts(
        [{ element: 'c00', width: 20 }, { element: 'c01', width: 20 }],
        [{ element: 'a00', width: 20 }, { element: 'a01', width: 20 }, { element: 'a10', width: 20 }, { element: 'a11', width: 20 }],
        [{ element: 'a00', height: 15 }, { element: 'a01', height: 15 }, { element: 'a10', height: 9 }, { element: 'a11', height: 9 }]
      )
    ],
    [
      makeColumnGroup([ makeDetail('c00', 1, 1), makeDetail('c01', 1, 1) ]),
      makeRow([ makeDetail('a00', 1, 1), makeDetail('a01', 1, 1) ]),
      makeRow([ makeDetail('a10', 1, 1), makeDetail('a11', 1, 1) ])
    ],
    dimensions([ 20, 20 ], [ 15, 9 ])
  );

  // 2x2 grid merged into a single cell with total dimensions double the width and height
  check(
    [
      expectedParts(
        [],
        [{ element: 'a', width: 40 }],
        [{ element: 'a', height: 60 }]
      )
    ],
    [
      makeRow([ makeDetail('a', 2, 2) ]),
      makeRow([]) // optional
    ],
    dimensions([ 20, 20, 99999 ], [ 30, 30, 999999 ])
  );

  // 2x3 grid merged into a single cell with total dimensions double the width and height
  check(
    [
      expectedParts(
        [],
        [{ element: 'a', width: 40 }, { element: 'b', width: 15 }, { element: 'c', width: 15 }],
        [{ element: 'a', height: 60 }, { element: 'b', height: 30 }, { element: 'c', height: 30 }]
      )
    ],
    [
      makeRow([ makeDetail('a', 2, 2), makeDetail('b', 1, 1) ]),
      makeRow([ makeDetail('c', 1, 1) ])
    ],
    dimensions([ 20, 20, 15, 99999 ], [ 30, 30, 999999 ])
  );

  check(
    [
      expectedParts(
        [],
        [{ element: 'a', width: 30 }, { element: 'b', width: 11 }, { element: 'c', width: 11 }],
        [{ element: 'a', height: 28 }, { element: 'b', height: 15 }, { element: 'c', height: 13 }]
      )
    ],
    [
      makeRow([ makeDetail('a', 2, 2), makeDetail('b', 1, 1) ]),
      makeRow([ makeDetail('c', 1, 1) ])
    ],
    dimensions([ 20, 10, 11 ], [ 15, 13 ]));

  check(
    [
      expectedParts(
        [],
        [
          { element: 'g', width: 10 }, { element: 'h', width: 10 }, { element: 'i', width: 10 }, { element: 'j', width: 10 }, { element: 'k', width: 30 },
          { element: 'l', width: 10 }, { element: 'm', width: 20 }, { element: 'n', width: 10 }, { element: 'o', width: 10 }, { element: 'p', width: 10 },
          { element: 'q', width: 10 }, { element: 'r', width: 10 }, { element: 's', width: 10 }, { element: 't', width: 10 }, { element: 'u', width: 10 },
          { element: 'v', width: 10 }
        ],
        [
          { element: 'g', height: 20 }, { element: 'h', height: 20 }, { element: 'i', height: 20 }, { element: 'j', height: 20 }, { element: 'k', height: 20 },
          { element: 'l', height: 15 }, { element: 'm', height: 25 }, { element: 'n', height: 15 }, { element: 'o', height: 15 }, { element: 'p', height: 15 }, { element: 'q', height: 15 },
          { element: 'r', height: 10 }, { element: 's', height: 10 }, { element: 't', height: 10 }, { element: 'u', height: 10 }, { element: 'v', height: 10 }
        ]
      )
    ],
    [
      makeRow([ makeDetail('g', 1, 1), makeDetail('h', 1, 1), makeDetail('i', 1, 1), makeDetail('j', 1, 1), makeDetail('k', 1, 3) ]),
      makeRow([ makeDetail('l', 1, 1), makeDetail('m', 3, 2), makeDetail('n', 1, 1), makeDetail('o', 1, 1), makeDetail('p', 1, 1), makeDetail('q', 1, 1) ]),
      makeRow([ makeDetail('r', 2, 1), makeDetail('s', 1, 1), makeDetail('t', 2, 1), makeDetail('u', 1, 1), makeDetail('v', 1, 1) ])
    ],
    dimensions([ 10, 10, 10, 10, 10, 10, 10 ], [ 20, 15, 10 ])
  );
});
