import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Attr, Class, Element, Html, InsertAll } from '@ephox/sugar';
import CopySelected from 'ephox/snooker/api/CopySelected';

interface TestData {
  selected: boolean;
  html: string;
  rowspan?: string;
  colspan?: string;
}

UnitTest.test('CopySelectedTest', function () {
  // normally this is darwin ephemera, but doesn't actually matter what it is
  const SEL_CLASS = 'copy-selected';

  // traverse really needs this built in
  const traverseChildElements = function (e: Element) {
    return Arr.map(e.dom().children, Element.fromDom);
  };

  // data objects for input/expected
  const data = function (selected: boolean) {
    return function (text: string, rowspan?: number, colspan?: number): TestData {
      return {
        selected,
        html: text,
        rowspan: rowspan === undefined ? undefined : String(rowspan),
        colspan: colspan === undefined ? undefined : String(colspan)
      };
    };
  };
  const s = data(true);
  const ns = data(false);
  const gen = function (): TestData {
    return {
      selected: false,
      html: '<br>'
    };
  };

  // generate a table structure from a nested array
  const generateInput = function (input: TestData[][]) {
    const table = Element.fromTag('table');
    const rows = Arr.map(input, function (row) {
      const cells = Arr.map(row, function (cell) {
        const td = Element.fromTag('td');
        if (cell.rowspan !== undefined) {
          Attr.set(td, 'rowspan', cell.rowspan);
        }
        if (cell.colspan !== undefined) {
          Attr.set(td, 'colspan', cell.colspan);
        }
        if (cell.selected) {
          Class.add(td, SEL_CLASS);
        }
        Html.set(td, cell.html);
        return td;
      });
      const tr = Element.fromTag('tr');
      InsertAll.append(tr, cells);
      return tr;
    });
    const withNewlines = Arr.bind(rows, function (row) {
      return [ Element.fromText('\n'), row];
    });
    InsertAll.append(table, withNewlines.concat(Element.fromText('\n')));
    return table;
  };

  const check = function (label: string, expected: TestData[][], input: TestData[][]) {
    const table = generateInput(input);

    CopySelected.extract(table, '.' + SEL_CLASS);

    // Now verify that the table matches the nested array structure of expected
    const assertWithInfo = function <T> (exp: T, actual: T, info: string) {
      assert.eq(exp, actual, () => 'expected ' + info + ' "' + exp + '", was "' + actual + '"' + ', test "' + label + '". Output HTML:\n' + Html.getOuter(table));
    };

    const domRows = traverseChildElements(table);
    assertWithInfo(expected.length, domRows.length, 'number of rows');
    Arr.each(expected, function (row, i) {
      const domCells = traverseChildElements(domRows[i]);
      assertWithInfo(row.length, domCells.length, 'number of cells in output row ' + i + ' to be ');
      Arr.each(row, function (cell, j) {
        const domCell = domCells[j];
        assertWithInfo(cell.html, Html.get(domCell), 'cell text');
        assertWithInfo(cell.rowspan, Attr.get(domCell, 'rowspan'), 'rowspan');
        assertWithInfo(cell.colspan, Attr.get(domCell, 'colspan'), 'colspan');
        assertWithInfo(cell.selected, Class.has(domCell, SEL_CLASS), 'selected class');
      });
    });
  };
  // visual test separator
  ////////////////////////////////////////////////////
  check('entire table, single cell',
  [
    [ s('A') ]
  ],
  [
    [ s('A', 1, 1) ]
  ]);
  ////////////////////////////////////////////////////
  check('entire table, simple',
  [
    [ s('A', 1, 1), s('B', 1, 1) ],
    [ s('C', 1, 1), s('D', 1, 1) ]
  ],
  [
    [ s('A', 1, 1), s('B', 1, 1) ],
    [ s('C', 1, 1), s('D', 1, 1) ]
  ]);
  ////////////////////////////////////////////////////
  const entireComplex = [
    [ s('A', 2, 2),                 s('B', 1, 1) ],
    [                               s('C', 1, 1) ],
    [ s('D', 1, 1),  s('E', 1, 1),  s('F', 1, 1) ]
  ];
  check('entire table, complex', entireComplex, entireComplex);
  ////////////////////////////////////////////////////
  check('single row, simple',
  [
    [  s('A'),        s('B'),          s('C')       ]
  ],
  [
    [  s('A', 1, 1),  s('B', 1, 1),    s('C', 1, 1) ],
    [ ns('D', 1, 2),                  ns('E', 1, 1) ]
  ]);
  ////////////////////////////////////////////////////
  check('single row, removing colspans',
  [
    [ s('A'),         s('B'),          s('C')       ]
  ],
  [
    [  s('A', 1, 1),  s('B', 1, 2),                    s('C', 1, 1) ],
    [ ns('D', 1, 2),                  ns('E', 1, 1),  ns('F', 1, 1) ]
  ]);
  ////////////////////////////////////////////////////
  check('single column, simple',
  [
    [  s('A')       ],
    [  s('D')       ],
    [  s('G')       ]
  ],
  [
    [  s('A', 1, 1),  ns('B', 1, 1),  ns('C', 1, 1) ],
    [  s('D', 1, 1),  ns('E', 1, 1),  ns('F', 1, 1) ],
    [  s('G', 1, 1),  ns('H', 1, 1),  ns('I', 1, 1) ]
  ]);
  ////////////////////////////////////////////////////
  check('single column, removing rowspans',
  [
    [ s('A')        ],
    [ s('D')        ],
    [ s('I')        ]
  ],
  [
    [ s('A', 1, 1),  ns('B', 1, 1),  ns('C', 1, 1) ],
    [ s('D', 2, 1),  ns('E', 1, 1),  ns('F', 1, 1) ],
    [                ns('G', 1, 1),  ns('H', 1, 1) ],
    [ s('I', 1, 1),  ns('J', 1, 1),  ns('K', 1, 1) ]
  ]);
  ////////////////////////////////////////////////////
  // complex polish demo template
  // [
  //   [ ns('A', 1, 1),  ns('B', 2, 2),                  ns('C', 1, 1) ],
  //   [ ns('D', 1, 1),                                  ns('E', 1, 2) ],
  //   [ ns('F', 3, 3)                                                 ],
  //   [                                                 ns('G', 1, 1) ],
  //   [                                                 ns('H', 1, 1) ],
  //   [ ns('I', 2, 1),  ns('J', 1, 1),  ns('K', 1, 2)                 ],
  //   [                 ns('L', 1, 2),                  ns('M', 1, 1) ]
  // ]
  ////////////////////////////////////////////////////
  check('non rectangular square in top right of complex table from polish demo',
  [
    [  s('B', 2, 2),                   s('C', 1, 1) ],
    [                                  s('E', 2, 1) ],
    [  gen(),         gen()                         ]
  ],
  [
    [ ns('A', 1, 1),  s('B', 2, 2),                    s('C', 1, 1) ],
    [ ns('D', 1, 1),                                   s('E', 2, 1) ],
    [ ns('F', 3, 3)                                                 ],
    [                                                 ns('G', 1, 1) ],
    [                                                 ns('H', 1, 1) ],
    [ ns('I', 2, 1),  ns('J', 1, 1),  ns('K', 1, 2)                 ],
    [                 ns('L', 1, 2),                  ns('M', 1, 1) ]
  ]
  );
  ////////////////////////////////////////////////////
  check('square in top left of complex table from polish demo',
  [
    [  s('A', 1, 1),   s('B', 2, 2) ],
    [  s('D', 1, 1)                 ]
  ],
  [
    [  s('A', 1, 1),   s('B', 2, 2),                  ns('C', 1, 1) ],
    [  s('D', 1, 1),                                  ns('E', 2, 1) ],
    [ ns('F', 3, 3)                                                 ],
    [                                                 ns('G', 1, 1) ],
    [                                                 ns('H', 1, 1) ],
    [ ns('I', 2, 1),  ns('J', 1, 1),  ns('K', 1, 2)                 ],
    [                 ns('L', 1, 2),                  ns('M', 1, 1) ]
  ]
  );
  ////////////////////////////////////////////////////
  check('column from right side of complex table from polish demo',
  [
    [  s('C')        ],
    [  s('E')        ],
    [  s('G')        ],
    [  s('H')        ]
  ],
  [
    [ ns('A', 1, 1),  ns('B', 2, 2),                   s('C', 1, 1) ],
    [ ns('D', 1, 1),                                   s('E', 2, 1) ],
    [ ns('F', 3, 3)                                                 ],
    [                                                  s('G', 1, 1) ],
    [                                                  s('H', 1, 1) ],
    [ ns('I', 2, 1),  ns('J', 1, 1),  ns('K', 1, 2)                 ],
    [                 ns('L', 1, 2),                  ns('M', 1, 1) ]
  ]
  );
  ////////////////////////////////////////////////////
  check('non rectangular small portion of complex table from polish demo',
  [
    [  gen(),         s('K', 1, 2)                  ],
    [  s('L', 1, 2),                   s('M', 1, 1) ]
  ],
  [ // K L M
    [ ns('A', 1, 1),  ns('B', 2, 2),                  ns('C', 1, 1) ],
    [ ns('D', 1, 1),                                  ns('E', 2, 1) ],
    [ ns('F', 3, 3)                                                 ],
    [                                                 ns('G', 1, 1) ],
    [                                                 ns('H', 1, 1) ],
    [ ns('I', 2, 1),  ns('J', 1, 1),   s('K', 1, 2)                 ],
    [                  s('L', 1, 2),                   s('M', 1, 1) ]
  ]
  );
  ////////////////////////////////////////////////////
  check('non rectangular complex middle of complex table from polish demo',
  [
    [  gen(),          s('B', 2, 2),                  gen() ],
    [  gen(),                                         gen() ],
    [  s('F', 3, 3),                                  gen() ],
    [                                                 gen() ],
    [                                                 gen() ],
    [  gen(),          s('J', 1, 1),   s('K', 1, 2)         ]
  ],
  [ // B F J K
    [ ns('A', 1, 1),   s('B', 2, 2),                  ns('C', 1, 1) ],
    [ ns('D', 1, 1),                                  ns('E', 2, 1) ],
    [  s('F', 3, 3)                                                 ],
    [                                                 ns('G', 1, 1) ],
    [                                                 ns('H', 1, 1) ],
    [ ns('I', 2, 1),   s('J', 1, 1),   s('K', 1, 2)                 ],
    [                 ns('L', 1, 2),                  ns('M', 1, 1) ]
  ]
  );
});
