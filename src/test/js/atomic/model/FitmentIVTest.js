test(
  'FitmentIVTest',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.test.Fitment',
    'ephox.snooker.test.TestGenerator',
    'global!Array',
    'global!Math'
  ],

  function (Arr, Fun, Structs, Fitment, TestGenerator, Array, Math) {
    var gridMin = 1;  // 1x1 grid is the min
    var gridMax = 150;

    var measureTest = Fitment.measureTest;
    var tailorIVTest = Fitment.tailorIVTest;
    var mergeGridsTest = Fitment.mergeGridsTest;
    var suite = Fitment.suite;
    var generator = TestGenerator;

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

    var inVariantRunner = function (mvTest, times) {
      for (var i = 1, testSpec; i <= times; i++) {
        testSpec = mvTest();
        console.log('testing:', mvTest, i + ' / ' + times, ' params: ' + JSON.stringify(testSpec.params));
        testSpec.test();
      }
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
      // because arrays start from 0 we -1
      var row = rand(0, gridSpec.rows()-1);
      var col = rand(0, gridSpec.cols()-1);
      return Structs.address(row, col);
    };

    var deltaGen = function () {
      var rowDelta = rand(-gridMax, gridMax);
      var colDelta = rand(-gridMax, gridMax);
      return {
        rowDelta: Fun.constant(rowDelta),
        colDelta: Fun.constant(colDelta)
      };

    };

    var measureIVTest = function () {
      var gridSpecA = gridGen();
      var gridSpecB = gridGen();
      var start = startGen(gridSpecA);

      var rowDelta = (gridSpecA.rows() - start.row()) - gridSpecB.rows();
      var colDelta = (gridSpecA.cols() - start.column()) - gridSpecB.cols();

      var info = {
        start: {
          row: start.row(),
          column: start.column()
        },
        gridA: {
          rows: gridSpecA.rows(),
          cols: gridSpecA.cols()
        },
        gridB: {
          rows: gridSpecB.rows(),
          cols: gridSpecB.cols()
        }
      };

      var test = Fun.curry(measureTest, {
        rowDelta: rowDelta,
        colDelta: colDelta
      }, start, gridSpecA.grid(), gridSpecB.grid(), Fun.noop );

      return {
        params: info,
        test: test
      };
    };

    var tailorTestIVTest = function () {
      var gridSpecA = gridGen();
      var start = startGen(gridSpecA);
      var delta = deltaGen();
      var expectedRows = delta.rowDelta() < 0 ? Math.abs(delta.rowDelta()) + gridSpecA.rows() : gridSpecA.rows();
      var expectedCols = delta.colDelta() < 0 ? Math.abs(delta.colDelta()) + gridSpecA.cols() : gridSpecA.cols();

      var info = {
        start: {
          row: start.row(),
          column: start.column()
        },
        gridA: {
          rows: gridSpecA.rows(),
          cols: gridSpecA.cols()
        },
        delta: {
          rowDelta: delta.rowDelta(),
          colDelta: delta.colDelta()
        },
        expected: {
          rows: expectedRows,
          cols: expectedCols
        }
      };

      var test = Fun.curry(tailorIVTest, {
        rows: expectedRows,
        cols: expectedCols
      }, start, gridSpecA.grid(), delta, generator);

      return {
        params: info,
        test: test
      };
    };

    inVariantRunner(measureIVTest, 1000);
    inVariantRunner(tailorTestIVTest, 1000);

  }
);