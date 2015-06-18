test(
  'FitmentMVTest',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.Fitment',
    'global!Array',
    'global!Math'
  ],

  function (Arr, Fun, Structs, Fitment, Array, Math) {
    var gridMin = 0;
    var gridMax = 150;

    var grid = function (rows, cols) {
      return Arr.map(new Array(rows), function (row, r) {
        return Arr.map(new Array(cols), function (cols, c) {
          return r + '-' + c;
        });
      });
    };

    var rand = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    var run = function (mvTest, times) {
      for (var i = 1; i < times; i++) {
        mvTest();
        console.log('testing: ', mvTest, i + ' / ' + times);
      };
    };

    var gridGen = function () {
      var cols = rand(gridMin, gridMax);
      var rows = rand(gridMin, gridMax);
      return {
        rows: Fun.constant(rows),
        cols: Fun.constant(cols),
        grid: Fun.constant(grid(rows, cols))
      };
    };

    var startGen = function (gridSpec) {
      var row = rand(0, gridSpec.rows());
      var col = rand(0, gridSpec.cols());
      return Structs.address(row, col);
    };

    var measureTest = function (expected, startAddress, gridA, gridB) {
      // Try put gridB into gridA at the startAddress
      // returns a delta,
      // colDelta = -3 means gridA is 3 columns too short
      // rowDelta = 3 means gridA can fit gridB with 3 rows to spare

      var tux = Fitment.measure(startAddress, gridA, gridB);
      assert.eq(expected.rowDelta, tux.rowDelta(), 'rowDelta expected: ' + expected.rowDelta + ' actual: '+ tux.rowDelta());
      assert.eq(expected.colDelta, tux.colDelta(), 'colDelta expected: ' + expected.colDelta + ' actual: '+ tux.colDelta());
    };

    var measureMVTest = function () {
      var gridSpecA = gridGen();
      var gridSpecB = gridGen();
      var start = startGen(gridSpecA);

      var rowDelta = (gridSpecA.rows() - start.row()) - gridSpecB.rows();
      var colDelta = (gridSpecA.cols() - start.column()) - gridSpecB.cols();

      measureTest({
        rowDelta: rowDelta,
        colDelta: colDelta
      }, start, gridSpecA.grid(), gridSpecB.grid(), Fun.noop );
    };


    run(measureMVTest, 100);



  }
);