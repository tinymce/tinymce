import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Obj, Type } from '@ephox/katamari';
import { Attribute, Class, Html, InsertAll, SugarElement } from '@ephox/sugar';

import * as CopySelected from 'ephox/snooker/api/CopySelected';
import { LOCKED_COL_ATTR } from 'ephox/snooker/util/LockedColumnUtils';

interface TestDataCell {
  readonly type: 'cell';
  readonly selected: boolean;
  readonly html: string;
  readonly rowspan?: string;
  readonly colspan?: string;
  readonly locked?: boolean;
}

interface TestDataCol {
  readonly type: 'col';
  readonly id: string;
  readonly span?: string;
}

type TestData = TestDataCell | TestDataCol;

interface TableAttributes {
  readonly beforeCopy: Record<string, string | boolean | number>; // attributes to set on the table before copy
  readonly afterCopy: string[]; // attributes that should not be on the table after copy
}

UnitTest.test('CopySelectedTest', () => {
  // normally this is darwin ephemera, but doesn't actually matter what it is
  const SEL_CLASS = 'copy-selected';

  // traverse really needs this built in
  const traverseChildElements = (e: SugarElement<Element>) => {
    return Arr.map(e.dom.children, SugarElement.fromDom);
  };

  // data objects for input/expected
  const dCell = (selected: boolean) => {
    return (text: string, rowspan?: number, colspan?: number, locked: boolean = false): TestDataCell => {
      return {
        type: 'cell',
        selected,
        html: text,
        rowspan: rowspan === undefined ? undefined : String(rowspan),
        colspan: colspan === undefined ? undefined : String(colspan),
        locked
      };
    };
  };

  const dCol = (id: string, span?: number): TestDataCol => ({
    type: 'col',
    id,
    span: span === undefined ? undefined : String(span),
  });

  const s = dCell(true);
  const ns = dCell(false);
  const gen = () => ns('<br>');

  // generate a table structure from a nested array
  const generateInput = (input: TestData[][]): SugarElement<HTMLTableElement> => {
    const lockedCols: Record<number, true> = {};
    const table = SugarElement.fromTag('table');
    const rows = Arr.map(input, (row) => {
      let isCellRow = true;
      const cells = Arr.map(row, (cell, idx) => {
        if (cell.type === 'cell') {
          const td = SugarElement.fromTag('td');
          if (cell.rowspan !== undefined) {
            Attribute.set(td, 'rowspan', cell.rowspan);
          }
          if (cell.colspan !== undefined) {
            Attribute.set(td, 'colspan', cell.colspan);
          }
          if (cell.selected) {
            Class.add(td, SEL_CLASS);
          }
          if (cell.locked) {
            lockedCols[idx] = true;
          }
          Html.set(td, cell.html);
          return td;
        } else {
          isCellRow = false;
          const col = SugarElement.fromTag('col');
          if (cell.span !== undefined) {
            Attribute.set(col, 'span', cell.span);
          }
          Attribute.set(col, 'data-col-id', cell.id);
          return col;
        }
      });

      if (isCellRow) {
        const tr = SugarElement.fromTag('tr');
        InsertAll.append(tr, cells);
        return tr;
      } else {
        const colgroup = SugarElement.fromTag('colgroup');
        InsertAll.append(colgroup, cells);
        return colgroup;
      }
    });
    const withNewlines = Arr.bind(rows, (row) => {
      return [ SugarElement.fromText('\n'), row ];
    });
    InsertAll.append(table, withNewlines.concat(SugarElement.fromText('\n')));
    // Add locked col attribute to table
    if (Obj.size(lockedCols) > 0) {
      const lockedColStr = Obj.keys(lockedCols).join(',');
      Attribute.set(table, LOCKED_COL_ATTR, lockedColStr);
    }
    return table;
  };

  const check = (label: string, expected: TestData[][], input: TestData[][], tableAttributes?: TableAttributes) => {
    const table = generateInput(input);
    if (Type.isNonNullable(tableAttributes)) {
      Attribute.setAll(table, tableAttributes.beforeCopy);
    }

    const replica = CopySelected.extract(table, '.' + SEL_CLASS);

    // Verify specified table attributes are not present in replica table
    if (Type.isNonNullable(tableAttributes)) {
      Arr.each(tableAttributes.afterCopy, (attrName) => {
        Assert.eq('', false, Attribute.has(replica, attrName));
      });
    }

    // Now verify that the table matches the nested array structure of expected
    const assertWithInfo = <T> (exp: T, actual: T, info: string) => {
      Assert.eq(() => 'expected ' + info + ' "' + exp + '", was "' + actual + '"' + ', test "' + label + '". Output HTML:\n' + Html.getOuter(replica), exp, actual);
    };

    const domRows = traverseChildElements(replica);
    assertWithInfo(expected.length, domRows.length, 'number of rows');
    Arr.each(expected, (row, i) => {
      const domCells = traverseChildElements(domRows[i]);
      assertWithInfo(row.length, domCells.length, 'number of cells in output row ' + i + ' to be ');
      Arr.each(row, (cell, j) => {
        if (cell.type === 'cell') {
          const domCell = domCells[j] as SugarElement<HTMLTableCellElement>;
          assertWithInfo(cell.html, Html.get(domCell), 'cell text');
          assertWithInfo(cell.rowspan, Attribute.get(domCell, 'rowspan'), 'rowspan');
          assertWithInfo(cell.colspan, Attribute.get(domCell, 'colspan'), 'colspan');
          assertWithInfo(cell.selected, Class.has(domCell, SEL_CLASS), 'selected class');
        } else {
          const domCol = domCells[j] as SugarElement<HTMLTableColElement>;
          assertWithInfo(cell.id, Attribute.get(domCol, 'data-col-id'), 'col id');
          assertWithInfo(cell.span, Attribute.get(domCol, 'span'), 'span');
        }
      });
    });
  };
  // visual test separator
  // //////////////////////////////////////////////////
  check('entire table, single cell',
    [
      [ s('A') ]
    ],
    [
      [ s('A', 1, 1) ]
    ]);

  check('entire table, single cell, colgroup',
    [
      [ dCol('1') ],
      [ s('A') ]
    ],
    [
      [ dCol('1') ],
      [ s('A', 1, 1) ]
    ]);
  // //////////////////////////////////////////////////
  check('entire table, simple',
    [
      [ s('A', 1, 1), s('B', 1, 1) ],
      [ s('C', 1, 1), s('D', 1, 1) ]
    ],
    [
      [ s('A', 1, 1), s('B', 1, 1) ],
      [ s('C', 1, 1), s('D', 1, 1) ]
    ]);

  check('entire table, simple, colgroup',
    [
      [ dCol('1'), dCol('2') ],
      [ s('A', 1, 1), s('B', 1, 1) ],
      [ s('C', 1, 1), s('D', 1, 1) ]
    ],
    [
      [ dCol('1'), dCol('2') ],
      [ s('A', 1, 1), s('B', 1, 1) ],
      [ s('C', 1, 1), s('D', 1, 1) ]
    ]);
  // //////////////////////////////////////////////////
  const entireComplex = [
    [ s('A', 2, 2), s('B', 1, 1) ],
    [ s('C', 1, 1) ],
    [ s('D', 1, 1), s('E', 1, 1), s('F', 1, 1) ]
  ];
  const entireComplexColgroup = [
    [ dCol('1'), dCol('2'), dCol('3') ],
    ...entireComplex
  ];
  check('entire table, complex', entireComplex, entireComplex);
  check('entire table, complex, colgroup', entireComplexColgroup, entireComplexColgroup);
  // //////////////////////////////////////////////////
  check('single row, simple',
    [
      [ s('A'), s('B'), s('C') ]
    ],
    [
      [ s('A', 1, 1), s('B', 1, 1), s('C', 1, 1) ],
      [ ns('D', 1, 2), ns('E', 1, 1) ]
    ]);

  check('single row, simple, colgroup',
    [
      [ dCol('1'), dCol('2'), dCol('3') ],
      [ s('A'), s('B'), s('C') ]
    ],
    [
      [ dCol('1'), dCol('2'), dCol('3') ],
      [ s('A', 1, 1), s('B', 1, 1), s('C', 1, 1) ],
      [ ns('D', 1, 2), ns('E', 1, 1) ]
    ]);
  // //////////////////////////////////////////////////
  check('single row, removing colspans',
    [
      [ s('A'), s('B'), s('C') ]
    ],
    [
      [ s('A', 1, 1), s('B', 1, 2), s('C', 1, 1) ],
      [ ns('D', 1, 2), ns('E', 1, 1), ns('F', 1, 1) ]
    ]);

  check('single row, removing colspans, colgroup',
    [
      [ dCol('1'), dCol('2'), dCol('3'), dCol('4') ],
      [ s('A'), s('B'), s('C') ]
    ],
    [
      [ dCol('1'), dCol('2'), dCol('3'), dCol('4') ],
      [ s('A', 1, 1), s('B', 1, 2), s('C', 1, 1) ],
      [ ns('D', 1, 2), ns('E', 1, 1), ns('F', 1, 1) ]
    ]);
  // //////////////////////////////////////////////////
  check('single column, simple',
    [
      [ s('A') ],
      [ s('D') ],
      [ s('G') ]
    ],
    [
      [ s('A', 1, 1), ns('B', 1, 1), ns('C', 1, 1) ],
      [ s('D', 1, 1), ns('E', 1, 1), ns('F', 1, 1) ],
      [ s('G', 1, 1), ns('H', 1, 1), ns('I', 1, 1) ]
    ]);

  check('single column, simple, colgroup',
    [
      [ dCol('1') ],
      [ s('A') ],
      [ s('D') ],
      [ s('G') ]
    ],
    [
      [ dCol('1'), dCol('2'), dCol('3') ],
      [ s('A', 1, 1), ns('B', 1, 1), ns('C', 1, 1) ],
      [ s('D', 1, 1), ns('E', 1, 1), ns('F', 1, 1) ],
      [ s('G', 1, 1), ns('H', 1, 1), ns('I', 1, 1) ]
    ]);
  // //////////////////////////////////////////////////
  check('single column, removing rowspans',
    [
      [ s('A') ],
      [ s('D') ],
      [ s('I') ]
    ],
    [
      [ s('A', 1, 1), ns('B', 1, 1), ns('C', 1, 1) ],
      [ s('D', 2, 1), ns('E', 1, 1), ns('F', 1, 1) ],
      [ ns('G', 1, 1), ns('H', 1, 1) ],
      [ s('I', 1, 1), ns('J', 1, 1), ns('K', 1, 1) ]
    ]);

  check('single column, removing rowspans, colgroup',
    [
      [ dCol('1') ],
      [ s('A') ],
      [ s('D') ],
      [ s('I') ]
    ],
    [
      [ dCol('1'), dCol('2'), dCol('3') ],
      [ s('A', 1, 1), ns('B', 1, 1), ns('C', 1, 1) ],
      [ s('D', 2, 1), ns('E', 1, 1), ns('F', 1, 1) ],
      [ ns('G', 1, 1), ns('H', 1, 1) ],
      [ s('I', 1, 1), ns('J', 1, 1), ns('K', 1, 1) ]
    ]);
  // //////////////////////////////////////////////////
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
  // //////////////////////////////////////////////////
  check('non rectangular square in top right of complex table from polish demo',
    [
      [ s('B', 2, 2), s('C', 1, 1) ],
      [ s('E', 2, 1) ],
      [ gen(), gen() ]
    ],
    [
      [ ns('A', 1, 1), s('B', 2, 2), s('C', 1, 1) ],
      [ ns('D', 1, 1), s('E', 2, 1) ],
      [ ns('F', 3, 3) ],
      [ ns('G', 1, 1) ],
      [ ns('H', 1, 1) ],
      [ ns('I', 2, 1), ns('J', 1, 1), ns('K', 1, 2) ],
      [ ns('L', 1, 2), ns('M', 1, 1) ]
    ]
  );

  check('non rectangular square in top right of complex table from polish demo, colgroup',
    [
      [ dCol('2'), dCol('3'), dCol('4') ],
      [ s('B', 2, 2), s('C', 1, 1) ],
      [ s('E', 2, 1) ],
      [ gen(), gen() ]
    ],
    [
      [ dCol('1'), dCol('2'), dCol('3'), dCol('4') ],
      [ ns('A', 1, 1), s('B', 2, 2), s('C', 1, 1) ],
      [ ns('D', 1, 1), s('E', 2, 1) ],
      [ ns('F', 3, 3) ],
      [ ns('G', 1, 1) ],
      [ ns('H', 1, 1) ],
      [ ns('I', 2, 1), ns('J', 1, 1), ns('K', 1, 2) ],
      [ ns('L', 1, 2), ns('M', 1, 1) ]
    ]
  );
  // //////////////////////////////////////////////////
  check('square in top left of complex table from polish demo',
    [
      [ s('A', 1, 1), s('B', 2, 2) ],
      [ s('D', 1, 1) ]
    ],
    [
      [ s('A', 1, 1), s('B', 2, 2), ns('C', 1, 1) ],
      [ s('D', 1, 1), ns('E', 2, 1) ],
      [ ns('F', 3, 3) ],
      [ ns('G', 1, 1) ],
      [ ns('H', 1, 1) ],
      [ ns('I', 2, 1), ns('J', 1, 1), ns('K', 1, 2) ],
      [ ns('L', 1, 2), ns('M', 1, 1) ]
    ]
  );

  check('square in top left of complex table from polish demo, colgroup',
    [
      [ dCol('1'), dCol('2'), dCol('3') ],
      [ s('A', 1, 1), s('B', 2, 2) ],
      [ s('D', 1, 1) ]
    ],
    [
      [ dCol('1'), dCol('2'), dCol('3'), dCol('4') ],
      [ s('A', 1, 1), s('B', 2, 2), ns('C', 1, 1) ],
      [ s('D', 1, 1), ns('E', 2, 1) ],
      [ ns('F', 3, 3) ],
      [ ns('G', 1, 1) ],
      [ ns('H', 1, 1) ],
      [ ns('I', 2, 1), ns('J', 1, 1), ns('K', 1, 2) ],
      [ ns('L', 1, 2), ns('M', 1, 1) ]
    ]
  );
  // //////////////////////////////////////////////////
  check('column from right side of complex table from polish demo',
    [
      [ s('C') ],
      [ s('E') ],
      [ s('G') ],
      [ s('H') ]
    ],
    [
      [ ns('A', 1, 1), ns('B', 2, 2), s('C', 1, 1) ],
      [ ns('D', 1, 1), s('E', 2, 1) ],
      [ ns('F', 3, 3) ],
      [ s('G', 1, 1) ],
      [ s('H', 1, 1) ],
      [ ns('I', 2, 1), ns('J', 1, 1), ns('K', 1, 2) ],
      [ ns('L', 1, 2), ns('M', 1, 1) ]
    ]
  );

  check('column from right side of complex table from polish demo, colgroup',
    [
      [ dCol('4') ],
      [ s('C') ],
      [ s('E') ],
      [ s('G') ],
      [ s('H') ]
    ],
    [
      [ dCol('1'), dCol('2'), dCol('3'), dCol('4') ],
      [ ns('A', 1, 1), ns('B', 2, 2), s('C', 1, 1) ],
      [ ns('D', 1, 1), s('E', 2, 1) ],
      [ ns('F', 3, 3) ],
      [ s('G', 1, 1) ],
      [ s('H', 1, 1) ],
      [ ns('I', 2, 1), ns('J', 1, 1), ns('K', 1, 2) ],
      [ ns('L', 1, 2), ns('M', 1, 1) ]
    ]
  );
  // //////////////////////////////////////////////////
  check('non rectangular small portion of complex table from polish demo',
    [
      [ gen(), s('K', 1, 2) ],
      [ s('L', 1, 2), s('M', 1, 1) ]
    ],
    [ // K L M
      [ ns('A', 1, 1), ns('B', 2, 2), ns('C', 1, 1) ],
      [ ns('D', 1, 1), ns('E', 2, 1) ],
      [ ns('F', 3, 3) ],
      [ ns('G', 1, 1) ],
      [ ns('H', 1, 1) ],
      [ ns('I', 2, 1), ns('J', 1, 1), s('K', 1, 2) ],
      [ s('L', 1, 2), s('M', 1, 1) ]
    ]
  );

  check('non rectangular small portion of complex table from polish demo, colgroup',
    [
      [ dCol('2'), dCol('3'), dCol('4') ],
      [ gen(), s('K', 1, 2) ],
      [ s('L', 1, 2), s('M', 1, 1) ]
    ],
    [ // K L M
      [ dCol('1'), dCol('2'), dCol('3'), dCol('4') ],
      [ ns('A', 1, 1), ns('B', 2, 2), ns('C', 1, 1) ],
      [ ns('D', 1, 1), ns('E', 2, 1) ],
      [ ns('F', 3, 3) ],
      [ ns('G', 1, 1) ],
      [ ns('H', 1, 1) ],
      [ ns('I', 2, 1), ns('J', 1, 1), s('K', 1, 2) ],
      [ s('L', 1, 2), s('M', 1, 1) ]
    ]
  );
  // //////////////////////////////////////////////////
  check('non rectangular complex middle of complex table from polish demo',
    [
      [ gen(), s('B', 2, 2), gen() ],
      [ gen(), gen() ],
      [ s('F', 3, 3), gen() ],
      [ gen() ],
      [ gen() ],
      [ gen(), s('J', 1, 1), s('K', 1, 2) ]
    ],
    [ // B F J K
      [ ns('A', 1, 1), s('B', 2, 2), ns('C', 1, 1) ],
      [ ns('D', 1, 1), ns('E', 2, 1) ],
      [ s('F', 3, 3) ],
      [ ns('G', 1, 1) ],
      [ ns('H', 1, 1) ],
      [ ns('I', 2, 1), s('J', 1, 1), s('K', 1, 2) ],
      [ ns('L', 1, 2), ns('M', 1, 1) ]
    ]
  );

  check('non rectangular complex middle of complex table from polish demo, colgroup',
    [
      [ dCol('1'), dCol('2'), dCol('3'), dCol('4') ],
      [ gen(), s('B', 2, 2), gen() ],
      [ gen(), gen() ],
      [ s('F', 3, 3), gen() ],
      [ gen() ],
      [ gen() ],
      [ gen(), s('J', 1, 1), s('K', 1, 2) ]
    ],
    [ // B F J K
      [ dCol('1'), dCol('2'), dCol('3'), dCol('4') ],
      [ ns('A', 1, 1), s('B', 2, 2), ns('C', 1, 1) ],
      [ ns('D', 1, 1), ns('E', 2, 1) ],
      [ s('F', 3, 3) ],
      [ ns('G', 1, 1) ],
      [ ns('H', 1, 1) ],
      [ ns('I', 2, 1), s('J', 1, 1), s('K', 1, 2) ],
      [ ns('L', 1, 2), ns('M', 1, 1) ]
    ]
  );
  // //////////////////////////////////////////////////
  check('single column, simple with locked cells',
    [
      [ s('A') ],
      [ s('D') ],
      [ s('G') ]
    ],
    [
      [ s('A', 1, 1, true), ns('B', 1, 1), ns('C', 1, 1) ],
      [ s('D', 1, 1, true), ns('E', 1, 1), ns('F', 1, 1) ],
      [ s('G', 1, 1, true), ns('H', 1, 1), ns('I', 1, 1) ]
    ], { beforeCopy: {}, afterCopy: [ LOCKED_COL_ATTR ] });

  check('single column, simple with locked cells, colgroup',
    [
      [ dCol('1') ],
      [ s('A') ],
      [ s('D') ],
      [ s('G') ]
    ],
    [
      [ dCol('1'), dCol('2'), dCol('3') ],
      [ s('A', 1, 1, true), ns('B', 1, 1), ns('C', 1, 1) ],
      [ s('D', 1, 1, true), ns('E', 1, 1), ns('F', 1, 1) ],
      [ s('G', 1, 1, true), ns('H', 1, 1), ns('I', 1, 1) ]
    ], { beforeCopy: {}, afterCopy: [ LOCKED_COL_ATTR ] });
  // //////////////////////////////////////////////////
  check('single column, simple with removable table attributes',
    [
      [ s('A') ],
      [ s('D') ],
      [ s('G') ]
    ],
    [
      [ s('A', 1, 1), ns('B', 1, 1), ns('C', 1, 1) ],
      [ s('D', 1, 1), ns('E', 1, 1), ns('F', 1, 1) ],
      [ s('G', 1, 1), ns('H', 1, 1), ns('I', 1, 1) ]
    ],
    {
      beforeCopy: {
        [LOCKED_COL_ATTR]: '0',
        'data-snooker-col-series': 'numbers'
      },
      afterCopy: [ LOCKED_COL_ATTR, 'data-snooker-col-series' ]
    }
  );

  check('single column, simple with removable table attributes, colgroup',
    [
      [ dCol('1') ],
      [ s('A') ],
      [ s('D') ],
      [ s('G') ]
    ],
    [
      [ dCol('1'), dCol('2'), dCol('3') ],
      [ s('A', 1, 1), ns('B', 1, 1), ns('C', 1, 1) ],
      [ s('D', 1, 1), ns('E', 1, 1), ns('F', 1, 1) ],
      [ s('G', 1, 1), ns('H', 1, 1), ns('I', 1, 1) ]
    ],
    {
      beforeCopy: {
        [LOCKED_COL_ATTR]: '0',
        'data-snooker-col-series': 'numbers'
      },
      afterCopy: [ LOCKED_COL_ATTR, 'data-snooker-col-series' ]
    }
  );
// //////////////////////////////////////////////////
});
