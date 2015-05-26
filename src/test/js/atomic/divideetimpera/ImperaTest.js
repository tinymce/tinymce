test(
  'ImperaTest',

  [
    'ephox.scullion.Struct',
    'ephox.snooker.model.Impera'
  ],

  function (Struct, Impera) {

    var inputRangeStruct = Struct.immutableBag([ 'startCol', 'startRow', 'endCol', 'endRow' ], []);


    var structureA = [ [ 'a', 'b', 'c' ], [ 'd', 'e', 'f'] ];
    var rangeA = inputRangeStruct({
      startCol: 0,
      startRow: 0,
      endCol: 1,
      endRow: 0
    });
    var leadCellA = 'a';


    var resultA = Impera.render(structureA, rangeA, leadCellA);
    var expectedA = [
      [ 'a', 'a', 'c' ],
      [ 'd', 'e', 'f' ]
    ];
    assert.eq(expectedA, resultA);
  }
);