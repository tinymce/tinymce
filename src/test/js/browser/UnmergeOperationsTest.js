test(
  'UnmergeOperationsTest',

  [
    'ephox.snooker.test.Assertions'
  ],

  function (Assertions) {
    Assertions.checkUnmerge({ row: 0, column: 0 },
      '<table><tbody>' +
        '<tr><th>A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
        '<tr><th>?</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
        '<tr><th>?</th><td>B3</td><td>C3</td><td>D3</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
        '<tr><th rowspan="3">A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
        '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
        '<tr><td>B3</td><td>C3</td><td>D3</td></tr>' +
      '</tbody></table>',

      [
        { row: 0, column: 0 }
      ]
    );

    Assertions.checkUnmerge({ row: 0, column: 0 },
      '<table><tbody>' +
        '<tr><th>' +
        '<table><tbody>' +
          '<tr><td>1A</td><td>1B</td></tr>' +
          '<tr><td>2A</td><td>2B</td></tr>' +
        '</tbody></table>' +
        'A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
        '<tr><th>?</th><td>B2</td><td>C2</td><td>D2</td></tr>' +
        '<tr><th>?</th><td>B3</td><td>C3</td><td>D3</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
        '<tr><th rowspan="3">' +
        '<table><tbody>' +
          '<tr><td>1A</td><td>1B</td></tr>' +
          '<tr><td>2A</td><td>2B</td></tr>' +
        '</tbody></table>' +
        'A1</th><td>B1</td><td>C1</td><td>D1</td></tr>' +
        '<tr><td>B2</td><td>C2</td><td>D2</td></tr>' +
        '<tr><td>B3</td><td>C3</td><td>D3</td></tr>' +
      '</tbody></table>',

      [
        { row: 0, column: 0 }
      ]
    );

    Assertions.checkUnmerge({ row: 0, column: 0 },
      '<table><tbody>' +
        '<tr><th>A1</th><td>B1</td><td>C1</td><td>?</td></tr>' +
        '<tr><th>?</th><td>B2</td><td>C2</td><td>?</td></tr>' +
        '<tr><th>?</th><td>B3</td><td>?</td><td>?</td></tr>' +
      '</tbody></table>',

      '<table><tbody>' +
        '<tr><th rowspan="3">A1</th><td>B1</td><td colspan="2">C1</td></tr>' +
        '<tr><td>B2</td><td rowspan="2" colspan="2">C2</td></tr>' +
        '<tr><td>B3</td></tr>' +
      '</tbody></table>',

      [
        { row: 0, column: 0 },
        { row: 0, column: 2 },
        { row: 1, column: 1 }
      ]
    );
  }
);