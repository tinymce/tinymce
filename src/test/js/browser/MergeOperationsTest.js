test(
  'MergeOperationsTest',

  [
    'ephox.snooker.test.Assertions'
  ],

  function (Assertions) {
    Assertions.checkMerge(
      'SimpleCase - merging textnodes should move all content into the first cell separarted by BRs',
      // Border = 1 would be here, but it is removed so that we can assert html
      '<table style="border-collapse: collapse;"><tbody>' +
        '<tr><td>a<br>b<br>d<br>e<br></td><td></td><td>c</td></tr>' +
        '<tr><td></td><td></td><td>f</td></tr>' +
        '<tr><td>g</td><td>h</td><td>i</td></tr>' +
      '</tbody></table>',

      '<table border="1" style="border-collapse: collapse;"><tbody>' +
        '<tr><td>a</td><td>b</td><td>c</td></tr>' +
        '<tr><td>d</td><td>e</td><td>f</td></tr>' +
        '<tr><td>g</td><td>h</td><td>i</td></tr>' +
      '</tbody></table>',

      [
        { row: 0, column: 0 }, { row: 0, column: 1 },
        { row: 1, column: 0 }, { row: 1, column: 1 }
      ]
    );
  }
);