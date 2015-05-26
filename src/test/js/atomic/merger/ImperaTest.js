test(
  'ImperaTest',

  [
    'ephox.peanut.Fun',
    'ephox.scullion.Struct',
    'ephox.snooker.model.Impera'
  ],

  function (Fun, Struct, Impera) {
    var comparator = Fun.tripeEquals;
    var inputRangeStruct = Struct.immutableBag([ 'startCol', 'startRow', 'endCol', 'endRow' ], []);


    var structureA = [ [ 'a', 'b', 'c' ] ];
    var rangeA = inputRangeStruct({
      startCol: 0,
      startRow: 0,
      endCol: 2,
      endRow: 0
    });


    var leadCellA = 'a';


    var resultA = Impera.render(structureA, rangeA, leadCellA, comparator);
    var expectedA = {
      element: 'tr',
      cells: [
        {
          element: 'a',
          colspan: 3,
          rowspan: 1
        }
      ]
    };
    assert.eq(expectedA, resultA);
  }
);