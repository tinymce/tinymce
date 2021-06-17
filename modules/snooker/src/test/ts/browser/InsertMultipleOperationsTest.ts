import { context, describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import * as TableOperations from 'ephox/snooker/api/TableOperations';
import * as Assertions from 'ephox/snooker/test/Assertions';

describe('browser.snooker.InsertMultipleOperationsTest', () => {
  context('insertColumnsBefore', () => {
    it('TBA: the same number of columns are inserted that are selected', () => {
      Assertions.checkOldMultiple('', Optional.some({ section: 0, row: 0, column: 1 }),
        '<table><tbody>' +
        '<tr><td>A1</td><td>?</td><td>?</td><td>B1</td><td>C1</td></tr>' +
        '<tr><td>A2</td><td>?</td><td>?</td><td>B2</td><td>C2</td></tr>' +
        '</tbody></table>',

        '<table><tbody>' +
        '<tr><td>A1</td><td>B1</td><td>C1</td></tr>' +
        '<tr><td>A2</td><td>B2</td><td>C2</td></tr>' +
        '</tbody></table>',

        TableOperations.insertColumnsBefore, [
          { section: 0, row: 0, column: 1 },
          { section: 0, row: 0, column: 2 }
        ]
      );
    });

    it('TBA: the same number of columns are inserted when the range selection includes a colspan', () => {
      Assertions.checkOldMultiple('', Optional.some({ section: 0, row: 0, column: 1 }),
        '<table><tbody>' +
        '<tr><td>A1</td><td>?</td><td>?</td><td colspan="2">B1</td></tr>' +
        '<tr><td>A2</td><td>?</td><td>?</td><td>B2</td><td>C2</td></tr>' +
        '</tbody></table>',

        '<table><tbody>' +
        '<tr><td>A1</td><td colspan="2">B1</td></tr>' +
        '<tr><td>A2</td><td>B2</td><td>C2</td></tr>' +
        '</tbody></table>',

        TableOperations.insertColumnsBefore, [
          { section: 0, row: 0, column: 1 },
          { section: 0, row: 1, column: 2 }
        ]
      );
    });

    it('TINY-6906: copy each individual column when inserting new columns', () => {
      Assertions.checkOldMultiple('', Optional.some({ section: 0, row: 0, column: 0 }),
        '<table><tbody>' +
        '<tr><td style="color: red;">?</td><td style="color: blue;">?</td><td style="color: red;">A1</td><td style="color: blue;">B1</td></tr>' +
        '<tr><td style="color: red;">?</td><td style="color: blue;">?</td><td style="color: red;">A2</td><td style="color: blue;">B2</td></tr>' +
        '</tbody></table>',

        '<table><tbody>' +
        '<tr><td style="color: red;">A1</td><td style="color: blue;">B1</td></tr>' +
        '<tr><td style="color: red;">A2</td><td style="color: blue;">B2</td></tr>' +
        '</tbody></table>',

        TableOperations.insertColumnsBefore, [
          { section: 0, row: 0, column: 0 },
          { section: 0, row: 1, column: 1 }
        ]
      );
    });
  });

  context('insertColumnsAfter', () => {
    it('TBA: the same number of columns are inserted that are selected', () => {
      Assertions.checkOldMultiple('', Optional.some({ section: 0, row: 0, column: 2 }),
        '<table><tbody>' +
        '<tr><td>A1</td><td>B1</td><td>?</td><td>?</td><td>C1</td></tr>' +
        '<tr><td>A2</td><td>B2</td><td>?</td><td>?</td><td>C2</td></tr>' +
        '</tbody></table>',

        '<table><tbody>' +
        '<tr><td>A1</td><td>B1</td><td>C1</td></tr>' +
        '<tr><td>A2</td><td>B2</td><td>C2</td></tr>' +
        '</tbody></table>',

        TableOperations.insertColumnsAfter, [
          { section: 0, row: 0, column: 0 },
          { section: 0, row: 0, column: 1 }
        ]
      );
    });

    it('TBA: the same number of columns are inserted when the range selection includes a colspan', () => {
      Assertions.checkOldMultiple('', Optional.some({ section: 0, row: 0, column: 1 }),
        '<table><tbody>' +
        '<tr><td colspan="2">A1</td><td>?</td><td>?</td><td>C1</td></tr>' +
        '<tr><td>A2</td><td>B2</td><td>?</td><td>?</td><td>C2</td></tr>' +
        '</tbody></table>',

        '<table><tbody>' +
        '<tr><td colspan="2">A1</td><td>C1</td></tr>' +
        '<tr><td>A2</td><td>B2</td><td>C2</td></tr>' +
        '</tbody></table>',

        TableOperations.insertColumnsAfter, [
          { section: 0, row: 0, column: 0 },
          { section: 0, row: 1, column: 1 }
        ]
      );
    });

    it('TINY-6906: copy each individual column when inserting new columns', () => {
      Assertions.checkOldMultiple('', Optional.some({ section: 0, row: 0, column: 2 }),
        '<table><tbody>' +
        '<tr><td style="color: red;">A1</td><td style="color: blue;">B1</td><td style="color: red;">?</td><td style="color: blue;">?</td></tr>' +
        '<tr><td style="color: red;">A2</td><td style="color: blue;">B2</td><td style="color: red;">?</td><td style="color: blue;">?</td></tr>' +
        '</tbody></table>',

        '<table><tbody>' +
        '<tr><td style="color: red;">A1</td><td style="color: blue;">B1</td></tr>' +
        '<tr><td style="color: red;">A2</td><td style="color: blue;">B2</td></tr>' +
        '</tbody></table>',

        TableOperations.insertColumnsAfter, [
          { section: 0, row: 0, column: 0 },
          { section: 0, row: 1, column: 1 }
        ]
      );
    });
  });

  context('insertRowsBefore', () => {
    it('TBA: the same number of rows are inserted that are selected', () => {
      Assertions.checkOldMultiple('', Optional.some({ section: 0, row: 1, column: 0 }),
        '<table><tbody>' +
        '<tr><td>A1</td><td>B1</td></tr>' +
        '<tr><td>?</td><td>?</td></tr>' +
        '<tr><td>?</td><td>?</td></tr>' +
        '<tr><td>A2</td><td>B2</td></tr>' +
        '<tr><td>A3</td><td>B3</td></tr>' +
        '</tbody></table>',

        '<table><tbody>' +
        '<tr><td>A1</td><td>B1</td></tr>' +
        '<tr><td>A2</td><td>B2</td></tr>' +
        '<tr><td>A3</td><td>B3</td></tr>' +
        '</tbody></table>',

        TableOperations.insertRowsBefore, [
          { section: 0, row: 1, column: 0 },
          { section: 0, row: 2, column: 0 }
        ]
      );
    });

    it('TBA: the same number of rows are inserted when the range selection includes a rowspan', () => {
      Assertions.checkOldMultiple('', Optional.some({ section: 0, row: 1, column: 0 }),
        '<table><tbody>' +
        '<tr><td>A1</td><td>B1</td></tr>' +
        '<tr><td>?</td><td>?</td></tr>' +
        '<tr><td>?</td><td>?</td></tr>' +
        '<tr><td rowspan="2">A2</td><td>B2</td></tr>' +
        '<tr><td>B3</td></tr>' +
        '</tbody></table>',

        '<table><tbody>' +
        '<tr><td>A1</td><td>B1</td></tr>' +
        '<tr><td rowspan="2">A2</td><td>B2</td></tr>' +
        '<tr><td>B3</td></tr>' +
        '</tbody></table>',

        TableOperations.insertRowsBefore, [
          { section: 0, row: 1, column: 0 },
          { section: 0, row: 2, column: 0 }
        ]
      );
    });

    it('TINY-6906: copy each individual rows when inserting new rows', () => {
      Assertions.checkOldMultiple('', Optional.some({ section: 0, row: 0, column: 0 }),
        '<table><tbody>' +
        '<tr><td style="color: red;">?</td><td style="color: red;">?</td></tr>' +
        '<tr><td style="color: blue;">?</td><td style="color: blue;">?</td></tr>' +
        '<tr><td style="color: red;">A1</td><td style="color: red;">B1</td></tr>' +
        '<tr><td style="color: blue;">A2</td><td style="color: blue;">B2</td></tr>' +
        '</tbody></table>',

        '<table><tbody>' +
        '<tr><td style="color: red;">A1</td><td style="color: red;">B1</td></tr>' +
        '<tr><td style="color: blue;">A2</td><td style="color: blue;">B2</td></tr>' +
        '</tbody></table>',

        TableOperations.insertRowsBefore, [
          { section: 0, row: 0, column: 0 },
          { section: 0, row: 1, column: 1 }
        ]
      );
    });
  });

  context('insertRowsAfter', () => {
    it('TBA: the same number of rows are inserted that are selected', () => {
      Assertions.checkOldMultiple('', Optional.some({ section: 0, row: 2, column: 0 }),
        '<table><tbody>' +
        '<tr><td>A1</td><td>B1</td></tr>' +
        '<tr><td>A2</td><td>B2</td></tr>' +
        '<tr><td>?</td><td>?</td></tr>' +
        '<tr><td>?</td><td>?</td></tr>' +
        '<tr><td>A3</td><td>B3</td></tr>' +
        '</tbody></table>',

        '<table><tbody>' +
        '<tr><td>A1</td><td>B1</td></tr>' +
        '<tr><td>A2</td><td>B2</td></tr>' +
        '<tr><td>A3</td><td>B3</td></tr>' +
        '</tbody></table>',

        TableOperations.insertRowsAfter, [
          { section: 0, row: 0, column: 0 },
          { section: 0, row: 1, column: 0 }
        ]
      );
    });

    it('TBA: the same number of rows are inserted when the range selection includes a rowspan', () => {
      Assertions.checkOldMultiple('', Optional.some({ section: 0, row: 2, column: 0 }),
        '<table><tbody>' +
        '<tr><td rowspan="2">A1</td><td>B1</td></tr>' +
        '<tr><td>B2</td></tr>' +
        '<tr><td>?</td><td>?</td></tr>' +
        '<tr><td>?</td><td>?</td></tr>' +
        '<tr><td>A3</td><td>B3</td></tr>' +
        '</tbody></table>',

        '<table><tbody>' +
        '<tr><td rowspan="2">A1</td><td>B1</td></tr>' +
        '<tr><td>B2</td></tr>' +
        '<tr><td>A3</td><td>B3</td></tr>' +
        '</tbody></table>',

        TableOperations.insertRowsAfter, [
          { section: 0, row: 0, column: 0 },
          { section: 0, row: 1, column: 0 }
        ]
      );
    });

    it('TINY-6906: copy each individual row when inserting new rows', () => {
      Assertions.checkOldMultiple('', Optional.some({ section: 0, row: 2, column: 0 }),
        '<table><tbody>' +
        '<tr><td style="color: red;">A1</td><td style="color: red;">B1</td></tr>' +
        '<tr><td style="color: blue;">A2</td><td style="color: blue;">B2</td></tr>' +
        '<tr><td style="color: red;">?</td><td style="color: red;">?</td></tr>' +
        '<tr><td style="color: blue;">?</td><td style="color: blue;">?</td></tr>' +
        '</tbody></table>',

        '<table><tbody>' +
        '<tr><td style="color: red;">A1</td><td style="color: red;">B1</td></tr>' +
        '<tr><td style="color: blue;">A2</td><td style="color: blue;">B2</td></tr>' +
        '</tbody></table>',

        TableOperations.insertRowsAfter, [
          { section: 0, row: 0, column: 0 },
          { section: 0, row: 1, column: 1 }
        ]
      );
    });
  });
});
