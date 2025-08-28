import { UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import * as TableOperations from 'ephox/snooker/api/TableOperations';
import * as Assertions from 'ephox/snooker/test/Assertions';
import { generateTestTable } from 'ephox/snooker/test/CreateTableUtils';

UnitTest.test('InsertOperationsTest', () => {
  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    '<table><tbody>' +
    '<tr><td>?</td><td>?</td></tr>' +
    '<tr><td>A1</td><td>B1</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
    '<tr><td>A1</td><td>B1</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowBefore, 0, 0, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 1, column: 0 }),
    '<table><tbody>' +
    '<tr><td>A1</td><td>B1</td></tr>' +
    '<tr><td>?</td><td>?</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
    '<tr><td>A1</td><td>B1</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowBefore, 0, 1, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    '<table><tbody>' +
    '<tr><td>?</td><td>?</td></tr>' +
    '<tr><td>' +
    '<table><tbody>' +
    '<tr><td>1A</td><td>1B</td></tr>' +
    '<tr><td>2A</td><td>2B</td></tr>' +
    '</tbody></table>' +
    'A1</td><td>B1</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
    '<tr><td>' +
    '<table><tbody>' +
    '<tr><td>1A</td><td>1B</td></tr>' +
    '<tr><td>2A</td><td>2B</td></tr>' +
    '</tbody></table>' +
    'A1</td><td>B1</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowBefore, 0, 0, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 1, column: 0 }),
    '<table><tbody>' +
    '<tr><td>' +
    '<table><tbody>' +
    '<tr><td>1A</td><td>1B</td></tr>' +
    '<tr><td>2A</td><td>2B</td></tr>' +
    '</tbody></table>' +
    'A1</td><td>B1</td></tr>' +
    '<tr><td>?</td><td>?</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
    '<tr><td>' +
    '<table><tbody>' +
    '<tr><td>1A</td><td>1B</td></tr>' +
    '<tr><td>2A</td><td>2B</td></tr>' +
    '</tbody></table>' +
    'A1</td><td>B1</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowBefore, 0, 1, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 2, column: 0 }),
    '<table><tbody>' +
    '<tr><td>A1</td><td>B1</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '<tr><td>?</td><td>?</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
    '<tr><td>A1</td><td>B1</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowAfter, 0, 1, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 2, column: 0 }),
    '<table><tbody>' +
    '<tr><td>' +
    '<table><tbody>' +
    '<tr><td>1A</td><td>1B</td></tr>' +
    '<tr><td>2A</td><td>2B</td></tr>' +
    '</tbody></table>' +
    'A1</td><td>B1</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '<tr><td>?</td><td>?</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
    '<tr><td>' +
    '<table><tbody>' +
    '<tr><td>1A</td><td>1B</td></tr>' +
    '<tr><td>2A</td><td>2B</td></tr>' +
    '</tbody></table>' +
    'A1</td><td>B1</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowAfter, 0, 1, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    '<table><tbody>' +
    '<tr><td>?</td><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><td>?</td><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
    '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertColumnBefore, 0, 0, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    '<table><tbody>' +
    '<tr><td>?</td><td>' +
    '<table><tbody>' +
    '<tr><td>1A</td><td>1B</td></tr>' +
    '<tr><td>2A</td><td>2B</td></tr>' +
    '</tbody></table>' +
    'A1</td><td>B1</td></tr>' +
    '<tr><td>?</td><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
    '<tr><td>' +
    '<table><tbody>' +
    '<tr><td>1A</td><td>1B</td></tr>' +
    '<tr><td>2A</td><td>2B</td></tr>' +
    '</tbody></table>' +
    'A1</td><td>B1</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertColumnBefore, 0, 0, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 1, column: 1 }),
    '<table><tbody>' +
    '<tr><td>A1</td><td>?</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><td>A2</td><td>?</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
    '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertColumnAfter, 0, 1, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 1 }),
    '<table><tbody>' +
    '<tr><td>A1</td><td>?</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><td>A2</td><td>?</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
    '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertColumnAfter, 0, 0, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 2 }),
    '<table><tbody>' +
    '<tr><td>A1</td><td>B1</td><td>?</td><td>C1</td><td>D1</td></tr>' +
    '<tr><td>A2</td><td>B2</td><td>?</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
    '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>' +
    '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertColumnAfter, 0, 0, 1
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 1 }),
    '<table><tbody>' +
    '<tr><td>' +
    '<table><tbody>' +
    '<tr><td>1A</td><td>1B</td></tr>' +
    '<tr><td>2A</td><td>2B</td></tr>' +
    '</tbody></table>' +
    'A1</td><td>?</td><td>B1</td></tr>' +
    '<tr><td>A2</td><td>?</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
    '<tr><td>' +
    '<table><tbody>' +
    '<tr><td>1A</td><td>1B</td></tr>' +
    '<tr><td>2A</td><td>2B</td></tr>' +
    '</tbody></table>' +
    'A1</td><td>B1</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertColumnAfter, 0, 0, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 2 }),
    '<table><tbody>' +
    '<tr><td>' +
    '<table><tbody>' +
    '<tr><td>1A</td><td>1B</td></tr>' +
    '<tr><td>2A</td><td>2B</td></tr>' +
    '</tbody></table>' +
    'A1</td><td>B1</td><td>?</td></tr>' +
    '<tr><td>A2</td><td>B2</td><td>?</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
    '<tr><td>' +
    '<table><tbody>' +
    '<tr><td>1A</td><td>1B</td></tr>' +
    '<tr><td>2A</td><td>2B</td></tr>' +
    '</tbody></table>' +
    'A1</td><td>B1</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertColumnAfter, 0, 0, 1
  );

  Assertions.checkStructure({ section: 0, row: 1, column: 1 },
    [
      [ 'A', '?', 'B', 'C' ],
      [ 'D', '?', 'E' ],
      [ 'F' ],
      [ 'G' ],
      [ 'H' ],
      [ 'I', '?', 'J', 'K' ],
      [ 'L', 'M' ]
    ],

    '<table style="width: 400px; border-collapse: collapse;">' +
    '<tbody>' +
    '<tr>' +
    '<td>A</td><td rowspan="2" colspan="2">B</td><td>C</td>' +
    '</tr>' +
    '<tr><td>D</td><td colspan="1" rowspan="2">E</td></tr>' +
    '<tr><td colspan="3" rowspan="3">F</td></tr>' +
    '<tr><td>G</td></tr>' +
    '<tr><td>H</td></tr>' +
    '<tr><td rowspan="2" colspan="1">I</td><td>J</td><td colspan="2">K</td></tr>' +
    '<tr><td colspan="2">L</td><td>M</td></tr>' +
    '</tbody>' +
    '</table>',

    TableOperations.insertColumnAfter, 0, 1, 0
  );

  // Irregular tables (inserting row where one row has an irregular cell.
  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 2, column: 0 }),
    '<table><tbody>' +
    '<tr><td>A1</td><td>B1</td><td>IRREGULAR CELL</td></tr>' +
    '<tr><td>A2</td><td>B2</td><td>?</td></tr>' +
    '<tr><td>?</td><td>?</td><td>?</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
    '<tr><td>A1</td><td>B1</td><td>IRREGULAR CELL</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowAfter, 0, 1, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    '<table><thead>' +
    '<tr><td>?</td><td>?</td></tr>' +
    '<tr><td>A1</td><td>B1</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
    '<tr><td>A1</td><td>B1</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowBefore, 0, 0, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 1, row: 0, column: 0 }),
    '<table><thead>' +
    '<tr><td>A1</td><td>B1</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><td>?</td><td>?</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
    '<tr><td>A1</td><td>B1</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowBefore, 1, 0, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 1, column: 0 }),
    '<table><thead>' +
    '<tr><td>A1</td><td>B1</td></tr>' +
    '<tr><td>?</td><td>?</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
    '<tr><td>A1</td><td>B1</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowAfter, 0, 0, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 1, row: 1, column: 0 }),
    '<table><thead>' +
    '<tr><td>A1</td><td>B1</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '<tr><td>?</td><td>?</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
    '<tr><td>A1</td><td>B1</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowAfter, 1, 0, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 0, row: 0, column: 0 }),
    '<table><tbody>' +
    '<tr><td>?</td><td>?</td></tr>' +
    '<tr><td>A1</td><td>B1</td></tr>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    '<table><tbody>' +
    '<tr><td>A1</td><td>B1</td></tr>' +
    '<tr><td rowspan="2">A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowBefore, 0, 0, 0
  );

  Assertions.checkOld(
    'TBA',
    Optional.some({ section: 1, row: 1, column: 1 }),
    '<table><thead>' +
    '<tr><td>A1</td><td>B1</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><td>A2</td><td>B2</td></tr>' +
    '<tr><td>?</td><td>?</td></tr>' +
    '</tbody></table>',

    '<table><thead>' +
    '<tr><td>A1</td><td>B1</td></tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr><td rowspan="2">A2</td><td>B2</td></tr>' +
    '</tbody></table>',

    TableOperations.insertRowAfter, 1, 0, 1
  );

  Assertions.checkOld(
    'Check column can be inserted before with colgroup table and a locked column is present but is not selected',
    Optional.some({ section: 1, row: 0, column: 0 }),

    generateTestTable(
      [
        '<tr><td>?</td><td>' + generateTestTable([ '<tr><td>1A</td><td>1B</td></tr>', '<tr><td>2A</td><td>2B</td></tr>' ], [], [], { numCols: 2, colgroup: true, lockedColumns: [] }) + 'A1</td><td>B1</td></tr>',
        '<tr><td>?</td><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 3, colgroup: true, lockedColumns: [ 2 ] }
    ),

    generateTestTable(
      [
        '<tr><td>' + generateTestTable([ '<tr><td>1A</td><td>1B</td></tr>', '<tr><td>2A</td><td>2B</td></tr>' ], [], [], { numCols: 2, colgroup: true, lockedColumns: [] }) + 'A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [ 1 ] }
    ),

    TableOperations.insertColumnBefore, 1, 0, 0
  );

  Assertions.checkOld(
    'Check column can be inserted after with colgroup table and a locked column is present but is not selected',
    Optional.some({ section: 1, row: 0, column: 2 }),

    generateTestTable(
      [
        '<tr><td>' + generateTestTable([ '<tr><td>1A</td><td>1B</td></tr>', '<tr><td>2A</td><td>2B</td></tr>' ], [], [], { numCols: 2, colgroup: true, lockedColumns: [] }) + 'A1</td><td>B1</td><td>?</td></tr>',
        '<tr><td>A2</td><td>B2</td><td>?</td></tr>'
      ],
      [], [],
      { numCols: 3, colgroup: true, lockedColumns: [ 0 ] }
    ),

    generateTestTable(
      [
        '<tr><td>' + generateTestTable([ '<tr><td>1A</td><td>1B</td></tr>', '<tr><td>2A</td><td>2B</td></tr>' ], [], [], { numCols: 2, colgroup: true, lockedColumns: [] }) + 'A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [ 0 ] }
    ),

    TableOperations.insertColumnAfter, 1, 0, 1
  );

  Assertions.checkOld(
    'Check row can be inserted before with colgroup table and a locked column is present',
    Optional.some({ section: 1, row: 0, column: 0 }),

    generateTestTable(
      [
        '<tr><td>?</td><td>?</td></tr>',
        '<tr><td>' + generateTestTable([ '<tr><td>1A</td><td>1B</td></tr>', '<tr><td>2A</td><td>2B</td></tr>' ], [], [], { numCols: 2, colgroup: true, lockedColumns: [] }) + 'A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [ 0 ] }
    ),

    generateTestTable(
      [
        '<tr><td>' + generateTestTable([ '<tr><td>1A</td><td>1B</td></tr>', '<tr><td>2A</td><td>2B</td></tr>' ], [], [], { numCols: 2, colgroup: true, lockedColumns: [] }) + 'A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [ 0 ] }
    ),

    TableOperations.insertRowBefore, 1, 0, 0
  );

  Assertions.checkOld(
    'Check row can be inserted after with colgroup table and a locked column is present',
    Optional.some({ section: 1, row: 1, column: 0 }),

    generateTestTable(
      [
        '<tr><td>' + generateTestTable([ '<tr><td>1A</td><td>1B</td></tr>', '<tr><td>2A</td><td>2B</td></tr>' ], [], [], { numCols: 2, colgroup: true, lockedColumns: [] }) + 'A1</td><td>B1</td></tr>',
        '<tr><td>?</td><td>?</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [ 0 ] }
    ),

    generateTestTable(
      [
        '<tr><td>' + generateTestTable([ '<tr><td>1A</td><td>1B</td></tr>', '<tr><td>2A</td><td>2B</td></tr>' ], [], [], { numCols: 2, colgroup: true, lockedColumns: [] }) + 'A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [ 0 ] }
    ),

    TableOperations.insertRowAfter, 1, 0, 0
  );

  Assertions.checkOld(
    'TINY-6765: Check column cannot be inserted before if first column is selected and is locked (collapsed)',
    Optional.none(),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [ 0 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [ 0 ] }
    ),

    TableOperations.insertColumnBefore, 1, 0, 0
  );

  Assertions.checkOldMultiple(
    'TINY-6765: Check column cannot be inserted before if first column is selected and is locked (multi-col selection)',
    Optional.none(),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [ 0 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [ 0 ] }
    ),

    TableOperations.insertColumnsBefore,
    [
      { section: 1, row: 0, column: 0 },
      { section: 1, row: 0, column: 1 }
    ]
  );

  Assertions.checkOld(
    'TINY-6765: Check column can be inserted after if first column is selected and is locked (collapsed)',
    Optional.some({ section: 1, row: 0, column: 1 }),

    generateTestTable(
      [
        '<tr><td>A1</td><td>?</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>?</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 3, colgroup: true, lockedColumns: [ 0 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [ 0 ] }
    ),

    TableOperations.insertColumnAfter, 1, 0, 0
  );

  Assertions.checkOld(
    'TINY-6765: Check column cannot be inserted after if last column is selected and is locked (collapsed)',
    Optional.none(),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [ 1 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [ 1 ] }
    ),

    TableOperations.insertColumnAfter, 1, 0, 1
  );

  Assertions.checkOldMultiple(
    'TINY-6765: Check column cannot be inserted after if last column is selected and is locked (multi-col selection)',
    Optional.none(),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [ 1 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [ 1 ] }
    ),

    TableOperations.insertColumnsAfter,
    [
      { section: 1, row: 0, column: 0 },
      { section: 1, row: 0, column: 1 }
    ]
  );

  Assertions.checkOld(
    'TINY-6765: Check column cannot be inserted after if colspan column is selected, is locked and would result in a column being inserted at the end of the table (collapsed)',
    Optional.none(),

    generateTestTable(
      [
        '<tr><td>A1</td><td colspan="2">B1</td></tr>',
        '<tr><td>A2</td><td>B2</td><td>C2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [ 1 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td colspan="2">B1</td></tr>',
        '<tr><td>A2</td><td>B2</td><td>C2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [ 1 ] }
    ),

    TableOperations.insertColumnAfter, 1, 0, 1
  );

  Assertions.checkOld(
    'TINY-6765: Check column can be inserted before if last column is selected and is locked (collapsed)',
    Optional.none(),

    generateTestTable(
      [
        '<tr><td>A1</td><td>?</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>?</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 3, colgroup: true, lockedColumns: [ 2 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td></tr>',
        '<tr><td>A2</td><td>B2</td></tr>'
      ],
      [], [],
      { numCols: 2, colgroup: true, lockedColumns: [ 1 ] }
    ),

    TableOperations.insertColumnBefore, 1, 0, 1
  );

  Assertions.checkOld(
    'TINY-6765: Check that column can be inserted before if start of selection is a locked column that is not the first column in the table (collapsed)',
    Optional.none(),

    generateTestTable(
      [
        '<tr><td>A1</td><td>?</td><td>B1</td><td>C1</td></tr>',
        '<tr><td>A2</td><td>?</td><td>B2</td><td>C2</td></tr>'
      ],
      [], [],
      { numCols: 4, colgroup: true, lockedColumns: [ 2 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td><td>C1</td></tr>',
        '<tr><td>A2</td><td>B2</td><td>C2</td></tr>'
      ],
      [], [],
      { numCols: 3, colgroup: true, lockedColumns: [ 1 ] }
    ),

    TableOperations.insertColumnBefore, 1, 0, 1
  );

  Assertions.checkOld(
    'TINY-6765: Check that column can be inserted after if end of selection is a locked column that is not the last column in the table (collapsed)',
    Optional.none(),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td><td>?</td><td>C1</td></tr>',
        '<tr><td>A2</td><td>B2</td><td>?</td><td>C2</td></tr>'
      ],
      [], [],
      { numCols: 4, colgroup: true, lockedColumns: [ 1 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td><td>C1</td></tr>',
        '<tr><td>A2</td><td>B2</td><td>C2</td></tr>'
      ],
      [], [],
      { numCols: 3, colgroup: true, lockedColumns: [ 1 ] }
    ),

    TableOperations.insertColumnAfter, 1, 0, 1
  );

  Assertions.checkOldMultiple(
    'TINY-6765: Check that column can be inserted before if start of selection is a locked column that is not the first column in the table (multi-col selection) (locked column should count towards the number of columns inserted before)',
    Optional.none(),

    generateTestTable(
      [
        '<tr><td>A1</td><td>?</td><td>?</td><td>?</td><td>B1</td><td>C1</td><td>D1</td></tr>',
        '<tr><td>A2</td><td>?</td><td>?</td><td>?</td><td>B2</td><td>C2</td><td>D2</td></tr>'
      ],
      [], [],
      { numCols: 7, colgroup: true, lockedColumns: [ 4, 6 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>',
        '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>'
      ],
      [], [],
      { numCols: 4, colgroup: true, lockedColumns: [ 1, 3 ] }
    ),

    TableOperations.insertColumnsBefore,
    [
      { section: 1, row: 0, column: 1 },
      { section: 1, row: 0, column: 2 },
      { section: 1, row: 0, column: 3 }
    ]
  );

  Assertions.checkOldMultiple(
    'TINY-6765: Check that column can be inserted after if end of selection is a locked column that is not the last column in the table (multi-col selection) (locked columns should count towards the number of columns inserted after)',
    Optional.none(),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td><td>C1</td><td>?</td><td>?</td><td>?</td><td>D1</td></tr>',
        '<tr><td>A2</td><td>B2</td><td>C2</td><td>?</td><td>?</td><td>?</td><td>D2</td></tr>'
      ],
      [], [],
      { numCols: 7, colgroup: true, lockedColumns: [ 0, 2 ] }
    ),

    generateTestTable(
      [
        '<tr><td>A1</td><td>B1</td><td>C1</td><td>D1</td></tr>',
        '<tr><td>A2</td><td>B2</td><td>C2</td><td>D2</td></tr>'
      ],
      [], [],
      { numCols: 4, colgroup: true, lockedColumns: [ 0, 2 ] }
    ),

    TableOperations.insertColumnsAfter,
    [
      { section: 1, row: 0, column: 0 },
      { section: 1, row: 0, column: 1 },
      { section: 1, row: 0, column: 2 }
    ]
  );
});
