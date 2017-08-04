define(
  'ephox.snooker.test.TableMerge',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.TableMerge',
    'ephox.snooker.test.Fitment'
  ],

  function (Arr, Fun, Structs, TableMerge, Fitment) {
    var mapToStructGrid = function (grid) {
      return Arr.map(grid, function (row) {
        return Structs.rowcells(row, 'tbody');
      });
    };
    
    var assertGrids = function (expected, actual) {
      assert.eq(expected.length, actual.length);
      Arr.each(expected, function (row, i) {
        assert.eq(row.cells(), actual[i].cells());
        assert.eq(row.section(), actual[i].section());
      });
    };

    var mergeTest = function (expected, startAddress, gridA, gridB, generator, comparator) {
      // The last step, merge cells from gridB into gridA
      var nuGrid = TableMerge.merge(startAddress, mapToStructGrid(gridA()), mapToStructGrid(gridB()), generator(), comparator);
      nuGrid.fold(function (err) {
        assert.eq(expected.error, err);
      }, function (grid) {
        assertGrids(expected, grid);
      });
    };

    var mergeIVTest = function (asserter, startAddress, gridSpecA, gridSpecB, generator, comparator) {
      // The last step, merge cells from gridB into gridA
      var nuGrid = TableMerge.merge(startAddress, gridSpecA.grid(), gridSpecB.grid(), generator(), comparator);
      asserter(nuGrid, startAddress, gridSpecA, gridSpecB);
    };

    var suite = function (label, startAddress, gridA, gridB, generator, comparator, expectedMeasure, expectedTailor, expectedMergeGrids) {
      var structGridExpectedTailor = mapToStructGrid(expectedTailor);
      var structGridExpectedMerged = mapToStructGrid(expectedMergeGrids);
      Fitment.measureTest(expectedMeasure, startAddress, gridA, gridB, Fun.noop);
      Fitment.tailorTest(structGridExpectedTailor, startAddress, gridA, {
        rowDelta: Fun.constant(expectedMeasure.rowDelta),
        colDelta: Fun.constant(expectedMeasure.colDelta)
      }, generator);
      mergeTest(structGridExpectedMerged, startAddress, gridA, gridB, generator, comparator);
    };

    return {
      mergeTest: mergeTest,
      mergeIVTest: mergeIVTest,
      suite: suite
    };
  }
);